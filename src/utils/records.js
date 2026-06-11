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
