import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { parseBodyCodeFromSummary, parseBodyCompositionFromText } from './body-composition.mjs'

const root = process.cwd()
const sourceFile = path.join(root, 'index_local.html')
const outputFile = path.join(root, 'src', 'data', 'records.json')
const privateManifestFile = path.join(root, '.cache', 'library-records-private.json')
const sourceWebReviewFile = path.join(root, 'output', 'body-code-audit', 'source-web-review.json')
const bodyCompositionOverridesFile = path.join(root, 'output', 'body-code-audit', 'body-composition-overrides.json')
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

const html = await readFile(sourceFile, 'utf8')
const match = html.match(/<script id="library-data" type="application\/json">([\s\S]*?)<\/script>/)

if (!match) {
  throw new Error('Cannot find library-data JSON in index_local.html')
}

const sourceRecords = JSON.parse(match[1])
const sourceUrlOverrides = await readSourceUrlOverrides()
const confirmedSourceUrls = await readConfirmedSourceUrls()
const sourceWebBodyCompositions = await readSourceWebBodyCompositions()
const bodyCompositionOverrides = await readBodyCompositionOverrides()
const records = []
const privateRecords = []

for (const sourceRecord of sourceRecords) {
  const safeFolder = safeFolderName(sourceRecord.folder)
  const images = await findRecordImages(sourceRecord)
  const safeImages = images.map((item) => toSafeAssetPath(sourceRecord, safeFolder, item))
  const safeImageUrl = toSafeAssetPath(sourceRecord, safeFolder, sourceRecord.imageUrl || images[0])
  const detailKey = safeFolder
  const bodyComposition = await parseRecordBodyComposition(sourceRecord)

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
    bodyCode: bodyComposition?.code || '',
    bodyComposition: bodyComposition?.parts || null,
    bodyCodeSource: buildBodyCodeSource(sourceRecord, bodyComposition),
    skin: sourceRecord.skin,
    source: '网络数据',
    sourceUrl: sourceRecord.sourceUrl
      || confirmedSourceUrls.get(sourceRecord.recordPath)
      || sourceWebBodyCompositions.get(sourceRecord.recordPath)?.sourceUrl
      || sourceUrlOverrides.get(sourceRecord.recordPath)
      || '',
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
      sourceFolder: sourceRecord.folder,
      recordPath: sourceRecord.recordPath || '',
      sourceUrl: sourceRecord.sourceUrl || ''
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

function buildBodyCodeSource(record, bodyComposition) {
  if (!record.folder) return null

  if (bodyComposition?.source === 'body-composition-overrides.json') {
    return {
      type: 'body-composition-overrides.json',
      path: bodyComposition.overridePath,
      sourceType: bodyComposition.sourceType,
      sourceUrl: bodyComposition.sourceUrl,
      line: bodyComposition.sourceLine || ''
    }
  }

  if (bodyComposition?.source === 'source-web-review.json') {
    return {
      type: 'source-web-review.json',
      path: bodyComposition.reviewPath,
      confidence: bodyComposition.confidence,
      sourceUrl: bodyComposition.sourceUrl,
      productId: bodyComposition.productId,
      line: bodyComposition.sourceLine || ''
    }
  }

  return {
    type: 'record.md',
    path: `records/${record.folder}/record.md`,
    line: bodyComposition?.sourceLine || ''
  }
}

async function parseRecordBodyComposition(record) {
  const summaryComposition = parseBodyCodeFromSummary(record.body, { source: 'index_local.html body' })
  const overrideComposition = parseOverrideBodyComposition(record)
  if (overrideComposition?.skip) return null
  if (overrideComposition) return overrideComposition
  const sourceWebComposition = parseSourceWebBodyComposition(record)
  if (!record.folder) return null

  try {
    const markdown = await readFile(path.join(root, 'records', record.folder, 'record.md'), 'utf8')
    return parseBodyCompositionFromText(markdown, { source: 'record.md' }) || sourceWebComposition || summaryComposition
  } catch {
    return sourceWebComposition || summaryComposition
  }
}

function parseOverrideBodyComposition(record) {
  const override = bodyCompositionOverrides.get(record.recordPath)
  if (override?.skipReason) {
    return {
      code: '',
      parts: null,
      sourceLine: override.skipReason,
      source: 'body-composition-overrides.json',
      overridePath: 'output/body-code-audit/body-composition-overrides.json',
      sourceType: override.sourceType || '',
      sourceUrl: override.sourceUrl || '',
      skip: true
    }
  }
  if (!override?.sourceLine) return null

  const parsed = parseBodyCompositionFromText(override.sourceLine, { source: 'body-composition-overrides.json' })
  if (!parsed) return null

  return {
    ...parsed,
    source: 'body-composition-overrides.json',
    overridePath: 'output/body-code-audit/body-composition-overrides.json',
    sourceType: override.sourceType || '',
    sourceUrl: override.sourceUrl || ''
  }
}

async function readConfirmedSourceUrls() {
  try {
    const review = JSON.parse(await readFile(sourceWebReviewFile, 'utf8'))
    return new Map(
      (review.records || [])
        .filter((record) => record.confidence === 'confirmed-source-url' && record.sourceUrl && record.recordPath)
        .map((record) => [record.recordPath, record.sourceUrl])
    )
  } catch {
    return new Map()
  }
}

async function readSourceUrlOverrides() {
  try {
    const sourceUrlOverridesFile = path.join(root, 'output', 'body-code-audit', 'source-url-overrides.json')
    const overrides = JSON.parse(await readFile(sourceUrlOverridesFile, 'utf8'))
    return new Map(
      overrides
        .filter((record) => record.recordPath && record.sourceUrl)
        .map((record) => [record.recordPath, record.sourceUrl])
    )
  } catch {
    return new Map()
  }
}

function parseSourceWebBodyComposition(record) {
  const sourceWebRecord = sourceWebBodyCompositions.get(record.recordPath)
  if (!sourceWebRecord?.sourceLine) return null

  const parsed = parseBodyCompositionFromText(sourceWebRecord.sourceLine, { source: 'source-web-review.json' })
  if (!parsed) return null

  return {
    ...parsed,
    source: 'source-web-review.json',
    reviewPath: 'output/body-code-audit/source-web-review.json',
    confidence: sourceWebRecord.confidence || '',
    sourceUrl: sourceWebRecord.sourceUrl || '',
    productId: sourceWebRecord.productId || ''
  }
}

async function readSourceWebBodyCompositions() {
  try {
    const review = JSON.parse(await readFile(sourceWebReviewFile, 'utf8'))
    const allowedConfidence = new Set(['confirmed-source-url', 'high-candidate', 'candidate'])
    return new Map(
      (review.records || [])
        .filter((record) => allowedConfidence.has(record.confidence))
        .filter((record) => record.recordPath && record.bodyCode && record.sourceLine)
        .map((record) => [
          record.recordPath,
          {
            confidence: record.confidence,
            sourceUrl: record.sourceUrl || record.candidateSource?.url || '',
            productId: record.candidateSource?.productId || '',
            sourceLine: record.sourceLine
          }
        ])
    )
  } catch {
    return new Map()
  }
}

async function readBodyCompositionOverrides() {
  try {
    const overrides = JSON.parse(await readFile(bodyCompositionOverridesFile, 'utf8'))
    return new Map(overrides.map((record) => [record.recordPath, record]))
  } catch {
    return new Map()
  }
}
