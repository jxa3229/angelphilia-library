import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { isUsableBodyCode, parseBodyCompositionFromText } from './body-composition.mjs'

const root = process.cwd()
const outputDir = path.join(root, 'output', 'body-code-audit')
const recordsFile = path.join(root, 'src', 'data', 'records.json')
const realartFile = path.join(root, 'src', 'data', 'realartArchive.json')
const rawRealartFile = path.join(root, '.cache', 'realart-products.json')
const bodyCompositionOverridesFile = path.join(root, 'output', 'body-code-audit', 'body-composition-overrides.json')

const legacyRecords = JSON.parse(await readFile(recordsFile, 'utf8'))
const realartRecords = JSON.parse(await readFile(realartFile, 'utf8'))
const rawRealart = await readRawRealartProducts()
const bodyCompositionOverrides = await readBodyCompositionOverrides()
const allRecords = [
  ...legacyRecords.map((record) => ({ ...record, dataset: 'records.json' })),
  ...realartRecords.map((record) => ({ ...record, dataset: 'realartArchive.json' }))
]

const manualReview = []
const parsedRecords = []

for (const record of allRecords) {
  const code = record.bodyCode || ''
  if (isUsableBodyCode(code)) {
    parsedRecords.push(toAuditRecord(record, 'parsed'))
    continue
  }

  const sourceReview = await retrySourceReview(record, rawRealart)
  if (sourceReview?.code && isUsableBodyCode(sourceReview.code)) {
    parsedRecords.push({
      ...toAuditRecord(record, 'parsed-on-audit'),
      bodyCode: sourceReview.code,
      bodyCodeSource: sourceReview.source
    })
    continue
  }

  manualReview.push({
    ...toAuditRecord(record, 'manual-review'),
    reason: sourceReview?.reason || '源数据未包含可解析的上胴/下胴/フトモモ Type 配置',
    checkedSource: sourceReview?.source || record.bodyCodeSource || null
  })
}

const summary = {
  generatedAt: new Date().toISOString(),
  totalRecords: allRecords.length,
  legacyRecords: legacyRecords.length,
  realartRecords: realartRecords.length,
  parsedCount: parsedRecords.length,
  manualReviewCount: manualReview.length,
  parsedRate: allRecords.length ? Number((parsedRecords.length / allRecords.length).toFixed(4)) : 0,
  note: 'bodyCode 使用核心三段：上胴 + 下胴 + フトモモ；スネ/腕/手/足保存在 bodyComposition 但不计入 XXX code。'
}

await mkdir(outputDir, { recursive: true })
await writeJson(path.join(outputDir, 'summary.json'), summary)
await writeJson(path.join(outputDir, 'manual-review.json'), manualReview)
await writeFile(path.join(outputDir, 'manual-review.md'), renderManualReview(summary, manualReview), 'utf8')

console.log(`Audited ${summary.totalRecords} doll records`)
console.log(`Parsed: ${summary.parsedCount}`)
console.log(`Manual review: ${summary.manualReviewCount}`)
console.log(`Report: ${path.relative(root, outputDir)}`)

async function retrySourceReview(record, rawProducts) {
  if (record.dataset === 'records.json' && record.bodyCodeSource?.path) {
    if (record.bodyCodeSource?.type === 'body-composition-overrides.json') {
      const override = bodyCompositionOverrides.get(record.bodyCodeSource.sourceUrl)
        || [...bodyCompositionOverrides.values()].find((item) => item.sourceLine === record.bodyCodeSource.line)
      if (!override) {
        return {
          reason: '重新检阅 body composition override 失败：找不到 override 记录',
          source: record.bodyCodeSource
        }
      }

      const parsed = parseBodyCompositionFromText(override.sourceLine, { source: record.bodyCodeSource.path })
      if (parsed) {
        return {
          code: parsed.code,
          source: {
            type: 'body-composition-overrides.json',
            path: record.bodyCodeSource.path,
            sourceType: override.sourceType || '',
            sourceUrl: override.sourceUrl || '',
            line: parsed.sourceLine
          }
        }
      }

      return {
        reason: '重新检阅 body composition override 后仍未解析到完整三段配置',
        source: record.bodyCodeSource
      }
    }

    try {
      const markdown = await readFile(path.join(root, record.bodyCodeSource.path), 'utf8')
      const parsed = parseBodyCompositionFromText(markdown, { source: record.bodyCodeSource.path })
      if (parsed) return { code: parsed.code, source: { type: 'record.md', path: record.bodyCodeSource.path, line: parsed.sourceLine } }
      return { reason: '重新检阅 record.md 后仍未解析到完整三段配置', source: { type: 'record.md', path: record.bodyCodeSource.path } }
    } catch (error) {
      return { reason: '重新读取 record.md 失败：源文件不存在或路径不匹配', source: { type: 'record.md', path: record.bodyCodeSource.path, error: error.message } }
    }
  }

  if (record.dataset === 'records.json' && record.bodyCodeSource?.type === 'realart-products.json') {
    const product = rawProducts.get(String(record.bodyCodeSource.productId))
    if (!product) {
      return {
        reason: '重新检阅 Real Art fallback 失败：找不到 productId',
        source: {
          type: 'realart-products.json',
          productId: record.bodyCodeSource.productId,
          sourceUrl: record.bodyCodeSource.sourceUrl,
          fallbackFrom: record.bodyCodeSource.fallbackFrom
        }
      }
    }

    const parsed = parseBodyCompositionFromText(product.description, { source: 'realart-products.json' })
    if (parsed) {
      return {
        code: parsed.code,
        source: {
          type: 'realart-products.json',
          productId: product.id,
          sourceUrl: product.url,
          fallbackFrom: record.bodyCodeSource.fallbackFrom,
          line: parsed.sourceLine
        }
      }
    }
    return {
      reason: '重新检阅 Real Art fallback 描述后仍未解析到完整三段配置',
      source: {
        type: 'realart-products.json',
        productId: product.id,
        sourceUrl: product.url,
        fallbackFrom: record.bodyCodeSource.fallbackFrom
      }
    }
  }

  if (record.dataset === 'realartArchive.json' && record.externalProductId) {
    const product = rawProducts.get(String(record.externalProductId))
    if (!product) {
      return { reason: '重新检阅 Real Art raw product 失败：找不到 externalProductId', source: { type: 'realart-products.json', productId: record.externalProductId } }
    }

    const parsed = parseBodyCompositionFromText(product.description, { source: 'realart-products.json' })
    if (parsed) {
      return { code: parsed.code, source: { type: 'realart-products.json', productId: record.externalProductId, line: parsed.sourceLine } }
    }
    return { reason: '重新检阅 Real Art 描述后仍未解析到完整三段配置', source: { type: 'realart-products.json', productId: record.externalProductId, sourceUrl: record.sourceUrl } }
  }

  return { reason: '记录缺少可回查的源数据路径或 externalProductId', source: null }
}

async function readRawRealartProducts() {
  try {
    const products = JSON.parse(await readFile(rawRealartFile, 'utf8'))
    return new Map(products.map((product) => [String(product.id), product]))
  } catch {
    return new Map()
  }
}

async function readBodyCompositionOverrides() {
  try {
    const overrides = JSON.parse(await readFile(bodyCompositionOverridesFile, 'utf8'))
    return new Map(overrides.map((record) => [record.sourceUrl || record.recordPath, record]))
  } catch {
    return new Map()
  }
}

function toAuditRecord(record, status) {
  return {
    status,
    dataset: record.dataset,
    year: record.year,
    group: record.group,
    number: record.number,
    name: record.name,
    title: record.title,
    body: record.body || '',
    bodyCode: record.bodyCode || '',
    source: record.source || '',
    sourceUrl: record.sourceUrl || '',
    bodyCodeSource: record.bodyCodeSource || null,
    folder: record.folder || '',
    externalProductId: record.externalProductId || ''
  }
}

function renderManualReview(summary, records) {
  const lines = [
    '# Body Code Manual Review',
    '',
    `- Total records: ${summary.totalRecords}`,
    `- Parsed records: ${summary.parsedCount}`,
    `- Manual review records: ${summary.manualReviewCount}`,
    '',
    '| # | Dataset | Year | Number | Name | Current body | Source | Reason |',
    '|---|---|---:|---|---|---|---|---|'
  ]

  for (const [index, record] of records.entries()) {
    const source = record.sourceUrl
      ? `[link](${record.sourceUrl})`
      : record.checkedSource?.sourceUrl
        ? `[link](${record.checkedSource.sourceUrl})`
      : record.checkedSource?.path || record.folder || ''
    lines.push([
      index + 1,
      escapeCell(record.dataset),
      escapeCell(record.year),
      escapeCell(record.number),
      escapeCell(record.name || record.title),
      escapeCell(record.body),
      escapeCell(source),
      escapeCell(record.reason)
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'))
  }

  return `${lines.join('\n')}\n`
}

function escapeCell(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}
