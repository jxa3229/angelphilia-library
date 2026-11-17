import { limitedCategories } from '../utils/limitedRecords.js'
import { normalizeSelectionName } from '../utils/recordNames.js'
import { officialTranslations, officialDetailCopy } from '../data/limitedTranslations.js'
import { limitedComparison, limitedMilestones, limitedSources } from '../data/limitedGuide.js'

export const limitedCopy = {
  zh: {
    title: '限定档案', eyebrow: 'SPECIAL COLLECTION · 限定企划',
    intro: '手工定制、完整搭配与角色合作，沿着不同的创作方式阅读限定款。',
    osd: 'OSD · 手工定制孤品', fcd: 'FCD · 全套搭配限定', collab: '联动 · 角色合作款',
    osdIntro: 'ONE SELECTION DOLL 是以定制妆面与整体造型为核心、世界仅此一体的 One-off 人偶。',
    fcdIntro: 'Full Coordinate Doll 以量产版角色本体为基础，搭配限定衣装、假发与饰品重新造型后抽选发售。',
    note: '两者重点在于妆面定制与搭配方式的区别。FCD 整体搭配也可能仅此一体，官方 EMMA 页面即如此标示；角色联动则不自动等于 One-off。',
    guide: 'OSD / FCD 对照、历史编号与参考来源', tableLabel: 'OSD 与 FCD 对照表，可横向滚动',
    caption: 'OSD 与 FCD 的创作方式对照', dimension: '对比维度', scope: '编号与收录范围',
    scopeText: '本页数量由本站实际档案计算。公开编号已见 #125，但编号、线下展品与实际发行总数不是同一口径；FCD 的站内 4 款也不代表全部历史发行。',
    spinoffs: '衍生检索线索：ONE SELECTION HEAD 为定制头部；Secret Selection Doll 为另外的企划名称，不合并计入本页 OSD 整娃数量。',
    sources: '官方参考来源', categories: '限定分类', all: '全部', collaboration: '角色联动',
    search: '搜索限定档案', placeholder: '搜索编号、角色、OSD、FCD…',
    results: '显示 {shown} / {total} 条限定及联动档案', reset: '重置筛选', empty: '暂无匹配的限定档案',
    clear: '清空筛选，查看全部限定', back: '返回限定档案', details: '详细资料与来源', summary: '档案摘要',
    category: '企划类型', year: '资料年份', name: '名称', head: '头部', body: '身体', skin: '肤色',
    unknown: '未确认', official: '官方商品说明', lottery: '孤品抽选销售', fullLottery: '全套孤品人偶抽选销售',
    customHead: '定制妆面（见官方规格）', seeSpecs: '见官方规格', source: 'Angel Philia 官方',
    osdSummary: '本款归入 ONE SELECTION DOLL 手工定制孤品系列。具体妆师、衣装和销售安排请查阅详细资料。',
    fcdSummary: '以量产角色本体为基础，搭配衣装、假发与饰品的 Full Coordinate Doll。整套搭配可能仅此一体，发行数量以具体商品资料为准。',
    collabSummary: '以合作作品角色为主题的整娃或套装。角色联动不自动代表孤品或限量，具体配置与发行方式请查阅详细资料。'
  },
  en: {
    title: 'Limited Editions', eyebrow: 'SPECIAL COLLECTION · LIMITED EDITIONS',
    intro: 'Explore limited releases through custom artistry, complete styling and character collaborations.',
    osd: 'OSD · Unique custom doll', fcd: 'FCD · Complete styling', collab: 'Character collaboration',
    osdIntro: 'ONE SELECTION DOLL is a unique One-off doll built around a custom face-up and complete styling.',
    fcdIntro: 'Full Coordinate Doll restyles a production character doll with selected clothing, a wig and accessories, offered by lottery.',
    note: 'The distinction is the focus on custom face-ups versus coordinated styling. An FCD ensemble can also be unique, as stated on the official EMMA page. A character collaboration does not necessarily mean One-off.',
    guide: 'OSD / FCD comparison, numbering and sources', tableLabel: 'OSD / FCD comparison; scroll horizontally',
    caption: 'How OSD and FCD are created', dimension: 'Aspect', scope: 'Numbering and coverage',
    scopeText: 'Counts reflect records in this library. Published numbering reaches #125, but numbers, event exhibits and total production are different measures. The four FCD records here do not represent every historical release.',
    spinoffs: 'Related search terms: ONE SELECTION HEAD refers to custom heads; Secret Selection Doll is a separate project. Neither is included in the OSD full-doll count here.',
    sources: 'Official sources', categories: 'Edition categories', all: 'All', collaboration: 'Collaborations',
    search: 'Search limited editions', placeholder: 'Search number, character, OSD, FCD…',
    results: 'Showing {shown} / {total} limited and collaboration records', reset: 'Reset filters', empty: 'No matching records',
    clear: 'Clear filters and show all', back: 'Back to limited editions', details: 'Detailed records and sources', summary: 'Record summary',
    category: 'Project type', year: 'Record year', name: 'Name', head: 'Head', body: 'Body', skin: 'Skin tone',
    unknown: 'Unconfirmed', official: 'Official product information', lottery: 'One-off lottery release', fullLottery: 'Complete One-off doll lottery release',
    customHead: 'Custom face-up (see official specifications)', seeSpecs: 'See official specifications', source: 'Angel Philia official',
    osdSummary: 'Part of the ONE SELECTION DOLL series of unique custom dolls. See the detailed record for the artist, outfit and sales arrangements.',
    fcdSummary: 'A Full Coordinate Doll combines a production character doll with selected clothing, a wig and accessories. The complete ensemble may be unique; consult the product record for quantities.',
    collabSummary: 'A complete doll or set based on a character from a collaborating work. A collaboration does not necessarily mean a unique or limited release; consult the detailed record for its configuration and release format.'
  },
  ja: {
    title: '限定アーカイブ', eyebrow: 'SPECIAL COLLECTION · 限定企画',
    intro: 'カスタムメイク、トータルコーディネート、キャラクターコラボの各視点から限定企画を紹介します。',
    osd: 'OSD · 一点物カスタム', fcd: 'FCD · フルコーディネート', collab: 'キャラクターコラボ',
    osdIntro: 'ONE SELECTION DOLL は、カスタムメイクとトータルスタイリングを中心とした、世界に一体だけのワンオフドールです。',
    fcdIntro: 'Full Coordinate Doll は量産キャラクタードールをベースに、衣装・ウィッグ・アクセサリーでコーディネートし、抽選販売する企画です。',
    note: '違いはメイクのカスタムとコーディネートの重点にあります。FCD も全体の組み合わせが一点物の場合があり、公式 EMMA ページにもその記載があります。コラボ商品が必ずワンオフとは限りません。',
    guide: 'OSD / FCD 比較・番号の変遷・参考資料', tableLabel: 'OSD / FCD 比較表（横スクロール可）',
    caption: 'OSD と FCD の制作方法の比較', dimension: '比較項目', scope: '番号と収録範囲',
    scopeText: '件数は本サイトの収録記録に基づきます。公開番号では #125 を確認していますが、番号・会場展示品・総制作数は同じ指標ではありません。FCD の収録4件も歴代全商品を意味しません。',
    spinoffs: '関連する検索語：ONE SELECTION HEAD はカスタムヘッド、Secret Selection Doll は別企画です。本ページの OSD 完成ドール件数には含めません。',
    sources: '公式参考資料', categories: '限定カテゴリ', all: 'すべて', collaboration: 'コラボ',
    search: '限定アーカイブを検索', placeholder: '番号・キャラクター・OSD・FCD を検索…',
    results: '限定・コラボ記録 {total} 件中 {shown} 件を表示', reset: '絞り込みをリセット', empty: '一致する記録がありません',
    clear: '絞り込みを解除してすべて表示', back: '限定アーカイブに戻る', details: '詳細資料と出典', summary: '記録の概要',
    category: '企画の種類', year: '資料の年', name: '名称', head: 'ヘッド', body: 'ボディ', skin: '成型色',
    unknown: '未確認', official: '公式商品情報', lottery: 'ワンオフ抽選販売品', fullLottery: 'フルセットワンオフドール抽選販売',
    customHead: 'カスタムメイク（公式仕様参照）', seeSpecs: '公式仕様参照', source: 'Angel Philia 公式',
    osdSummary: '一点物カスタムドールの ONE SELECTION DOLL シリーズです。制作者、衣装、販売方法は詳細資料をご確認ください。',
    fcdSummary: '量産キャラクタードールに衣装・ウィッグ・アクセサリーを組み合わせた Full Coordinate Doll です。全体の組み合わせが一点物の場合もあります。数量は各商品資料をご確認ください。',
    collabSummary: 'コラボ作品のキャラクターを題材としたドールまたはセットです。コラボが必ず一点物や限定品を意味するわけではありません。構成と販売方式は詳細資料をご確認ください。'
  }
}

// 同一行依次为日文、中文、英文。长词优先、一次替换，避免译文被再次替换。
const terms = [
  ['※足には鉄板ベース用のマグネットは入っておりません。', '注：脚部不含用于铁板底座的磁铁。', 'Note: feet do not contain magnets for a steel display base.'],
  ['※右側タトゥーペイント有', '（右侧有纹身涂装）', ' (tattoo paint on the right side)'],
  ['＊上身・下身：スーパー白肌 注：外皮零件为已上色', '上身、下身：超白肌；外皮零件已上色', 'upper/lower torso: super white; exterior parts painted'],
  ['白肌 ■外皮身体为已化妆', '白肌（身体外皮已上妆）', 'White (body exterior painted)'],
  ['公開資料未完整確認', '公开资料未完整确认', 'Not fully confirmed in public records'],
  ['角色联动完成品', '角色联动完成品', 'character collaboration doll'],
  ['角色联动款', '角色联动款', 'character collaboration'],
  ['联动完成品', '联动完成品', 'collaboration doll'],
  ['系联动套装', '系联动套装', ' collaboration set'],
  ['日焼けあと塗装', '晒痕涂装', 'tan-line paint'],
  ['デザインハンド３種', '3 种造型手', '3 styled hand types'],
  ['デザインハンド(3種)', '3 种造型手', '3 styled hand types'],
  ['Obitsu50ハンド(1種)', '1 种 Obitsu50 手型', '1 Obitsu50 hand type'],
  ['ヒールタイプ & ノーマルタイプ', '高跟脚与平脚', 'high-heel and flat feet'],
  ['ヒール足&ノーマル足', '高跟脚与平脚', 'high-heel and flat feet'],
  ['ヒールタイプ', '高跟脚', 'high-heel feet'],
  ['ノーマルタイプ', '平脚', 'flat feet'],
  ['デザインハンド', '造型手', 'styled hands'],
  ['呂蒙子明メイド服Ver.', '吕蒙子明 女仆装版', 'Ryomou Shimei Maid Ver.'],
  ['関羽雲長 ナース服Ver.', '关羽云长 护士装版', 'Kanu Unchou Nurse Ver.'],
  ['呂蒙子明', '吕蒙子明', 'Ryomou Shimei'],
  ['関羽雲長', '关羽云长', 'Kanu Unchou'],
  ['リン・ミンメイ', '林明美', 'Lynn Minmay'],
  ['レイナ', '蕾娜', 'Reina'],
  ['Catwoman', '猫女 Catwoman', 'Catwoman'],
  ['ホワイティ', '白肌', 'White'],
  ['White', '白肌', 'White'],
  ['褐色', '褐色', 'Tan'],
  ['未明', '未明', 'Unknown'],
  ['上胴', '上身', 'Upper torso'],
  ['下胴', '下身', 'Lower torso'],
  ['フトモモ', '大腿', 'Thighs'],
  ['スネ', '小腿', 'Shins'],
  ['オビツ50', 'Obitsu50', 'Obitsu50'],
  ['腕', '手臂', 'Arms'],
  ['手', '手', 'Hands'],
  ['足', '脚', 'Feet'],
  ['Tpype-', 'Type-', 'Type-']
]

const escapePattern = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const termPattern = new RegExp(terms.map(([ja]) => ja).sort((a, b) => b.length - a.length).map(escapePattern).join('|'), 'g')
const termMap = new Map(terms.map((row) => [row[0], row]))
const japaneseMetadata = new Map([
  ['角色联动完成品', 'キャラクターコラボドール'], ['角色联动款', 'キャラクターコラボ'],
  ['联动完成品', 'コラボドール'], ['系联动套装', ' コラボセット'],
  ['公開資料未完整確認', '公開資料では未確認'], ['公开资料未完整确认', '公開資料では未確認'],
  ['白肌 ■外皮身体为已化妆', 'ホワイティ（外皮ボディはメイク済み）'],
  ['＊上身・下身：スーパー白肌 注：外皮零件为已上色', '上胴・下胴：スーパーホワイティ、外皮パーツは彩色済み'],
  ['White', 'ホワイティ'], ['未明', '未確認']
])
const japaneseMetadataPattern = new RegExp([...japaneseMetadata.keys()].sort((a, b) => b.length - a.length).map(escapePattern).join('|'), 'g')

export function limitedText(text = '', lang = 'zh') {
  if (lang === 'ja') return normalizeSelectionName(text).replace(japaneseMetadataPattern, (term) => japaneseMetadata.get(term))
  return normalizeSelectionName(text).replace(termPattern, (term) => termMap.get(term)[lang === 'en' ? 2 : 1])
}

export function localizeLimitedRecord(record, lang = 'zh') {
  if (!limitedCategories(record).length) return record
  const copy = limitedCopy[lang] || limitedCopy.zh
  const result = { ...record }
  for (const field of ['name', 'title', 'body', 'skin', 'head']) result[field] = limitedText(record[field], lang)
  result.title = result.title.replace('【フルセットワンオフドール抽選販売】', `【${copy.fullLottery}】`)
    .replace('＜ワンオフ抽選販売品＞', `＜${copy.lottery}＞`)
  if (record.head === '定制妆面（见官方规格）') result.head = copy.customHead
  if (record.skin === '见官方规格') result.skin = copy.seeSpecs
  if (record.skin === '公开资料未完整确认') result.skin = copy.unknown
  if (record.source === 'Angel Philia 官方') result.source = copy.source
  const specs = record.folder?.startsWith('official-osd-') && officialTranslations[record.number]
  if (specs && lang !== 'ja') {
    const labels = officialDetailCopy[lang] || officialDetailCopy.zh
    const index = lang === 'en' ? 1 : 0
    const rows = { ...specs, body: [limitedText(record.body, 'zh'), limitedText(record.body, 'en')] }
    const order = ['head', 'eyes', 'wig', 'body', 'frame', 'skin', 'outfit', 'accessories', 'shoes', 'material']
    result.description = [copy.official, labels.intro,
      record.description.includes('返品') ? labels.returns : '',
      ...order.filter((key) => rows[key]).map((key) => `${labels[key]}：${rows[key][index]}`)].filter(Boolean).join('\n\n')
  } else if (specs) {
    result.description = normalizeSelectionName(record.description).replace('官方资料摘录（日本語）', copy.official)
  }
  return result
}

export function limitedRecordSummary(record, lang = 'zh') {
  const copy = limitedCopy[lang] || limitedCopy.zh
  const item = localizeLimitedRecord(record, lang)
  const category = limitedCategories(record)[0]
  return [copy.summary, copy[`${category}Summary`],
    ...['year', 'head', 'body', 'skin'].map((field) => `${copy[field]}：${item[field] || copy.unknown}`)].join('\n\n')
}

const guideTranslations = {
  en: {
    comparison: [
      ['Creative focus', 'A One-off centered on a custom face-up, character expression and complete styling.', 'A production character doll restyled with selected clothing, a wig and accessories.'],
      ['Face-up and head', 'Hand-customized by collaborating artists; see each product specification for credits and modifications.', 'Usually retains the production character’s existing face-up, such as EMMA, LENA, Elle or Kurumi.'],
      ['Clothing and styling', 'Custom styling and clothing coordinated around the character.', 'Sample outfits, collaborating makers’ work and clothing or accessories that are not usually available.'],
      ['Uniqueness', 'Officially defined as a custom doll that exists only once in the world.', 'A production base does not mean a repeated ensemble. Official descriptions also call FCD One-off; EMMA explicitly had one doll offered by lottery.'],
      ['Numbering', 'Usually #number or an early product No.; the highest number is not a production total.', 'Usually named after the base character, without an OSD-style continuous number.'],
      ['Price reference', 'Supplied references cite about ¥90,000–120,000+; consult each product page.', 'Supplied references cite about ¥64,000–74,000; consult each product page.']
    ],
    milestones: [
      'Supplied references place #29 and #30 in the CODE NOiR collaboration period. This library also retains early records #24, #25 and #26.',
      'Supplied references list #46–#52 at the Private Girl exhibition, as leads for future additions.',
      'Official pages document #83, #86 and #88. FCD records include EMMA, LENA, Elle and Kurumi.',
      'Supplied references cite milestones from #94 and #95 to #113; consult each period’s sources for dates and numbering.',
      'Official records #119, #121, #123 and #125 have been added. #125 is an observed number, not a verified total of 125 dolls.'
    ],
    sources: ['OSD #86 · Official definition and specifications', 'FCD EMMA · Production base and single-doll lottery', 'ONE SELECTION DOLL official category', 'Coordinate set official category', 'Private Girl official exhibition record', 'OSD #125 · Published number']
  },
  ja: {
    comparison: [
      ['制作の重点', 'カスタムメイク、キャラクター表現、トータルスタイリングを中心としたワンオフ。', '量産キャラクタードールをベースに、衣装・ウィッグ・アクセサリーで限定コーディネート。'],
      ['メイクとヘッド', '公式協力アーティストによる手作業のカスタム。制作者や加工内容は各商品仕様を参照。', '通常は EMMA、LENA、Elle、Kurumi など量産キャラクターの既存メイクを使用。'],
      ['衣装とスタイリング', 'キャラクターに合わせたカスタムスタイリングと衣装の組み合わせ。', 'サンプル衣装、協力作家の作品、通常入手しにくい衣装やアクセサリーを使用。'],
      ['一点物としての性格', '公式では世界に一つしか存在しないカスタムドールと定義。', '量産ベースでも組み合わせまで量産とは限らない。公式でもワンオフと呼ばれ、EMMA は1体のみの抽選販売と明記。'],
      ['番号の付け方', '通常は #数字、初期には商品 No. も使用。最大番号を総制作数とは見なせない。', '主にベースキャラクター名で命名され、通常 OSD 式の通し番号は使用しない。'],
      ['価格の参考', '提供資料では約 ¥90,000–120,000+。各回の商品ページを優先。', '提供資料では約 ¥64,000–74,000。各回の商品ページを優先。']
    ],
    milestones: [
      '提供資料では CODE NOiR コラボ期の #29・#30 を記載。本サイトには初期の #24・#25・#26 も収録。',
      '提供資料では Private Girl 展示会の #46–#52 を記載。今後の資料追加の手がかり。',
      '公式ページで #83・#86・#88 を確認。FCD は EMMA・LENA・Elle・Kurumi などを収録。',
      '提供資料では #94・#95 から #113 までの節目を記載。具体的な会期と番号は各時期の出典を参照。',
      '公式の #119・#121・#123・#125 を追加。#125 は確認した番号であり、総制作数125体を検証したものではない。'
    ],
    sources: ['OSD #86 · 公式定義と仕様', 'FCD EMMA · 量産ベースと1体のみの抽選について', 'ONE SELECTION DOLL 公式カテゴリ', 'Coordinate set 公式カテゴリ', 'Private Girl 公式展示記録', 'OSD #125 · 公開番号の出典']
  }
}

export function localizedLimitedGuide(lang = 'zh') {
  const translation = guideTranslations[lang]
  if (!translation) return { comparison: limitedComparison, milestones: limitedMilestones, sources: limitedSources }
  return {
    comparison: translation.comparison.map(([label, osd, fcd]) => ({ label, osd, fcd })),
    milestones: limitedMilestones.map((item, i) => ({ year: item.year, text: translation.milestones[i] })),
    sources: limitedSources.map((item, i) => ({ ...item, label: translation.sources[i] }))
  }
}
