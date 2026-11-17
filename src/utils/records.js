export function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

export function compareYear(a, b) {
  const left = Number.parseInt(a, 10)
  const right = Number.parseInt(b, 10)
  if (Number.isNaN(left) && Number.isNaN(right)) return String(a).localeCompare(String(b))
  if (Number.isNaN(left)) return 1
  if (Number.isNaN(right)) return -1
  return left - right
}

export function compareRecentYear(a, b) {
  const left = Number.parseInt(a, 10)
  const right = Number.parseInt(b, 10)
  if (Number.isNaN(left) || Number.isNaN(right)) return compareYear(a, b)
  return right - left
}

export function yearSpan(values) {
  const years = values.map((value) => Number.parseInt(value, 10)).filter(Number.isFinite)
  return years.length ? `${Math.min(...years)}-${Math.max(...years)}` : ''
}
