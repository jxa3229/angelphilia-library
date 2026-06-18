import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const root = process.cwd()
const sourceFile = path.join(root, 'index_local.html')
const outputFile = path.join(root, 'src', 'data', 'records.json')
const privateManifestFile = path.join(root, '.cache', 'library-records-private.json')
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

const html = await readFile(sourceFile, 'utf8')
const match = html.match(/<script id="library-data" type="application\/json">([\s\S]*?)<\/script>/)

if (!match) {
  throw new Error('Cannot find library-data JSON in index_local.html')
}

const sourceRecords = JSON.parse(match[1])
const records = []
const privateRecords = []

for (const sourceRecord of sourceRecords) {
  const safeFolder = safeFolderName(sourceRecord.folder)
  const images = await findRecordImages(sourceRecord)
  const safeImages = images.map((item) => toSafeAssetPath(sourceRecord, safeFolder, item))
  const safeImageUrl = toSafeAssetPath(sourceRecord, safeFolder, sourceRecord.imageUrl || images[0])
  const detailKey = safeFolder

  records.push({
    year: sourceRecord.year,
    group: sourceRecord.group,
    series: sourceRecord.series,
    number: sourceRecord.number,
    name: sourceRecord.name,
    title: sourceRecord.title,
    variant: sourceRecord.variant,
    head: sourceRecord.head,
    body: sourceRecord.body,
    skin: sourceRecord.skin,
    source: '网络数据',
    sourceUrl: '',
    folder: safeFolder,
    imageUrl: safeImageUrl,
    images: safeImages,
    safeFolder,
    safeImages,
    detailKey,
    safeImageUrl
  })

  if (sourceRecord.folder) {
    privateRecords.push({
      detailKey,
      safeFolder,
      sourceFolder: sourceRecord.folder
    })
  }
}

await mkdir(path.dirname(outputFile), { recursive: true })
await writeFile(outputFile, `${JSON.stringify(records, null, 2)}\n`, 'utf8')
await mkdir(path.dirname(privateManifestFile), { recursive: true })
await writeFile(privateManifestFile, `${JSON.stringify(privateRecords, null, 2)}\n`, 'utf8')

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

function toSafeAssetPath(record, safeFolder, assetPath) {
  if (!assetPath || !safeFolder || !record.folder) return ''
  const prefix = `records/${record.folder}/`
  if (!assetPath.startsWith(prefix)) return ''
  return `media/${safeFolder}/${assetPath.slice(prefix.length)}`
}

function safeFolderName(folder) {
  if (!folder) return ''
  return `r-${createHash('sha1').update(folder, 'utf8').digest('hex').slice(0, 16)}`
}
