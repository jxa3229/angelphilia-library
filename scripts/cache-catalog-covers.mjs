import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)
const root = process.cwd()
const directory = path.join(root, 'public', 'catalog-covers')
const manifestFile = path.join(root, 'src/data/catalogCovers.json')
const records = (await Promise.all(['records', 'realartArchive', 'limitedOfficial'].map(async (name) =>
  JSON.parse(await readFile(path.join(root, `src/data/${name}.json`), 'utf8'))))).flat()
const sources = [...new Set(records.map((record) => record.safeImages?.[0] || record.safeImageUrl || record.imageUrl || '')
  .filter((url) => /^https?:\/\//i.test(url)))].sort()
let manifest = {}
try { manifest = JSON.parse(await readFile(manifestFile, 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }

function imageExtension(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg'
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png'
  if (/^GIF8[79]a/.test(buffer.subarray(0, 6).toString('ascii'))) return 'gif'
  if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return 'webp'
  throw new Error('Invalid image content')
}

async function isCached(url) {
  const cached = manifest[url]
  if (!/^catalog-covers\/[a-f0-9]{24}\.(jpg|png|gif|webp)$/.test(cached || '')) return false
  try { imageExtension(await readFile(path.join(root, 'public', cached))); return true } catch { return false }
}

if (process.argv.includes('--check')) {
  const missing = []
  for (const url of sources) if (!(await isCached(url))) missing.push(url)
  console.log(`Catalog covers: ${sources.length - missing.length}/${sources.length} valid local files`)
  if (missing.length) { console.error(missing.join('\n')); process.exitCode = 1 }
} else {
  await mkdir(directory, { recursive: true })
  let next = 0
  let completed = 0
  const failures = []
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < sources.length) {
      const url = sources[next++]
      try {
        if (!(await isCached(url))) {
          const args = ['--silent', '--show-error', '--fail', '--location', '--connect-timeout', '8', '--max-time', '25', '--retry', '1', '--retry-delay', '1']
          if (process.env.CATALOG_IMAGE_PROXY) args.push('--proxy', process.env.CATALOG_IMAGE_PROXY)
          args.push(url)
          const { stdout } = await run(process.platform === 'win32' ? 'curl.exe' : 'curl', args,
            { encoding: 'buffer', maxBuffer: 10 * 1024 * 1024, windowsHide: true })
          const extension = imageExtension(stdout)
          const filename = `${createHash('sha256').update(url).digest('hex').slice(0, 24)}.${extension}`
          await writeFile(path.join(directory, filename), stdout)
          manifest[url] = `catalog-covers/${filename}`
        }
      } catch (error) { failures.push({ url, reason: error.message.split('\n')[0] }) }
      completed++
      if (completed % 20 === 0 || completed === sources.length) console.log(`Catalog covers checked/cached: ${completed}/${sources.length}`)
    }
  }))
  manifest = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  if (failures.length) { console.error(JSON.stringify(failures, null, 2)); process.exitCode = 1 }
}
