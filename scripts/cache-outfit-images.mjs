import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_PATH = path.resolve('src/data/outfits.json')
const OUT_DIR = path.resolve('public/outfits')
const PUBLIC_PREFIX = 'outfits'
const CONCURRENCY = 6
const REQUEST_TIMEOUT_MS = 15000

const CONTENT_TYPE_EXT = new Map([
  ['image/jpeg', 'jpg'],
  ['image/jpg', 'jpg'],
  ['image/png', 'png'],
  ['image/gif', 'gif'],
  ['image/webp', 'webp']
])

function isRemote(url) {
  return /^https?:\/\//i.test(url || '')
}

function sanitizeSegment(value) {
  return String(value || 'outfit')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'outfit'
}

function extensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname.toLowerCase()
    const match = pathname.match(/\.([a-z0-9]+)$/)
    if (!match) return ''
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
    return ['jpg', 'png', 'gif', 'webp'].includes(ext) ? ext : ''
  } catch {
    return ''
  }
}

function extensionFromResponse(response, url) {
  const type = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
  return CONTENT_TYPE_EXT.get(type) || extensionFromUrl(url) || 'jpg'
}

async function downloadImage(url, referer) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
  }
  if (referer) headers.Referer = referer

  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.length < 512) throw new Error(`too small (${buffer.length} bytes)`)
      return { buffer, ext: extensionFromResponse(response, url) }
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt))
    }
  }
  throw lastError
}

async function findExistingPublicPath(stem) {
  for (const ext of ['jpg', 'png', 'gif', 'webp']) {
    const filename = `${stem}.${ext}`
    try {
      const stats = await fs.stat(path.join(OUT_DIR, filename))
      if (stats.size > 512) return `${PUBLIC_PREFIX}/${filename}`
    } catch {
      // Try the next known image extension.
    }
  }
  return ''
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })
  const outfits = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'))
  const tasks = []

  outfits.forEach((item) => {
    const images = Array.isArray(item.images) && item.images.length
      ? item.images
      : [item.imageUrl].filter(Boolean)
    const remoteImages = images.filter(isRemote)

    if (remoteImages.length > 0) {
      const sourceImages = new Set(Array.isArray(item.sourceImageUrls) ? item.sourceImageUrls : [])
      if (item.sourceImageUrl) sourceImages.add(item.sourceImageUrl)
      remoteImages.forEach((url) => sourceImages.add(url))
      item.sourceImageUrls = [...sourceImages]
      item.sourceImageUrl = item.sourceImageUrls[0]
    }

    remoteImages.forEach((url, index) => {
      tasks.push({ item, url, index })
    })
  })

  let completed = 0
  const failures = []
  const byUrl = new Map()

  async function runTask(task) {
    const stem = `${sanitizeSegment(task.item.id)}-${String(task.index + 1).padStart(2, '0')}`
    try {
      const existingPublicPath = await findExistingPublicPath(stem)
      if (existingPublicPath) {
        if (Array.isArray(task.item.images) && task.item.images.length) {
          task.item.images[task.index] = existingPublicPath
        }
        if (task.index === 0 || task.item.imageUrl === task.url) {
          task.item.imageUrl = existingPublicPath
        }
        completed += 1
        if (completed % 50 === 0 || completed === tasks.length) {
          console.log(`cached ${completed}/${tasks.length}`)
        }
        return
      }

      let image = byUrl.get(task.url)
      if (!image) {
        image = await downloadImage(task.url, task.item.sourceUrl)
        byUrl.set(task.url, image)
      }

      const filename = `${stem}.${image.ext}`
      const absolutePath = path.join(OUT_DIR, filename)
      const publicPath = `${PUBLIC_PREFIX}/${filename}`
      await fs.writeFile(absolutePath, image.buffer)

      if (Array.isArray(task.item.images) && task.item.images.length) {
        task.item.images[task.index] = publicPath
      }
      if (task.index === 0 || task.item.imageUrl === task.url) {
        task.item.imageUrl = publicPath
      }

      completed += 1
      if (completed % 50 === 0 || completed === tasks.length) {
        console.log(`cached ${completed}/${tasks.length}`)
      }
    } catch (error) {
      failures.push({ id: task.item.id, url: task.url, message: error.message })
    }
  }

  for (let cursor = 0; cursor < tasks.length; cursor += CONCURRENCY) {
    await Promise.all(tasks.slice(cursor, cursor + CONCURRENCY).map(runTask))
  }

  await fs.writeFile(DATA_PATH, `${JSON.stringify(outfits, null, 2)}\n`)

  console.log(JSON.stringify({
    records: outfits.length,
    attempted: tasks.length,
    cached: completed,
    failed: failures.length,
    failures: failures.slice(0, 20)
  }, null, 2))

  if (failures.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
