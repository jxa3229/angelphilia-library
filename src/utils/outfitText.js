const phraseTranslations = [
  ['ギンガムウエイトレスセット', '格纹女仆侍应套装'],
  ['ピンクウエディングセットＤＸ', '粉色婚纱套装 DX'],
  ['ホワイトウエディングセットDX', '白色婚纱套装 DX'],
  ['長袖セーラー服ギンガム', '长袖格纹水手服'],
  ['ミッション系制服', '教会风制服'],
  ['モコモコフードパーカーセット', '毛绒连帽卫衣套装'],
  ['シースルーシャツ＆レインボースカートセット', '透视衬衫与彩虹裙套装'],
  ['チェッカーコート＆FUNDOSIランジェリー', '棋盘格外套与 FUNDOSI 内衣'],
  ['ディルドカスタムパーツ', '定制配件'],
  ['ディルドスタンドタイプ', '立座型配件'],
  ['ディルド双頭タイプ', '双头配件'],
  ['セミロングウィッグ', '中长假发'],
  ['ボブ ウィッグ', '波波头假发'],
  ['ラッピングドレス', '缠绕连衣裙'],
  ['モコモコパンダセット', '毛绒熊猫套装'],
  ['ショートファーコート', '短款毛绒外套'],
  ['和風メイドセット', '和风女仆套装'],
  ['半袖セーラー服', '短袖水手服'],
  ['スクールセット', '校园制服套装'],
  ['ウエイトレス', '女仆侍应套装'],
  ['ウエディング', '婚纱'],
  ['水着', '泳装'],
  ['外皮ボディパーツ', '外皮身体配件'],
  ['上胴', '上身'],
  ['下胴', '下身'],
  ['彩色済み', '已上色'],
  ['Pバン', 'P 绑带'],
  ['Rタイプ', 'R 型'],
  ['Vタイプ', 'V 型'],
  ['クリアブラック', '透明黑'],
  ['リアルカラー', '写实色'],
  ['ライトブルー', '浅蓝色'],
  ['ライトピンク', '浅粉色'],
  ['グレイ', '灰色'],
  ['グレー', '灰色'],
  ['ホワイト', '白色'],
  ['ブラック', '黑色'],
  ['ピンク', '粉色'],
  ['ブルー', '蓝色'],
  ['イエロー', '黄色'],
  ['エンジ', '酒红色'],
  ['紺', '藏青'],
  ['Blond', '金色'],
  ['Brown', '棕色'],
  ['Pink', '粉色'],
  ['褐色', '褐色'],
  ['ホワイティ', 'Whitey'],
  ['スーパーホワイティ', 'Super Whitey']
]

const singleLetterColors = {
  WBR: '白色/棕色',
  WLB: '白色/浅蓝色',
  WBL: '白色/蓝色',
  WP: '白色/粉色',
  WR: '白色/红色',
  WG: '白色/绿色',
  BS: '黑色 S',
  GS: '绿色 S',
  B: '黑色',
  W: '白色',
  P: '粉色',
  BL: '蓝色',
  LB: '浅蓝色',
  BR: '棕色',
  G: '绿色',
  R: '红色'
}

export function translateOutfitTitle(title) {
  let translated = normalizeTitle(title)

  for (const [source, target] of phraseTranslations) {
    translated = translated.replaceAll(source, target)
  }

  translated = translated
    .replace(/[「」｢｣]/g, '')
    .replace(/[（）]/g, (char) => (char === '（' ? '(' : ')'))
    .replace(/セットDX/g, '套装 DX')
    .replace(/セット/g, '套装')
    .replace(/サイズ/g, '尺寸')
    .replace(/価格/g, '价格')
    .replace(/タイプ/g, '型')
    .replace(/：/g, ': ')
    .replace(/\s+/g, ' ')
    .trim()

  return translated || title
}

export function translateOutfitDescription(description) {
  const text = String(description || '')
    .replace(/^Real Art Project\s*/, '')
    .replace(/カートの確認をする/g, '')
    .replace(/ホーム/g, '')
    .replace(/全件表示/g, '')
    .replace(/在庫商品/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > 220 ? `${text.slice(0, 220)}...` : text
}

function normalizeTitle(title) {
  return String(title || '')
    .replace(/[Ａ-Ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/([（(])([A-Z]{1,3})([)）])/g, (_, left, code, right) => `${left}${singleLetterColors[code] || code}${right}`)
    .replace(/([A-Z]{1,3})$/, (code) => singleLetterColors[code] || code)
}
