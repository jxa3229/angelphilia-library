import { cp, mkdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const recordsFile = path.join(root, 'src', 'data', 'records.json')
const sourceRoot = path.join(root, 'records')
const targetRoot = path.join(root, 'public', 'media')
const transientWindowsErrors = new Set(['ENOTEMPTY', 'EBUSY', 'EPERM'])
const records = JSON.parse(await readFile(recordsFile, 'utf8'))

await mkdir(path.dirname(targetRoot), { recursive: true })
await removeWithRetry(targetRoot)
await mkdir(targetRoot, { recursive: true })

let copied = 0

for (const record of records) {
  if (!record.folder || !record.safeFolder) continue
  await cp(path.join(sourceRoot, record.folder), path.join(targetRoot, record.safeFolder), { recursive: true })
  copied += 1
}

console.log(`Copied ${copied} record folders to ${path.relative(root, targetRoot)}`)

async function removeWithRetry(target, attempts = 5) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await rm(target, { recursive: true, force: true, maxRetries: 2, retryDelay: 120 })
      return
    } catch (error) {
      if (!transientWindowsErrors.has(error.code) || attempt === attempts) {
        throw error
      }
      await wait(180 * attempt)
    }
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
