import { readFile, writeFile } from 'node:fs/promises'
import { compareRecentYear, unique, yearSpan } from '../src/utils/records.js'
import { normalizeRecordName } from '../src/utils/recordNames.js'

const files = ['records', 'realartArchive', 'limitedOfficial']
const records = (await Promise.all(files.map(async (name) => JSON.parse(
  await readFile(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8')
)))).flat().map(normalizeRecordName)
const summary = {
  total: records.length,
  yearSpan: yearSpan(records.map((record) => record.year)),
  imageCount: records.filter((record) => record.images?.length || record.safeImageUrl || record.imageUrl || record.safeFolder).length,
  groupCount: unique(records.map((record) => record.group)).length,
  recentRecords: [...records].sort((a, b) => compareRecentYear(a.year, b.year)).slice(0, 8)
    .map(({ folder, name, year }) => ({ folder, name, year }))
}
const output = new URL('../src/data/librarySummary.json', import.meta.url)
if (process.argv.includes('--check')) {
  if (JSON.stringify(JSON.parse(await readFile(output, 'utf8'))) !== JSON.stringify(summary)) {
    throw new Error('首页摘要已过期，请运行 npm run sync:summary')
  }
  console.log(`首页摘要校验通过：${summary.total} 条，${summary.yearSpan}`)
} else {
  await writeFile(output, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  console.log(`已同步首页摘要：${summary.total} 条`)
}
