import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const archiveFile = path.join(root, 'src', 'data', 'realartArchive.json')
const productsFile = path.join(root, '.cache', 'realart-products.json')

const defaultIds = ['189', '190', '191', '195', '198', '219', '220', '226', '230', '231']
const args = process.argv.slice(2)
const force = args.includes('--force')
const ids = args.filter((arg) => arg !== '--force')
const targetIds = ids.length ? ids : defaultIds

const archive = JSON.parse(await readFile(archiveFile, 'utf8'))
const products = JSON.parse(await readFile(productsFile, 'utf8'))
const productById = new Map(products.map((product) => [String(product.id), product]))
let generated = 0
let skipped = 0

for (const id of targetIds) {
  const record = archive.find((item) => String(item.externalProductId) === String(id))
  const product = productById.get(String(id))

  if (!record || !product) {
    console.warn(`skip ${id}: archive/product not found`)
    skipped += 1
    continue
  }

  if (!record.bodyCode || !record.bodyComposition || !record.headType) {
    console.warn(`skip ${id}: missing body/head composition`)
    skipped += 1
    continue
  }

  const dir = path.join(root, 'records', record.folder)
  const file = path.join(dir, 'record.md')
  if (existsSync(file) && !force) {
    console.warn(`skip ${id}: record.md already exists`)
    skipped += 1
    continue
  }

  await mkdir(dir, { recursive: true })
  await writeFile(file, `${renderRecord(record, product)}\n`, 'utf8')
  generated += 1
}

console.log(`Generated ${generated} RealArt detail records; skipped ${skipped}`)

function renderRecord(record, product) {
  const images = record.images || product.imageUrls || []
  const spec = extractSpecs(product.description)
  const priceText = normalizePrice(record.priceText || product.priceText)
  const headSpec = removeLeadingType(spec.head, record.headType)
  const bodyParts = formatBodyParts(record.bodyComposition)

  return [
    `引用链接：[RealArtProject 商品页](${record.sourceUrl})`,
    '',
    '## 译文（日译中）',
    '',
    `# ${record.title}`,
    '',
    `- 年份：${record.year}`,
    `- 分类：RealArtProject / Pink Drops 整娃`,
    `- 商品编号：${record.number}`,
    `- 名称：${record.name}`,
    `- 销售价格：${priceText || '公开资料未完整确认'}`,
    `- 库存状态：${record.variant || product.status || '公开资料未完整确认'}`,
    `- 原始标题：${record.title}`,
    '- 来源说明：本条由 RealArtProject FC2 商品页缓存补档，沿用美香子 `records/realart-<id>/record.md` 的本地详情流程。',
    '',
    '### 图片',
    '',
    ...images.map((image, index) => `- [商品图 ${index + 1}](${image})`),
    '',
    '### 商品介绍整理',
    '',
    `这款是 ${record.series} ${record.number}「${record.name}」。当前缓存已确认头型、身体三段型号、肤色、价格、来源链接与 ${images.length} 张商品图。中文整理只保留可验证规格与中性外观信息；完整营销文案以来源页为准。`,
    '',
    '### 商品详情',
    '',
    `- 商品形态：${spec.form || '彩色完成品，头部与身体套装'}`,
    `- 不附属：${inferMissingItems(spec.form)}`,
    `- 头部：Type-${record.headType}${headSpec ? `；${headSpec}` : ''}`,
    `- 眼珠：${spec.eye || '公开资料未完整确认'}`,
    `- 内部骨架：${spec.frame || 'Obitsu48/50 系，详见原文规格'}`,
    `- 成型色：${spec.skin || record.skin}`,
    `- 材质：${spec.material || '外装身体与头部为 PVC 软胶；内部骨架为 ABS / POM'}`,
    `- 尺寸：${spec.size || '公开资料未完整确认'}`,
    `- 协力：${spec.cooperation || '身体制作 Obitsu 制作所'}`,
    '- 发行方：QUARANTOTTO',
    '',
    '### 身体型号拆解',
    '',
    `bodyCode 使用核心三段 \`上胴 + 下胴 + フトモモ\`，本条为 \`${record.bodyCode}\`。`,
    '',
    ...bodyParts,
    '',
    '### 销售与配送',
    '',
    '- 下单后通常两周内配送；指定日期需在订单备注中填写。',
    '- 送料与代引换手续费另计，详情参考 RealArtProject 的 online shop 说明。',
    '- 商品不接受取消；商品图为样品参考，实际商品可能略有差异。',
    '',
    '## 原文（日文整理）',
    '',
    `# ${record.title}`,
    '',
    `- 年：${record.year}`,
    '- 分類：RealArtProject / Pink Drops 完成品',
    `- 商品番号：${record.number}`,
    `- 名称：${record.name}`,
    `- 販売価格：${priceText || '未確認'}`,
    `- 在庫状態：${record.variant || product.status || '未確認'}`,
    '',
    '### 仕様',
    '',
    `- 形態：${spec.form || '彩色済完成品、ヘッド＆ボディセット'}`,
    `- ヘッド：Type-${record.headType}${headSpec ? ` / ${headSpec}` : ''}`,
    `- ドールアイ：${spec.eye || '公開資料未完整確認'}`,
    `- ボディ：${spec.body || record.body}`,
    `- インナーフレーム：${spec.frame || '公開資料未完整確認'}`,
    `- 成型色：${spec.skin || record.skin}`,
    `- 材質：${spec.material || '公開資料未完整確認'}`,
    `- サイズ：${spec.size || '公開資料未完整確認'}`,
    `- 協力：${spec.cooperation || 'ボディ製作 オビツ製作所'}`,
    '- 発売元：QUARANTOTTO',
    '',
    '### 差异备注',
    '',
    '- 本条是 RealArtProject / Pink Drops FC2 商品页补档；与同名或后续 QUARANTOTTO / ANGEL PHILIA 官方页面作为独立来源保留。',
    '- `bodyCode` 只统计上胴、下胴、フトモモ三段；スネ、上腕、下腕、足首保留在 bodyComposition 明细中。'
  ].join('\n')
}

function extractSpecs(value) {
  return {
    form: extractSpec(value, '形態'),
    head: extractSpec(value, 'ヘッド'),
    eye: extractSpec(value, 'ドールアイ') || extractSpec(value, 'アイ'),
    body: extractSpec(value, 'ボディ'),
    frame: extractSpec(value, 'インナーフレーム'),
    skin: extractSpec(value, '成型色'),
    material: extractSpec(value, '材質'),
    size: extractSpec(value, 'サイズ'),
    cooperation: extractSpec(value, '協力') || extractSpec(value, 'ボディ製作')
  }
}

function extractSpec(value, label) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  const labels = '形態|仕様|ヘッド|ドールアイ|アイ|ボディ|オプション|インナーフレーム|成型色|材質|サイズ|協力|ボディ製作|発売元|発送'
  const pattern = new RegExp(`(?:◆|●)\\s*${label}\\s*[：:]\\s*([\\s\\S]*?)(?=\\s*(?:◆|●)\\s*(?:${labels})\\s*[：:]|\\s*価格[：:]|$)`)
  const match = text.match(pattern)
  return cleanupSpec(match?.[1] || '')
}

function cleanupSpec(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/\s*＊写真[\s\S]*$/i, '')
    .replace(/\s*価格[：:][\s\S]*$/i, '')
    .replace(/\s*ツイート[\s\S]*$/i, '')
    .trim()
}

function removeLeadingType(value, type) {
  return String(value || '')
    .replace(new RegExp(`^Type-${type}\\s*`, 'i'), '')
    .replace(new RegExp(`^Type${type}\\s*`, 'i'), '')
    .trim()
}

function normalizePrice(value) {
  return String(value || '').replace(/^価格[：:]\s*/, '').trim()
}

function inferMissingItems(form = '') {
  const match = form.match(/[（(]([^）)]+付属[^）)]*)[）)]/)
  return match ? match[1].replace(/付属いたしません。?/, '不附属') : '假发、服装、配件等通常不附属，详见原文规格'
}

function formatBodyParts(parts = {}) {
  const slots = [
    ['upperTorso', '上胴'],
    ['lowerTorso', '下胴'],
    ['thigh', 'フトモモ'],
    ['shin', 'スネ'],
    ['upperArm', '上腕'],
    ['forearm', '下腕'],
    ['arm', '腕'],
    ['foot', '足首']
  ]

  return slots
    .filter(([slot]) => parts[slot]?.type)
    .map(([slot, label]) => `- ${label}：${formatPartType(parts[slot].type)}。来源写作「${parts[slot].sourceText || parts[slot].label || label}」。`)
}

function formatPartType(type) {
  if (/^[A-Z][0-9]?$/.test(type)) return `Type-${type}`
  if (type === 'Obitsu50') return 'Obitsu50'
  if (type === 'NormalFoot') return 'ノーマル足(Obitsu50)'
  if (type === 'Heel') return 'ヒール足'
  return type
}
