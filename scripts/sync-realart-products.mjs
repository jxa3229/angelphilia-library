import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { normalizeBodyText, parseBodyCompositionFromText } from './body-composition.mjs'

const root = process.cwd()
const sourceFile = path.join(root, '.cache', 'realart-products.json')
const archiveFile = path.join(root, 'src', 'data', 'realartArchive.json')
const outfitsFile = path.join(root, 'src', 'data', 'outfits.json')
const partsFile = path.join(root, 'src', 'data', 'realartParts.json')

const products = JSON.parse(await readFile(sourceFile, 'utf8')).map(normalizeCachedCategory)
const archiveRecords = []
const outfitRecords = []
const partRecords = []

for (const product of products) {
  if (isReference(product)) continue

  const normalized = normalizeProduct(product)
  if (normalized.category === 'doll') {
    archiveRecords.push(toArchiveRecord(normalized, product))
  }
  if (['outfit', 'accessory'].includes(normalized.category)) {
    outfitRecords.push(normalized)
  }
  if (['part', 'bodyExhibit'].includes(normalized.category)) {
    partRecords.push(toPartRecord(normalized, product))
  }
}

await mkdir(path.dirname(archiveFile), { recursive: true })
await writeJson(archiveFile, archiveRecords)
await writeJson(outfitsFile, outfitRecords)
await writeJson(partsFile, partRecords)

console.log(`Synced ${archiveRecords.length} dolls to ${path.relative(root, archiveFile)}`)
console.log(`Synced ${outfitRecords.length} exterior items to ${path.relative(root, outfitsFile)}`)
console.log(`Synced ${partRecords.length} part models to ${path.relative(root, partsFile)}`)

function normalizeProduct(product) {
  const images = Array.isArray(product.imageUrls) ? product.imageUrls : []
  return {
    id: product.id,
    title: product.title,
    model: product.model,
    category: product.category,
    categoryLabel: categoryLabel(product.category),
    priceText: product.priceText,
    status: product.status,
    source: 'Real Art Project',
    sourceUrl: product.url,
    imageUrl: images[0] || '',
    images,
    description: trimDescription(product.description)
  }
}

function toPartRecord(product, rawProduct = product) {
  const bodyComposition = product.category === 'bodyExhibit'
    ? parseBodyCompositionFromText(rawProduct.description, { source: 'realart-products.json' })
    : null

  return {
    ...product,
    displayKind: product.category === 'bodyExhibit' ? 'bodyExhibit' : 'skinPart',
    displayKindLabel: product.category === 'bodyExhibit' ? '各型号素体展览' : '外皮配件',
    bodyCode: bodyComposition?.code || '',
    bodyComposition: bodyComposition?.parts || null,
    bodyTypes: product.category === 'bodyExhibit' ? extractBodyTypes(rawProduct, bodyComposition) : []
  }
}

function toArchiveRecord(product, rawProduct = product) {
  const parsed = parseDollTitle(product.title)
  const year = inferYear(product.id)
  const bodyComposition = parseBodyCompositionFromText(rawProduct.description, { source: 'realart-products.json' })
    || inheritedOriginalSetComposition(rawProduct)
  return {
    year,
    group: 'PinkDrops',
    series: 'Pink Drops',
    number: parsed.number || `RAP-${product.id}`,
    name: parsed.name || product.title,
    title: product.title,
    variant: parsed.variant || statusLabel(product.status),
    head: parsed.name || '公開資料未完整確認',
    body: product.model || '公開資料未完整確認',
    bodyCode: bodyComposition?.code || '',
    bodyComposition: bodyComposition?.parts || null,
    bodyCodeSource: bodyComposition
      ? {
          type: 'realart-products.json',
          productId: product.id,
          line: bodyComposition.sourceLine
        }
      : null,
    skin: inferSkin(product.title),
    source: product.source,
    sourceUrl: product.sourceUrl,
    folder: `realart-${product.id}`,
    imageUrl: product.imageUrl,
    images: product.images,
    safeFolder: `realart-${product.id}`,
    safeImages: product.images,
    detailKey: '',
    safeImageUrl: product.imageUrl,
    description: product.description,
    externalProductId: product.id
  }
}

function parseDollTitle(title) {
  const number = title.match(/Pink\s*Drops\s*#\s*(\d+)/i)?.[1]
  const quoted = title.match(/[「｢](.*?)[」｣]/)?.[1] || title
  const withoutPrefix = quoted
    .replace(/^★?[^「｢]*?Pink\s*Drops\s*#\s*\d+\s*/i, '')
    .replace(/^Pink\s*Drops\s*#\s*\d+\s*/i, '')
    .trim()
  const [namePart, ...variantParts] = withoutPrefix.split(/[：:]/)
  return {
    number: number ? `#${number}` : '',
    name: namePart?.replace(/[<>]/g, '').trim() || '',
    variant: variantParts.join(':').trim()
  }
}

function inheritedOriginalSetComposition(product) {
  if (!isOriginalSet(product)) return null

  const baseProduct = findBaseDollProduct(product)
  if (!baseProduct) return null

  const parsed = parseBodyCompositionFromText(baseProduct.description, { source: 'realart-products.json' })
  if (!parsed) return null

  return {
    ...parsed,
    sourceLine: `${parsed.sourceLine} / inherited from base RealArt product ${baseProduct.id}; original set adds: ${extractOriginalSetAdditions(product.description)}`
  }
}

function findBaseDollProduct(product) {
  const number = product.title.match(/Pink\s*Drops\s*#\s*(\d+)/i)?.[1]
  const name = normalizeComparableName(parseDollTitle(product.title).name)
  if (!number || !name) return null

  return products
    .filter((candidate) => candidate.category === 'doll')
    .filter((candidate) => !isOriginalSet(candidate))
    .filter((candidate) => new RegExp(`Pink\\s*Drops\\s*#\\s*${number}(?!\\d)`, 'i').test(candidate.title))
    .filter((candidate) => normalizeComparableName(parseDollTitle(candidate.title).name).includes(name) || name.includes(normalizeComparableName(parseDollTitle(candidate.title).name)))
    .sort((left, right) => Number(right.id) - Number(left.id))[0] || null
}

function isOriginalSet(product) {
  return /RAPオリジナル|RealArtProjectオリジナル|オリジナル[ABC]?セット|フルコンプ/.test(product.title || '')
}

function extractOriginalSetAdditions(value) {
  const text = String(value || '').replace(/\s+/g, ' ')
  const match = text.match(/◆形態[:：]\s*([^★＊]+)/)
  return match?.[1]?.trim() || ''
}

function normalizeComparableName(value) {
  return String(value || '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/Pink\s*Drops\s*#\s*\d+/gi, '')
    .replace(/RAPオリジナル|RealArtProjectオリジナル|オリジナル[ABC]?セット|フルコンプ|プチリニューアル|リニューアル|SoftSkin|ver\.?\s*\d?|chan|スーパーホワイティ|日焼け跡|ボディ/gi, '')
    .replace(/[「」｢｣【】（）()：:#＃\s・･._-]/g, '')
    .trim()
}

function inferSkin(title) {
  if (/スーパーホワイティ/.test(title)) return 'Super Whitey'
  if (/ホワイティ|白肌/.test(title)) return 'Whitey'
  if (/褐色/.test(title)) return '褐色'
  if (/ノーマル/.test(title)) return 'Normal Skin'
  return '公開資料未完整確認'
}

function inferYear(id) {
  const numericId = Number(id)
  if (numericId >= 430) return '2026'
  if (numericId >= 400) return '2025'
  if (numericId >= 360) return '2024'
  if (numericId >= 320) return '2023'
  if (numericId >= 280) return '2022'
  if (numericId >= 240) return '2021'
  if (numericId >= 200) return '2020'
  if (numericId >= 160) return '2019'
  if (numericId >= 120) return '2018'
  if (numericId >= 80) return '2017'
  return '2016'
}

function isReference(product) {
  return /参考|比較写真/.test(product.title)
}

function statusLabel(status) {
  if (status === 'soldOut') return 'Sold out'
  if (status === 'reservation') return 'Reservation'
  return '通常/未明'
}

function categoryLabel(category) {
  const labels = {
    doll: '整娃',
    part: '配件',
    bodyExhibit: '素体展览',
    outfit: '衣服',
    accessory: '配饰'
  }
  return labels[category] || '其他'
}

function normalizeCachedCategory(product) {
  const title = product.title || ''
  const text = `${product.title || ''} ${product.description || ''}`
  const category = correctedProductCategory(title, text, product.category)
  return category === product.category ? product : { ...product, category }
}

function correctedProductCategory(title, text, fallback) {
  if (/Pバン|ディルド|ウィッグ|アイ|アクリルアイ|靴|ブーツ|サンダル|眼鏡|メガネ|アクセ|リボン|カチューシャ|スタンド|小物/.test(title)) {
    return 'accessory'
  }
  if (/6\s*[-−～~]\s*7\s*inch/i.test(text) || /アサルトライフル|ライフル|武器/.test(title)) {
    return 'accessory'
  }
  if (/水着|衣装|服|ドレス|制服|シャツ|スカート|パンツ|ブラ|靴下|ストッキング|ビキニ|ランジェリー|コスチューム|パーカー|コート|メイド|セーラー|ウエイトレス|ラッピング|スクール|ウェディング|ウエディング|モコモコ/.test(title)) {
    return 'outfit'
  }
  if (/ヘッド無し|ボディセット|Type-[CH]ボディ|上胴[Ａ-ＺA-Z0-9０-９]+[＋+][A-ZＡ-Ｚ]?ボディ/.test(title)) {
    return 'bodyExhibit'
  }
  if (/外皮|ボディパーツ|上胴|下胴|太もも|小腿|手首|足首/.test(title)) {
    return 'part'
  }
  return fallback || 'other'
}

function extractBodyTypes(product, bodyComposition = null) {
  if (bodyComposition?.code) {
    return ['upperTorso', 'lowerTorso', 'thigh']
      .map((slot) => bodyComposition.parts[slot]?.type)
      .filter(Boolean)
  }

  const text = normalizeBodyText(`${product.title} ${product.model} ${product.description}`)
  const candidates = [...text.matchAll(/TYPE-([A-Z][0-9]?)/g)].map((match) => match[1])
  const ordered = []

  for (const type of candidates) {
    if (!ordered.includes(type)) ordered.push(type)
  }

  return ordered
}

function trimDescription(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 420)
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}
