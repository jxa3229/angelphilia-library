import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { dollRosterGroups } from '../src/data/dollRoster.js'
import { matchRosterEntry, resolveDollRoster } from '../src/utils/dollRoster.js'

const group = (id) => dollRosterGroups.find((item) => item.id === id)
const entry = (brand, number) => group(brand).entries.find((item) => item.number === number)
const match = (brand, number, records) => matchRosterEntry(entry(brand, number), records, group(brand).entries)
const pink = (number, name) => ({ group: 'RealArtProject', series: 'Pink Drops', number, name })

test('same numbers and names do not cross brand boundaries', () => {
  const records = [
    { group: 'VMF50', series: 'Angel Philia', number: '#1', name: 'MIU' },
    { group: 'AngelPhilia', series: 'Angel Philia', number: '#1', name: 'MIU' },
    pink('#1', 'MIU'),
    { group: 'RealArtProject', series: 'Angel Philia', number: '#1', name: '伽琉羅 KARURA' },
    pink('#16', '伽琉羅')
  ]
  assert.deepEqual(match('vmf', 1, records), [records[0]])
  assert.deepEqual(match('dollcore', 1, records), [records[3]])
  assert.deepEqual(match('pinkdrops', 16, records), [records[4]])
})

test('numbers normalize leading zeroes and full-width characters; Latin names use token boundaries', () => {
  const records = [
    { group: 'VMF50', number: '＃０１', name: 'MIU 再販版' },
    { group: 'VMF50', number: '#10', name: 'MIU' },
    { group: 'VMF50', number: '#1', name: 'MIUKU' }
  ]
  assert.deepEqual(match('vmf', 1, records), [records[0]])
})

test('shared romanization cannot connect different Pink Drops numbers or unnumbered ambiguous names', () => {
  const records = [pink('#7', 'Manami'), pink('#30', 'Manami'), pink('#67', 'Manami'), pink('', 'Manami'), pink('', '摩雫媚')]
  assert.deepEqual(match('pinkdrops', 7, records), [records[0], records[4]])
  assert.deepEqual(match('pinkdrops', 30, records), [records[1]])
  assert.deepEqual(match('pinkdrops', 67, records), [records[2]])
  assert.deepEqual(match('pinkdrops', 35, [pink('#59', '小夏'), pink('', '小夏')]), [])
})

test('a mismatching name or an undocumented slot never creates a link from number alone', () => {
  assert.deepEqual(match('pinkdrops', 22, [pink('#22', '愛麗奈（エリナ）')]), [])
  assert.deepEqual(match('pinkdrops', 41, [pink('#41', 'Unknown')]), [])
})

test('all versions remain available and early collaborations exclude later namesakes', () => {
  const records = [
    { group: 'VMF50', name: 'Sonico', year: '2011' },
    { group: 'AngelPhilia', name: 'Sonico', year: '2012' },
    { group: 'AngelPhilia', name: 'Sonico', year: '2020' },
    { group: 'PinkDrops', series: 'Pink Drops', name: 'Sonico', year: '2011' }
  ]
  const sonico = group('collab').entries.find((item) => item.names.en === 'Sonico')
  assert.deepEqual(matchRosterEntry(sonico, records, group('collab').entries), records.slice(0, 2))
})

test('provided directory covers four named groups and resolves against all actual library records', () => {
  const records = ['records', 'realartArchive', 'limitedOfficial'].flatMap((file) =>
    JSON.parse(readFileSync(new URL(`../src/data/${file}.json`, import.meta.url), 'utf8')))
  const groups = resolveDollRoster(dollRosterGroups, records)
  assert.deepEqual(groups.map((item) => item.entries.length), [13, 4, 3, 84])
  assert.equal(new Set(groups.flatMap((item) => item.entries.map((row) => row.id))).size, 104)
  for (const item of groups.filter((item) => ['vmf', 'dollcore', 'collab'].includes(item.id))) {
    assert(item.entries.every((row) => row.records.length > 0))
  }
  const pd = groups.find((item) => item.id === 'pinkdrops')
  assert(pd.entries.find((row) => row.number === 82).records.some((record) => record.name === 'RINA'))
  assert.equal(pd.entries.find((row) => row.number === 41).records.length, 0)
  const vmfMiu = groups[0].entries[0]
  assert.equal(vmfMiu.records.length, 3)
  assert(vmfMiu.records.every((record) => record.group === 'VMF50'))
})
