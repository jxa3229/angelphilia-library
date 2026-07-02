import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const baseUrl = 'https://realartproject.cart.fc2.com/'
const outputFile = path.join(root, '.cache', 'realart-products.json')
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36'

const productHrefPattern = /\/ca\d+\/\d+\/p\d*-r-s\/$/
const productUrls = new Map()

for (let page = 0; page <= 5; page += 1) {
  const url = page === 0 ? new URL('/?ca=all', baseUrl).href : new URL(`/?ca=all&page=${page}`, baseUrl).href
  const html = await fetchHtml(url)
  for (const link of collectLinks(html, url)) {
    if (productHrefPattern.test(new URL(link.href).pathname)) {
      productUrls.set(link.href, link.text)
    }
  }
}

const products = await mapLimit([...productUrls.entries()], 8, async ([url, listTitle]) => {
  const html = await fetchHtml(url)
  return parseProduct(html, url, listTitle)
})

products.sort((a, b) => Number(a.id) - Number(b.id))

if (products.length < 260) {
  throw new Error(`Expected at least 260 products from full listing, got ${products.length}`)
}

await mkdir(path.dirname(outputFile), { recursive: true })
await writeFile(outputFile, `${JSON.stringify(products, null, 2)}\n`, 'utf8')
console.log(`Fetched ${products.length} products to ${path.relative(root, outputFile)}`)

async function fetchHtml(url) {
  let lastError

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': userAgent,
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'ja,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7'
        }
      })
      if (!response.ok) {
        throw new Error(`Fetch failed ${response.status}: ${url}`)
      }
      return response.text()
    } catch (error) {
      lastError = error
      await wait(350 * attempt)
    }
  }

  throw lastError
}

function collectLinks(html, pageUrl) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({
      href: new URL(decodeHtml(match[1]), pageUrl).href,
      text: cleanText(match[2])
    }))
}

function parseProduct(html, url, listTitle) {
  const pathMatch = new URL(url).pathname.match(/\/ca(\d+)\/(\d+)\//)
  const title = extractTitle(html) || listTitle
  const priceText = firstMatch(html, /class=["'][^"']*(?:price|selling_price)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i)
    || firstMatch(html, /([0-9,]+)\s*円/)
    || ''
  const rawDescription = extractDescription(html)
  const imageUrls = unique([...html.matchAll(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => new URL(decodeHtml(match[1]), url).href)
    .filter((item) => /cart\.fc2img\.com|blog-imgs|realartproject/.test(item))
    .filter((item) => !/favicon|template|spacer|button|rank|img_accent|\/link\d+\.(?:jpg|png|gif)|961d92f178d5f261fc84dd6d10c02887/.test(item)))
  const category = classifyProduct(title, rawDescription)

  return {
    id: pathMatch?.[2] || '',
    shopCategory: pathMatch?.[1] || '',
    title,
    model: extractModel(title, rawDescription),
    category,
    priceText: cleanText(priceText),
    status: extractStatus(html),
    url,
    imageUrls,
    description: rawDescription
  }
}

function extractTitle(html) {
  const candidates = [
    /<h1\b[^>]*>([\s\S]*?)<\/h1>/i,
    /<h2\b[^>]*>([\s\S]*?)<\/h2>/i,
    /class=["'][^"']*(?:item_name|product_name|goods_name)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i,
    /<title>([\s\S]*?)<\/title>/i
  ]

  for (const pattern of candidates) {
    const text = cleanText(firstMatch(html, pattern) || '')
    if (text && !/^Real Art Project/.test(text)) return text.replace(/\s*-\s*Real Art Project\s*$/, '')
  }
  return ''
}

function extractDescription(html) {
  const candidates = [
    /class=["'][^"']*(?:explanation|description|item_explain|goods_exp|detail)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|td|section)>/i,
    /<div id=["']item[\s\S]*?<\/div>/i
  ]

  for (const pattern of candidates) {
    const text = cleanText(firstMatch(html, pattern) || '')
    if (text && text.length > 20) return text
  }

  return cleanText(html)
    .replace(/^.*?Real Art Project/, '')
    .slice(0, 1600)
}

function extractStatus(html) {
  const text = cleanText(html)
  if (/在庫切れ|売り切れ|SOLD\s*OUT/i.test(text)) return 'soldOut'
  if (/予約|二次募集|三次募集|受付/i.test(text)) return 'reservation'
  return 'normal'
}

function classifyProduct(title, description) {
  const titleText = title
  const text = `${title} ${description}`

  if (/Pバン|ディルド|ウィッグ|アイ|アクリルアイ|靴|ブーツ|サンダル|眼鏡|メガネ|アクセ|リボン|カチューシャ|スタンド|小物/.test(titleText)) {
    return 'accessory'
  }
  if (/6\s*[-−～~]\s*7\s*inch/i.test(text) || /アサルトライフル|ライフル|武器/.test(titleText)) {
    return 'accessory'
  }
  if (/水着|衣装|服|ドレス|制服|シャツ|スカート|パンツ|ブラ|靴下|ストッキング|ビキニ|ランジェリー|コスチューム|パーカー|コート|メイド|セーラー|ウエイトレス|ラッピング|スクール|ウェディング|ウエディング|モコモコ/.test(titleText)) {
    return 'outfit'
  }
  if (/ヘッド無し|ボディセット|Type-[CH]ボディ|上胴[Ａ-ＺA-Z0-9０-９]+[＋+][A-ZＡ-Ｚ]?ボディ/.test(titleText)) {
    return 'bodyExhibit'
  }
  if (/外皮|ボディパーツ|上胴|下胴|太もも|小腿|手首|足首/.test(titleText)) {
    return 'part'
  }
  if (/Pink\s*Drops\s*#|\bAP\s*#|完成品|フルコンプ|オリジナル[AB]?セット|募集/.test(text) && !/ヘッド無し/.test(titleText)) {
    return 'doll'
  }
  return 'other'
}

function extractModel(title, description) {
  const text = `${title} ${description}`
  const matches = [
    ...text.matchAll(/(?:Type|タイプ)[-\s]*([A-ZＡ-Ｚ][0-9０-９]?)/gi),
    ...text.matchAll(/([A-ZＡ-Ｚ]\/(?:上胴|下胴|Type|タイプ)[A-ZＡ-Ｚ0-9０-９＋+]+)/g),
    ...text.matchAll(/W\/[^：:「」]+/g)
  ]
  return unique(matches.map((match) => normalizeModel(match[0] || match[1])).filter(Boolean)).join(' / ')
}

function normalizeModel(value) {
  return value
    .replace(/[Ａ-Ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/\s+/g, ' ')
    .trim()
}

function firstMatch(text, pattern) {
  const match = text.match(pattern)
  return match?.[1] || match?.[0] || ''
}

function cleanText(value) {
  return decodeHtml(String(value || ''))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function unique(items) {
  return [...new Set(items.filter(Boolean))]
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
