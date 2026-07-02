import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { exec } from 'node:child_process'
import { createHash } from 'node:crypto'
import path from 'node:path'

const root = process.cwd()
const overridesFile = path.join(root, 'output', 'body-code-audit', 'source-url-overrides.json')
const outputDir = path.join(root, '.cache', 'source-web-pages')
const overrides = JSON.parse(await readFile(overridesFile, 'utf8'))

await mkdir(outputDir, { recursive: true })

for (const override of overrides) {
  if (!override.sourceUrl) continue
  const cacheFile = path.join(outputDir, `${hashUrl(override.sourceUrl)}.json`)
  const result = await fetchUrl(override.sourceUrl)
  await writeFile(cacheFile, `${JSON.stringify({
    fetchedAt: new Date().toISOString(),
    recordPath: override.recordPath,
    sourceUrl: override.sourceUrl,
    sourceType: override.sourceType || '',
    ok: result.ok,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode
  }, null, 2)}\n`, 'utf8')

  const label = result.ok ? 'ok' : `failed:${result.exitCode}`
  console.log(`${label} ${override.sourceUrl}`)
}

function fetchUrl(url) {
  return new Promise((resolve) => {
    const command = `${process.platform === 'win32' ? 'npx.cmd' : 'npx'} @langgraph-js/web-fetch ${quoteShellArg(url)} --json --timeout 30`
    exec(command, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10,
      windowsHide: true,
      env: {
        ...process.env,
        NODE_OPTIONS: [process.env.NODE_OPTIONS, '--experimental-global-webcrypto'].filter(Boolean).join(' ')
      }
    }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: error?.code || 0
      })
    })
  })
}

function quoteShellArg(value) {
  if (process.platform === 'win32') {
    return `"${String(value).replace(/"/g, '\\"')}"`
  }
  return `'${String(value).replace(/'/g, "'\\''")}'`
}

function hashUrl(url) {
  return createHash('sha1').update(url, 'utf8').digest('hex').slice(0, 16)
}
