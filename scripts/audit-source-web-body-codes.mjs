import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { parseBodyCompositionFromText } from './body-composition.mjs'

const root = process.cwd()
const sourceFile = path.join(root, 'index_local.html')
const realartProductsFile = path.join(root, '.cache', 'realart-products.json')
const outputDir = path.join(root, 'output', 'body-code-audit')
const overridesFile = path.join(outputDir, 'source-url-overrides.json')
const sourceWebCacheDir = path.join(root, '.cache', 'source-web-pages')

const sourceRecords = await readIndexRecords()
const realartProducts = await readJson(realartProductsFile, [])
const sourceOverrides = new Map((await readJson(overridesFile, [])).map((item) => [item.recordPath, item]))
const missingRecords = sourceRecords.filter((record) => {
  return record.recordPath && !existsSync(path.join(root, record.recordPath))
})

const reviews = missingRecords.map((record) => reviewMissingRecord(record, realartProducts))
const summary = {
  generatedAt: new Date().toISOString(),
  totalMissingRecordMd: reviews.length,
  bySource: countBy(reviews, (item) => item.source || 'unknown'),
  byConfidence: countBy(reviews, (item) => item.confidence),
  confirmedBodyCodeCount: reviews.filter((item) => item.bodyCode && item.confidence === 'confirmed-source-url').length,
  candidateBodyCodeCount: reviews.filter((item) => item.bodyCode && item.confidence !== 'confirmed-source-url').length,
  note: '本报告复核 record.md 缺失记录的来源网页候选；confirmed/high-candidate/candidate 可进入生成链路，weak-candidate 与 not-found 保留人工。'
}

await mkdir(outputDir, { recursive: true })
await writeJson(path.join(outputDir, 'source-web-review.json'), { summary, records: reviews })
await writeFile(path.join(outputDir, 'source-web-review.md'), renderMarkdown(summary, reviews), 'utf8')

console.log(`Reviewed ${summary.totalMissingRecordMd} missing record.md entries`)
console.log(`Report: ${path.relative(root, path.join(outputDir, 'source-web-review.md'))}`)

async function readIndexRecords() {
  const html = await readFile(sourceFile, 'utf8')
  const start = '<script id="library-data" type="application/json">'
  const startIndex = html.indexOf(start)
  const endIndex = html.indexOf('</script>', startIndex)
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Cannot find library-data JSON in index_local.html')
  }
  return JSON.parse(html.slice(startIndex + start.length, endIndex))
}

function reviewMissingRecord(record, products) {
  const override = sourceOverrides.get(record.recordPath)
  const overrideReview = reviewOverrideSource(record, override)
  if (overrideReview) return overrideReview

  const candidates = findRealartCandidates(record, products)
  const bestCandidate = candidates[0] || null
  const bodyComposition = bestCandidate
    ? parseBodyCompositionFromText(bestCandidate.description, { source: 'realart-products.json' })
    : null

  const confidence = classifyConfidence(record, bestCandidate)
  return {
    year: record.year || '',
    group: record.group || '',
    series: record.series || '',
    number: record.number || '',
    name: record.name || '',
    title: record.title || '',
    variant: record.variant || '',
    head: record.head || '',
    body: record.body || '',
    skin: record.skin || '',
    source: record.source || '',
    sourceUrl: record.sourceUrl || '',
    recordPath: record.recordPath || '',
    folder: record.folder || '',
    bodyCode: bodyComposition?.code || '',
    bodyComposition: bodyComposition?.parts || null,
    sourceLine: bodyComposition?.sourceLine || '',
    confidence,
    reviewStatus: confidence === 'confirmed-source-url'
      ? 'confirmed'
      : bodyComposition?.code
        ? 'candidate-needs-original-page-check'
        : 'needs-manual-source-search',
    reason: buildReason(record, bestCandidate, bodyComposition, confidence),
    candidateSource: bestCandidate
      ? {
        type: 'realart-products.json',
        productId: bestCandidate.id,
        title: bestCandidate.title,
        model: bestCandidate.model || '',
        url: bestCandidate.url,
        score: bestCandidate.score,
        matchReasons: bestCandidate.matchReasons
      }
      : null,
    additionalCandidates: candidates.slice(1, 4).map((candidate) => ({
      productId: candidate.id,
      title: candidate.title,
      model: candidate.model || '',
      url: candidate.url,
      score: candidate.score,
      matchReasons: candidate.matchReasons
    }))
  }
}

function reviewOverrideSource(record, override) {
  if (!override?.sourceUrl) return null

  const cache = readSourceWebCache(override.sourceUrl)
  const bodyComposition = cache.text
    ? parseBodyCompositionFromText(cache.text, { source: override.sourceUrl })
    : null
  const confidence = cache.ok && bodyComposition?.code ? 'confirmed-source-url' : 'source-url-unparsed'

  return {
    year: record.year || '',
    group: record.group || '',
    series: record.series || '',
    number: record.number || '',
    name: record.name || '',
    title: record.title || '',
    variant: record.variant || '',
    head: record.head || '',
    body: record.body || '',
    skin: record.skin || '',
    source: record.source || '',
    sourceUrl: override.sourceUrl,
    recordPath: record.recordPath || '',
    folder: record.folder || '',
    bodyCode: bodyComposition?.code || '',
    bodyComposition: bodyComposition?.parts || null,
    sourceLine: bodyComposition?.sourceLine || '',
    confidence,
    reviewStatus: confidence === 'confirmed-source-url' ? 'confirmed' : 'needs-manual-source-search',
    reason: confidence === 'confirmed-source-url'
      ? `已通过 ${override.sourceType || 'source-url'} 网页缓存解析 bodyCode=${bodyComposition.code}。`
      : `已找到候选 sourceUrl，但网页抓取失败、404 或正文未包含完整三段 body 配置：${cache.reason}`,
    candidateSource: {
      type: override.sourceType || 'source-url',
      productId: '',
      title: override.sourceUrl,
      model: '',
      url: override.sourceUrl,
      score: 999,
      matchReasons: ['source-url-override']
    },
    additionalCandidates: []
  }
}

function readSourceWebCache(url) {
  const file = path.join(sourceWebCacheDir, `${hashUrl(url)}.json`)
  if (!existsSync(file)) return { ok: false, text: '', reason: 'source web cache missing' }

  try {
    const cache = JSON.parse(readFileSync(file, 'utf8'))
    if (!cache.ok) return { ok: false, text: cache.stdout || '', reason: cache.stderr || `fetch exitCode=${cache.exitCode}` }
    const parsed = JSON.parse(cache.stdout)
    const text = parsed.results?.map((result) => result.raw_content || '').join('\n\n') || cache.stdout || ''
    if (/404\s+找不到|canonical:\s*https:\/\/jiwudoc\.myshopify\.com\/zh-asia\/404/i.test(text)) {
      return { ok: false, text, reason: 'fetched page is 404' }
    }
    return { ok: true, text, reason: '' }
  } catch (error) {
    return { ok: false, text: '', reason: error.message }
  }
}

function classifyConfidence(record, candidate) {
  if (record.sourceUrl && candidate?.url && normalizeUrl(record.sourceUrl) === normalizeUrl(candidate.url)) {
    return 'confirmed-source-url'
  }
  if (candidate?.score >= 16 && !isVariantRisk(record, candidate)) return 'high-candidate'
  if (candidate?.score >= 10) return 'candidate'
  if (candidate) return 'weak-candidate'
  return 'not-found'
}

function buildReason(record, candidate, bodyComposition, confidence) {
  if (!candidate) {
    const hint = record.source === 'JiWu'
      ? '原 index 仅标 JiWu，sourceUrl 为空；需重新检索 JiWu 商品页。'
      : '原 index 仅标 RAP/Moeyo，sourceUrl 为空；需重新检索 RAP old index / Moeyo 原页。'
    return `${hint} 未找到可解析 body code 的本地网页候选。`
  }

  const codeText = bodyComposition?.code ? `候选可解析 bodyCode=${bodyComposition.code}` : '候选页未解析出完整 bodyCode'
  if (confidence === 'confirmed-source-url') return `${codeText}，且 URL 与原记录 sourceUrl 一致。`
  return `${codeText}，但原记录 sourceUrl 为空或不一致；该 URL 只能作为候选，需人工核对是否为原网页/同版本/同批次，尤其注意 SoftSkin、ver.2、プチリニューアル、RAPオリジナルセット。`
}

function findRealartCandidates(record, products) {
  const recordNumber = normalizeRecordNumber(record.number)
  const recordName = normalizeProductText(record.name || record.title)
  const recordTitle = normalizeProductText(record.title)
  const recordHasSoftSkin = /SOFTSKIN|SOFT SKIN|ソフトスキン/i.test(record.title)
  const recordHasRenewal = /リニューアル|プチリニューアル|VER\.?\s*\d/i.test(record.title)

  return products
    .filter((product) => product.category === 'doll')
    .map((product) => {
      const title = normalizeProductText(product.title)
      const matchReasons = []
      let score = 0

      if (recordNumber && hasPinkDropsNumber(product.title, recordNumber)) {
        score += 8
        matchReasons.push('same-number')
      }
      if (recordName && title.includes(recordName)) {
        score += 6
        matchReasons.push('name-in-title')
      }
      if (recordTitle && title.includes(recordTitle)) {
        score += 4
        matchReasons.push('title-in-title')
      }
      if (recordHasSoftSkin && /SOFTSKIN|SOFT SKIN|ソフトスキン/i.test(product.title)) {
        score += 2
        matchReasons.push('softskin-match')
      }
      if (recordHasRenewal && /リニューアル|プチリニューアル|VER\.?\s*\d/i.test(product.title)) {
        score += 2
        matchReasons.push('renewal-match')
      }
      if (record.source === 'JiWu') {
        score -= 2
        matchReasons.push('not-jiwu-source')
      }
      if (isVariantRisk(record, product)) {
        score -= 3
        matchReasons.push('variant-risk')
      }

      return { ...product, score, matchReasons }
    })
    .filter((product) => product.score >= 8)
    .sort((left, right) => right.score - left.score || Number(left.id) - Number(right.id))
}

function isVariantRisk(record, candidate) {
  const sourceTitle = `${record.title || ''} ${record.variant || ''}`
  const candidateTitle = candidate?.title || ''
  const riskPatterns = [
    /SOFTSKIN|SOFT SKIN|ソフトスキン/i,
    /リニューアル|プチリニューアル|VER\.?\s*\d/i,
    /RAPオリジナル|オリジナルセット|フルコンプ/i,
    /二次募集|三次募集/i
  ]

  return riskPatterns.some((pattern) => pattern.test(candidateTitle) && !pattern.test(sourceTitle))
}

function normalizeUrl(value) {
  return String(value || '').replace(/\/+$/, '')
}

function normalizeRecordNumber(value) {
  return String(value || '').match(/\d+/)?.[0] || ''
}

function hasPinkDropsNumber(title, number) {
  return new RegExp(`(?:#|＃)\\s*${number}(?!\\d)`).test(String(title || ''))
}

function normalizeProductText(value) {
  return String(value || '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .toLowerCase()
    .replace(/pink\s*drops|soft\s*skin|softskin|ソフトスキン|プチリニューアル|リニューアル|ver\.?|chan|日焼け跡|スーパーホワイティ|ボディ|予約|販売|受注|セット|rapオリジナル|realartproject|type-[a-z0-9]+/gi, '')
    .replace(/[【】\[\]「」｢｣（）()：:#＃\s・･._-]/g, '')
    .replace(/[abc]$/i, '')
    .trim()
}

function countBy(items, getKey) {
  return items.reduce((result, item) => {
    const key = getKey(item)
    result[key] = (result[key] || 0) + 1
    return result
  }, {})
}

function renderMarkdown(summary, records) {
  const lines = [
    '# Source Web Body Code Review',
    '',
    `- Generated: ${summary.generatedAt}`,
    `- Missing record.md entries: ${summary.totalMissingRecordMd}`,
    `- By source: ${Object.entries(summary.bySource).map(([key, count]) => `${key}=${count}`).join(', ')}`,
    `- By confidence: ${Object.entries(summary.byConfidence).map(([key, count]) => `${key}=${count}`).join(', ')}`,
    '',
    '> confirmed/high-candidate/candidate 可进入生成链路；weak-candidate 仅代表弱匹配，不自动写入正式档案。sourceUrl 为空的记录仍建议继续人工核对原网页。',
    '',
    '| # | Year | No. | Name | Source | BodyCode | Confidence | Candidate | Reason |',
    '|---:|---:|---|---|---|---|---|---|---|'
  ]

  for (const [index, record] of records.entries()) {
    const candidate = record.candidateSource
      ? `[${escapeCell(record.candidateSource.productId)}](${record.candidateSource.url}) ${escapeCell(record.candidateSource.title)}`
      : ''
    lines.push([
      index + 1,
      escapeCell(record.year),
      escapeCell(record.number),
      escapeCell(record.name || record.title),
      escapeCell(record.source),
      escapeCell(record.bodyCode),
      escapeCell(record.confidence),
      candidate,
      escapeCell(record.reason)
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'))
  }

  return `${lines.join('\n')}\n`
}

function escapeCell(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return fallback
  }
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function hashUrl(url) {
  return createHash('sha1').update(url, 'utf8').digest('hex').slice(0, 16)
}
