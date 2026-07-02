const LABELS = {
  clothing: '\u8863\u670d',
  wig: '\u5047\u53d1',
  shoes: '\u978b\u5b50',
  accessory: '\u5176\u4ed6\u914d\u4ef6'
}

const CATEGORY_ORDER = [
  LABELS.clothing,
  LABELS.wig,
  LABELS.shoes,
  LABELS.accessory
]

const ACCESSORY_PATTERN = /\u30d0\u30c3\u30b0|\u304b\u3070\u3093|\u30ab\u30d0\u30f3|\u30cf\u30f3\u30c9\u30d0\u30c3\u30b0|\u30b9\u30af\u30fc\u30eb\u30d0\u30c3\u30b0|P\u30d0\u30f3|P\u30d0\u30f3\u7d10|\u30d0\u30f3\u7d10|\u5b9a\u5236\u914d\u4ef6|\u7acb\u5ea7\u578b\u914d\u4ef6|\u53cc\u5934\u914d\u4ef6|\u30c7\u30a3\u30eb\u30c9|\u30ab\u30b9\u30bf\u30e0\u30d1\u30fc\u30c4|\u30b9\u30bf\u30f3\u30c9\u30bf\u30a4\u30d7|\u53cc\u982d\u30bf\u30a4\u30d7|\u5c0f\u7269|bags?|handbags?/i
const WIG_PATTERN = /\u30a6\u30a3\u30c3\u30b0|\u30d8\u30a2|\u304b\u3064\u3089|wig|hair/i
const SHOE_PATTERN = /\u9774|\u30b7\u30e5\u30fc\u30ba|\u30b9\u30cb\u30fc\u30ab\u30fc|\u30d6\u30fc\u30c4|\u30d1\u30f3\u30d7\u30b9|\u30d2\u30fc\u30eb|\u30df\u30e5\u30fc\u30eb|\u30b5\u30f3\u30c0\u30eb|\u30ed\u30fc\u30d5\u30a1\u30fc|boots?|shoes?|sneakers?|pumps?|heels?|mules?|sandals?|loafers?/i
const CLOTHING_PATTERN = /\u30ef\u30f3\u30d4|\u30c9\u30ec\u30b9|\u5236\u670d|\u6c34\u7740|\u670d|\u30d6\u30e9|\u30d6\u30eb\u30de|\u30b9\u30ab\u30fc\u30c8|\u30d1\u30f3\u30c4|\u30b7\u30e7\u30fc\u30c4|\u30e9\u30f3\u30b8\u30a7\u30ea\u30fc|\u30bd\u30c3\u30af\u30b9|\u30cb\u30fc\u30bd\u30c3\u30af\u30b9|\u30bf\u30a4\u30c4|\u30ec\u30fc\u30b9\u30a2\u30c3\u30d7|\u30b8\u30e3\u30fc\u30b8|\u30c0\u30a4\u30ca\u30fc|dress|skirt|socks?|tights?|lingerie|swim/i

export function outfitCategoryLabel(item) {
  const title = String(item?.title || '')
  const text = `${title} ${item?.description || ''}`

  if (WIG_PATTERN.test(title)) return LABELS.wig
  if (SHOE_PATTERN.test(title)) return LABELS.shoes
  if (ACCESSORY_PATTERN.test(title)) return LABELS.accessory
  if (CLOTHING_PATTERN.test(text) || item?.category === 'outfit') return LABELS.clothing
  return LABELS.accessory
}

export function sortOutfitCategories(categories) {
  return [...categories].sort((left, right) => {
    const leftIndex = CATEGORY_ORDER.indexOf(left)
    const rightIndex = CATEGORY_ORDER.indexOf(right)
    if (leftIndex !== -1 || rightIndex !== -1) {
      return (leftIndex === -1 ? CATEGORY_ORDER.length : leftIndex)
        - (rightIndex === -1 ? CATEGORY_ORDER.length : rightIndex)
    }
    return left.localeCompare(right)
  })
}
