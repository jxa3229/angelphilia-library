import { normalizeSelectionName } from './recordNames.js'

const normalize = (value) => String(value || '').normalize('NFKC').trim().toUpperCase()

export function rosterBrand(record) {
  const group = normalize(record.group).replace(/\s+/g, '')
  const series = normalize(record.series).replace(/\s+/g, '')
  if (series === 'PINKDROPS' || group === 'PINKDROPS') return 'pinkdrops'
  if (/ONE SELECTION DOLL/i.test(normalizeSelectionName(record.name))) return 'osd'
  if (group === 'REALARTPROJECT' && series === 'ANGELPHILIA') return 'dollcore'
  if (group === 'VMF50') return 'vmf'
  return ''
}

function recordNumber(record) {
  const field = normalize(record.number)
  const explicit = field.match(/^(?:#|NO\.?\s*)?0*(\d+)$/)
  if (explicit) return Number(explicit[1])
  const name = normalize(normalizeSelectionName(record.name))
  const selection = name.match(/^ONE SELECTION DOLL\s*#0*(\d+)\b/)
  return selection ? Number(selection[1]) : null
}

function hasName(value, alias) {
  const name = normalize(value)
  const token = normalize(alias)
  if (!token) return false
  if (/^[A-Z0-9 -]+$/.test(token)) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^A-Z0-9])${escaped}(?=$|[^A-Z0-9])`).test(name)
  }
  return name.includes(token)
}

export function matchRosterEntry(entry, records, peers = []) {
  if (!entry.aliases.length) return []
  return records.filter((record) => {
    const brand = rosterBrand(record)
    if (entry.brand === 'collab') {
      // 早期联动在旧资料中归入 VMF50 或 AngelPhilia，不把后期品牌同名款混入。
      const early = !/^\d{4}$/.test(record.year) || Number(record.year) <= 2013
      if (!early || !['VMF50', 'AngelPhilia'].includes(record.group) || !['', 'vmf'].includes(brand)) return false
    } else if (brand !== entry.brand) return false

    const number = recordNumber(record)
    if (number !== null && entry.number !== null && number !== entry.number) return false
    if (entry.brand === 'osd') return number === entry.number

    return entry.aliases.some((alias) => {
      // 缺号条目仅允许使用品牌内唯一的别名，避免 Manami 等重名串档。
      if (number === null && peers.some((peer) => peer.id !== entry.id
        && peer.aliases.some((other) => normalize(other) === normalize(alias)))) return false
      return hasName(record.name, alias)
    })
  })
}

export function resolveDollRoster(groups, records) {
  return groups.map((group) => ({
    ...group,
    entries: group.entries.map((entry) => ({ ...entry, records: matchRosterEntry(entry, records, group.entries) }))
  }))
}
