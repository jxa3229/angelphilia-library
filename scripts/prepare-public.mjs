import { cp, mkdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const recordsFile = path.join(root, 'src', 'data', 'records.json')
const sourceRoot = path.join(root, 'records')
const targetRoot = path.join(root, 'public', 'media')
const records = JSON.parse(await readFile(recordsFile, 'utf8'))

await mkdir(path.dirname(targetRoot), { recursive: true })
await rm(targetRoot, { recursive: true, force: true })
await mkdir(targetRoot, { recursive: true })

let copied = 0

for (const record of records) {
  if (!record.folder || !record.safeFolder) continue
  await cp(path.join(sourceRoot, record.folder), path.join(targetRoot, record.safeFolder), { recursive: true })
  copied += 1
}

console.log(`Copied ${copied} record folders to ${path.relative(root, targetRoot)}`)
