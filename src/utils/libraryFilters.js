export const unknownFilterValue = '__unknown__'

export function recordHeadType(record) {
  return String(record.headType || '').normalize('NFKC').trim() || unknownFilterValue
}

export function recordSkinTone(record) {
  const value = String(record.skin || '').normalize('NFKC').trim()
  if (!value || /未明|未确认|未確認|未完整|未完[整全]|见官方|見官方|unknown|unconfirmed/i.test(value)) return unknownFilterValue

  const superWhite = /super\s*whit(?:e|y)|スーパー(?:ホワイティ|白肌)|超白/i.test(value)
  const tan = /\btan\b|褐色|日焼け肌/i.test(value)
  const white = !superWhite && /\bwhit(?:e|ey|y)\b|ホワイティ|白肌/i.test(value)
  if (Number(superWhite) + Number(tan) + Number(white) > 1) return 'Mixed'
  if (superWhite) return 'Super Whitey'
  if (tan) return 'Tan'
  if (white) return 'Whity'
  if (/ノーマル肌|normal/i.test(value)) return 'Normal'
  return value
}
