const allowedTags = new Set([
  'a', 'blockquote', 'br', 'code', 'dd', 'div', 'dl', 'dt', 'em', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'hr', 'img', 'li', 'ol', 'p', 'pre', 'span', 'strong', 'table',
  'tbody', 'td', 'th', 'thead', 'tr', 'ul'
])

const globalAttributes = new Set(['class', 'title'])
const tagAttributes = {
  a: new Set(['href', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan'])
}

export function sanitizeHtml(html) {
  if (!html || typeof document === 'undefined') return ''

  const template = document.createElement('template')
  template.innerHTML = html
  sanitizeNode(template.content)
  return template.innerHTML
}

function sanitizeNode(node) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove()
      continue
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      sanitizeElement(child)
    }

    if (child.childNodes.length) {
      sanitizeNode(child)
    }
  }
}

function sanitizeElement(element) {
  const tagName = element.tagName.toLowerCase()
  if (!allowedTags.has(tagName)) {
    element.replaceWith(...element.childNodes)
    return
  }

  for (const attribute of [...element.attributes]) {
    const name = attribute.name.toLowerCase()
    const value = attribute.value || ''
    const allowedForTag = tagAttributes[tagName]?.has(name)
    const allowed = globalAttributes.has(name) || allowedForTag

    if (!allowed || name.startsWith('on') || isUnsafeUrlAttribute(name, value)) {
      element.removeAttribute(attribute.name)
    }
  }

  if (tagName === 'a') {
    element.setAttribute('target', '_blank')
    element.setAttribute('rel', 'noopener noreferrer')
  }
}

function isUnsafeUrlAttribute(name, value) {
  if (!['href', 'src'].includes(name)) return false
  const normalized = value.trim().replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase()
  if (normalized.startsWith('javascript:')) return true
  if (normalized.startsWith('data:text/html')) return true
  return false
}
