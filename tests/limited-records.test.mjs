import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { limitedCategories, limitedSearchText } from '../src/utils/limitedRecords.js'
import { normalizeSelectionName } from '../src/utils/recordNames.js'
import { limitedCopy, localizeLimitedRecord, localizedLimitedGuide } from '../src/i18n/limited.js'

test('OSD accepts official English and early Japanese product names', () => {
  for (const name of ['ONE SELECTION DOLL #125', 'ONEセレクションドール_No24', 'One Selection Doll #86']) {
    assert.deepEqual(limitedCategories({ name }), ['osd'])
  }
})

test('FCD tolerates spacing and the spelling used in official URLs', () => {
  for (const title of ['Full Coordinate Doll Type-EMMA', 'Full Coor dinate Doll', 'Full Coordonate Doll LENA']) {
    assert.deepEqual(limitedCategories({ title }), ['fcd'])
  }
})

test('ordinary lottery sales and negative collaboration notes do not become limited records', () => {
  assert.deepEqual(limitedCategories({ name: '通常款抽选销售', head: '非联动', body: '普通量产素体' }), [])
  assert.deepEqual(limitedCategories({ name: 'ONE SELECTION HEAD #02' }), [])
  assert.deepEqual(limitedCategories({ name: 'Secret Selection Doll' }), [])
})

test('role collaborations are found through their explicit metadata', () => {
  assert.deepEqual(limitedCategories({ name: 'Sonico', head: 'Sonico 角色联动款' }), ['collab'])
  assert.deepEqual(limitedCategories({ name: 'Catwoman' }), ['collab'])
})

test('abbreviations and full-width numbers remain searchable', () => {
  assert(limitedSearchText({ name: 'ONEセレクションドール_No24' }).includes('osd'))
  assert(limitedSearchText({ name: 'Full Coordinate Doll Type-EMMA' }).includes('fcd'))
  assert(limitedSearchText({ name: 'ONE SELECTION DOLL #１２５' }).includes('#125'))
  assert(limitedSearchText({ name: 'Catwoman' }).includes('猫女'))
})

test('supplemental official records use page titles rather than stale URL slugs', () => {
  const official = JSON.parse(readFileSync(new URL('../src/data/limitedOfficial.json', import.meta.url), 'utf8'))
  assert.equal(new Set(official.map((record) => record.folder)).size, official.length)
  assert.equal(new Set(official.map((record) => record.sourceUrl)).size, official.length)
  const staleSlug = official.find((record) => record.sourceUrl.includes('-8780.html'))
  assert.equal(staleSlug.number, '#119')
  for (const record of official) {
    assert(record.title.includes(record.number))
    assert.deepEqual(limitedCategories(record), ['osd'])
    assert.equal(new URL(record.sourceUrl).hostname, 'quarantotto.biz')
    assert(record.images.length > 0)
  }
})

test('display names preserve numbers, prose spacing and source identifiers', () => {
  assert.equal(normalizeSelectionName('ONEセレクションドール_No26'), 'ONE SELECTION DOLL #26')
  assert.equal(normalizeSelectionName('ONEセレクションドール№30'), 'ONE SELECTION DOLL #30')
  assert.equal(normalizeSelectionName('ONE SELECTION DOLL is unique'), 'ONE SELECTION DOLL is unique')
  const input = { name: 'ONEセレクションドール_No26', folder: '2016_ONEセレクションドール_No26', sourceUrl: 'https://example.test/ONEセレクションドール_No26' }
  const translated = localizeLimitedRecord(input, 'zh')
  assert.equal(translated.name, 'ONE SELECTION DOLL #26')
  assert.equal(translated.folder, input.folder)
  assert.equal(translated.sourceUrl, input.sourceUrl)
})

test('official descriptions switch languages without mutating source data or specifications', () => {
  const records = JSON.parse(readFileSync(new URL('../src/data/limitedOfficial.json', import.meta.url), 'utf8'))
  for (const record of records) {
    const before = JSON.stringify(record)
    const zh = localizeLimitedRecord(record, 'zh')
    const en = localizeLimitedRecord(record, 'en')
    const ja = localizeLimitedRecord(record, 'ja')
    assert(zh.description.includes('身体配置'))
    assert(en.description.includes('Body configuration'))
    assert(ja.description.includes('ボディ'))
    assert(!/[\u3040-\u30ff]/.test(zh.body))
    assert(!/[\u3040-\u30ff]/.test(en.body))
    for (const token of record.body.match(/Type-[A-Z]\d*/g) || []) {
      assert(zh.body.includes(token))
      assert(en.body.includes(token))
    }
    for (const translated of [zh, en, ja]) {
      assert(translated.name.includes(record.number))
      assert.equal(translated.sourceUrl, record.sourceUrl)
      assert.deepEqual(translated.images, record.images)
    }
    assert.equal(JSON.stringify(record), before)
  }
  const record119 = records.find((record) => record.number === '#119')
  assert(localizeLimitedRecord(record119, 'zh').description.includes('48cm'))
  assert(localizeLimitedRecord(record119, 'en').description.includes('12mm'))
  assert(localizeLimitedRecord(record119, 'zh').body.includes('不含用于铁板底座的磁铁'))
})

test('limited page translations cover every UI key and retain the same official references', () => {
  for (const lang of ['zh', 'en', 'ja']) {
    assert.deepEqual(Object.keys(limitedCopy[lang]).sort(), Object.keys(limitedCopy.zh).sort())
    const guide = localizedLimitedGuide(lang)
    assert.equal(guide.comparison.length, 6)
    assert.equal(guide.milestones.length, 5)
    assert.deepEqual(guide.sources.map((item) => item.url), localizedLimitedGuide('zh').sources.map((item) => item.url))
  }
  const collab = { name: '関羽雲長 ナース服Ver.', head: '関羽雲長 角色联动款', body: 'vmf50 角色联动完成品' }
  assert.equal(localizeLimitedRecord(collab, 'zh').name, '关羽云长 护士装版')
  assert.equal(localizeLimitedRecord(collab, 'en').name, 'Kanu Unchou Nurse Ver.')
  assert(localizeLimitedRecord(collab, 'ja').body.includes('キャラクターコラボ'))
})
