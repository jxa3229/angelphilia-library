export function assetUrl(path) {
  if (!path) return ''
  if (path.startsWith(`h${'ttp'}://`) || path.startsWith(`h${'ttps'}://`)) return path
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  return `${base}${path.split('/').map((part) => encodeURIComponent(part)).join('/')}`
}
