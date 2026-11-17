import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compareRecentYear, yearSpan } from '../src/utils/records.js'
import { translateOutfitDescription } from '../src/utils/outfitText.js'
import { translateOutfitTitle } from '../src/utils/outfitText.js'
import { categoryLabel, outfitCategoryKey } from '../src/utils/outfitCategory.js'
import { localizedGlossary } from '../src/i18n/glossary.js'

test('最近发行年份降序，未知置后且不改变原数组', () => {
  const years = ['未明', '2012', '2026', '', '2020']
  assert.deepEqual([...years].sort(compareRecentYear).slice(0, 3), ['2026', '2020', '2012'])
  assert.equal(years[0], '未明')
})

test('年份跨度兼容未知、单年、全已知和空资料', () => {
  assert.equal(yearSpan(['2008', '2026', '未明']), '2008-2026')
  assert.equal(yearSpan(['2008', '2026']), '2008-2026')
  assert.equal(yearSpan(['2013']), '2013-2013')
  assert.equal(yearSpan(['未明']), '')
})

test('外装详情保留长正文尾部和空值处理', () => {
  const source = `Real Art Project ${'商品説明 '.repeat(100)}末尾の注意事項`
  const description = translateOutfitDescription(source)
  assert.ok(description.length > 220)
  assert.ok(description.endsWith('末尾の注意事項'))
  assert.equal(translateOutfitDescription(null), '')
})

test('外装三语标题和分类不改变商品标识', () => {
  const title = 'ウエイトレス(C-4W)'
  assert.equal(translateOutfitTitle(title, 'zh'), '女仆侍应套装(C-4W)')
  assert.equal(translateOutfitTitle(title, 'en'), 'Waitress set(C-4W)')
  assert.equal(translateOutfitTitle(title, 'ja'), title)
  assert.equal(translateOutfitTitle('ピンクウエディングセットＤＸ', 'en'), 'Pink wedding set DX')
  assert.equal(translateOutfitTitle('エンジェルフィリア', 'en'), 'ANGEL PHILIA')
  assert.equal(translateOutfitTitle('スーパーホワイティ', 'en'), 'Super Whitey')
  assert.equal(translateOutfitTitle('Pink Drops', 'zh'), 'Pink Drops')
  assert.equal(outfitCategoryKey({ title: 'ボブ ウィッグ' }), 'wig')
  assert.deepEqual(['zh', 'en', 'ja'].map((lang) => categoryLabel('wig', lang)), ['假发', 'Wigs', 'ウィッグ'])
})

test('术语三语内容结构和出典一致，正文与标签完整', () => {
  const source = localizedGlossary('zh')
  for (const lang of ['en', 'ja']) {
    const localized = localizedGlossary(lang)
    assert.deepEqual(Object.keys(localized.copy).sort(), Object.keys(source.copy).sort())
    for (const key of ['brands', 'relations', 'timeline', 'terms', 'operations']) {
      assert.equal(localized.data[key].length, source.data[key].length)
      assert.notEqual(JSON.stringify(localized.data[key]), JSON.stringify(source.data[key]))
    }
    assert.deepEqual(localized.sources.map(({ id, url }) => ({ id, url })), source.sources.map(({ id, url }) => ({ id, url })))
    assert.ok(localized.sources.every((item) => item.label && item.type))
    assert.ok(localized.data.brands.every((item) => item.text && item.detail && item.sources.every((id) => localized.sources.some((source) => source.id === id))))
  }
})
