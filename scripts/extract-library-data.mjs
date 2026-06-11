import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const root = process.cwd()
const sourceFile = path.join(root, 'index_local.html')
const outputFile = path.join(root, 'src', 'data', 'records.json')
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

const html = await readFile(sourceFile, 'utf8')
const match = html.match(/<script id="library-data" type="application\/json">([\s\S]*?)<\/script>/)

if (!match) {
  throw new Error('Cannot find library-data JSON in index_local.html')
}

const records = JSON.parse(match[1])

for (const record of records) {
  record.images = await findRecordImages(record)
  record.safeFolder = safeFolderName(record.folder)
  record.safeImages = record.images.map((item) => toSafeAssetPath(record, item))
  record.detailKey = record.safeFolder
  if (!record.imageUrl && record.images.length > 0) {
    record.imageUrl = record.images[0]
  }
  record.safeImageUrl = toSafeAssetPath(record, record.imageUrl)
}

await mkdir(path.dirname(outputFile), { recursive: true })
await writeFile(outputFile, `${JSON.stringify(records, null, 2)}\n`, 'utf8')

console.log(`Synced ${records.length} records to ${path.relative(root, outputFile)}`)

async function findRecordImages(record) {
  if (!record.folder) return record.imageUrl ? [record.imageUrl] : []

  const folderPath = path.join(root, 'records', record.folder)

  try {
    const entries = await readdir(folderPath, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
      .map((entry) => `records/${record.folder}/${entry.name}`)
  } catch {
    return record.imageUrl ? [record.imageUrl] : []
  }
}

function toSafeAssetPath(record, assetPath) {
  if (!assetPath || !record.safeFolder || !record.folder) return assetPath || ''
  const prefix = `records/${record.folder}/`
  if (!assetPath.startsWith(prefix)) return assetPath
  return `media/${record.safeFolder}/${assetPath.slice(prefix.length)}`
}

function safeFolderName(folder) {
  if (!folder) return ''
  return `r-${createHash('sha1').update(folder, 'utf8').digest('hex').slice(0, 16)}`
}
