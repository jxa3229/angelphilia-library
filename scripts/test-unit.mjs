import { readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const files = (await readdir(new URL('../tests/', import.meta.url)))
  .filter((name) => name.endsWith('.test.mjs')).sort().map((name) => `tests/${name}`)
if (!files.length) throw new Error('未找到单元测试')
const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' })
if (result.error) throw result.error
process.exitCode = result.status ?? 1
