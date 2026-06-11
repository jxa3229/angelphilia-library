import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import mammoth from 'mammoth'

const root = process.cwd()
const recordsFile = path.join(root, 'src', 'data', 'records.json')
const outputFile = path.join(root, 'public', 'details.json')

const records = JSON.parse(await readFile(recordsFile, 'utf8'))
const details = {}

for (const record of records) {
  details[record.detailKey] = await extractDocxDetail(record)
}

await mkdir(path.dirname(outputFile), { recursive: true })
await writeFile(outputFile, `${JSON.stringify(details, null, 2)}\n`, 'utf8')

console.log(`Extracted ${Object.keys(details).length} DOCX details to ${path.relative(root, outputFile)}`)

async function extractDocxDetail(record) {
  if (!record.folder) return ''

  try {
    const result = await mammoth.convertToHtml({
      path: path.join(root, 'records', record.folder, 'record.docx')
    })
    return result.value || ''
  } catch {
    return ''
  }
}
