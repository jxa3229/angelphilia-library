import assert from 'node:assert/strict'
import test from 'node:test'
import { recordHeadType, recordSkinTone, unknownFilterValue } from '../src/utils/libraryFilters.js'

test('skin tone aliases in all three languages share stable filter keys', () => {
  for (const skin of ['White', 'Whitey', 'Whity', 'ホワイティ', '白肌 外皮身体为已化妆']) {
    assert.equal(recordSkinTone({ skin }), 'Whity')
  }
  for (const skin of ['Super Whitey', 'スーパーホワイティ ※彩色済み', 'スーパー白肌', '超白肌']) {
    assert.equal(recordSkinTone({ skin }), 'Super Whitey')
  }
  for (const skin of ['Tan', '褐色', '褐色肌']) assert.equal(recordSkinTone({ skin }), 'Tan')
  assert.equal(recordSkinTone({ skin: 'ノーマル肌' }), 'Normal')
})

test('mixed skin and unknown records are not incorrectly assigned a single confirmed skin tone', () => {
  assert.equal(recordSkinTone({ skin: '褐色、 ＊上身・下身：スーパー白肌' }), 'Mixed')
  for (const skin of ['', '未明', '公开资料未完整确认', '公開資料未完整確認', '见官方规格']) {
    assert.equal(recordSkinTone({ skin }), unknownFilterValue)
  }
})

test('head filters use recorded head models and do not infer them from descriptive prose', () => {
  assert.equal(recordHeadType({ headType: 'Obitsu50-01' }), 'Obitsu50-01')
  assert.equal(recordHeadType({ headType: ' Ｄ ' }), 'D')
  assert.equal(recordHeadType({ head: 'Type-N custom face-up' }), unknownFilterValue)
})
