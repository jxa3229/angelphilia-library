const CODE_CATEGORY_MAP = {
  upperTorso: 'upper',
  lowerTorso: 'lower',
  thigh: 'thigh'
}

export function buildPartIndex(parts = []) {
  return parts.reduce((index, part) => {
    index.byId.set(part.id, part)
    if (!index.byCategory.has(part.category)) {
      index.byCategory.set(part.category, [])
    }
    index.byCategory.get(part.category).push(part)
    return index
  }, { byId: new Map(), byCategory: new Map() })
}

export function findPartByType(parts = [], category, type) {
  const normalized = String(type || '').toUpperCase()
  return parts.find((part) => part.category === category && String(part.type).toUpperCase() === normalized) || null
}

export function parseBodyCode(code = '', parts = []) {
  const chars = String(code).trim().toUpperCase().split('')
  const categories = ['upperTorso', 'lowerTorso', 'thigh']
  return categories.reduce((selection, category, index) => {
    const part = findPartByType(parts, category, chars[index])
    if (part) selection[category] = part.id
    return selection
  }, {})
}

export function generateBodyCode(selection = {}, parts = []) {
  const partIndex = buildPartIndex(parts)
  return ['upperTorso', 'lowerTorso', 'thigh']
    .map((category) => partIndex.byId.get(selection[category])?.type || '?')
    .join('')
    .toUpperCase()
}

export function buildInitialSelection(data) {
  return {
    frame: data.defaults.frame,
    ...data.defaults.initialSelection,
    shin: data.defaults.shin,
    upperArm: data.defaults.upperArm,
    forearm: data.defaults.forearm,
    hand: data.defaults.hand,
    foot: data.defaults.foot
  }
}

export function buildDefaultSlotText(selection = {}, defaults = {}) {
  return ['frame', 'upperArm', 'forearm', 'shin', 'hand', 'foot']
    .filter((slot) => selection[slot] === defaults[slot])
    .map((slot) => {
      if (slot === 'upperArm' || slot === 'forearm') return 'arms'
      if (slot === 'shin') return 'shins'
      if (slot === 'hand') return 'hands'
      if (slot === 'foot') return 'feet'
      return slot
    })
    .filter((value, index, list) => list.indexOf(value) === index)
    .join('+')
}

export function buildCopySummary({ selection, parts, head, defaults }) {
  const code = generateBodyCode(selection, parts)
  const defaultText = buildDefaultSlotText(selection, defaults)
  const chunks = [`Body ${code}`]

  if (defaultText) {
    chunks.push(`default Obitsu ${defaultText}`)
  }

  if (!head || !selection.includeHeadMeasurements) {
    chunks.push('no head data')
    return chunks.join(' / ')
  }

  const headGirth = head.measurements?.headCircumference?.value
  const eyeSizes = head.eyeSizeOptions?.map((item) => item.raw).join(',')
  const headChunks = [`head ${head.type}`]
  if (headGirth) headChunks.push(`head girth ${headGirth}cm`)
  if (eyeSizes) headChunks.push(`eye ${eyeSizes}`)
  else headChunks.push('eye pending')
  chunks.push(headChunks.join(' / '))
  return chunks.join(' / ')
}

export function bodyCodeFromRecord(record = {}) {
  if (record.bodyCode) return String(record.bodyCode).trim().toUpperCase()

  const pieces = String(record.body || '')
    .split('/')
    .map((piece) => piece.trim().toUpperCase().replace(/^TYPE-?/, ''))

  if (pieces.length < 3) return ''
  if (pieces.slice(0, 3).some((piece) => !piece || piece.includes('未明'))) return ''
  return pieces.slice(0, 3).join('')
}

export function buildPresetDescriptions(presets = [], records = [], limit = 3) {
  return presets.reduce((descriptions, preset) => {
    const code = preset.code || ''
    if (!code) return descriptions

    const examples = records
      .filter((record) => bodyCodeFromRecord(record) === code)
      .sort((left, right) => Number(right.year || 0) - Number(left.year || 0))
      .slice(0, limit)
      .map((record) => record.name)
      .filter(Boolean)

    descriptions[preset.id] = examples.length
      ? `档案示例：${examples.join('、')}`
      : preset.fallbackDescription || ''
    return descriptions
  }, {})
}

export function codePrefixForCategory(category) {
  return CODE_CATEGORY_MAP[category] || category
}
