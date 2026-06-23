import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const privateManifestFile = path.join(root, '.cache', 'library-records-private.json')
const outputDir = path.join(root, 'public', 'details')
const legacyOutputFile = path.join(root, 'public', 'details.json')

const records = JSON.parse(await readFile(privateManifestFile, 'utf8'))

await rm(legacyOutputFile, { force: true })
await rm(outputDir, { recursive: true, force: true })
await mkdir(outputDir, { recursive: true })

let extracted = 0

for (const record of records) {
  if (!record.detailKey) continue
  const html = await extractMarkdownDetail(record)
  await writeFile(path.join(outputDir, `${record.detailKey}.html`), `${html}\n`, 'utf8')
  extracted += 1
}

console.log(`Extracted ${extracted} record details to ${path.relative(root, outputDir)}`)

async function extractMarkdownDetail(record) {
  if (!record.sourceFolder) return ''

  try {
    const markdown = await readFile(path.join(root, 'records', record.sourceFolder, 'record.md'), 'utf8')
    return markdownToHtml(markdown)
  } catch {
    return ''
  }
}

function markdownToHtml(markdown) {
  const html = []
  let paragraph = []
  let inList = false

  const closeParagraph = () => {
    if (!paragraph.length) return
    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`)
    paragraph = []
  }

  const closeList = () => {
    if (!inList) return
    html.push('</ul>')
    inList = false
  }

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line) {
      closeParagraph()
      closeList()
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      closeParagraph()
      closeList()
      const level = Math.min(heading[1].length, 6)
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
      continue
    }

    const bullet = line.match(/^[-*]\s+(.+)$/)
    if (bullet) {
      closeParagraph()
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${renderInline(bullet[1])}</li>`)
      continue
    }

    paragraph.push(line)
  }

  closeParagraph()
  closeList()
  return html.join('\n')
}

function renderInline(value) {
  let html = escapeHtml(value)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, href) => {
    const safeHref = String(href).replace(/"/g, '&quot;')
    return `<a href="${safeHref}" target="_blank" rel="noreferrer">${text}</a>`
  })
  return html
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
