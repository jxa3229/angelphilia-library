export function limitedCategories(record) {
  const title = [record.name, record.title].join(' ').normalize('NFKC')
  const categories = []

  if (/ONE[\s_-]*(?:SELECTION[\s_-]*DOLL|セレクションドール)/i.test(title)) {
    categories.push('osd')
  }
  if (/FULL[\s_-]*COOR[\s_-]*D(?:INATE|ONATE)[\s_-]*DOLL/i.test(title)) {
    categories.push('fcd')
  }
  // 仅使用明确的角色合作字段，避免把正文中的“非联动”或普通抽选款误收录。
  if (/角色联动款|联动完成品|联动套装/.test([record.head, record.body].join(' '))
    || /CATWOMAN/i.test(title)) {
    categories.push('collab')
  }

  return categories
}

export function limitedSearchText(record) {
  const aliases = { osd: 'OSD ONE SELECTION DOLL One-off ワンオフ 孤品', fcd: 'FCD Full Coordinate Doll 全套搭配', collab: '联动 角色合作 collaboration' }
  const characterAliases = /CATWOMAN/i.test([record.name, record.title].join(' ')) ? '猫女 貓女 キャットウーマン' : ''
  return [record.name, record.title, record.number, record.year, record.group, record.head, characterAliases,
    ...limitedCategories(record).map((category) => aliases[category])]
    .join(' ').normalize('NFKC').toLowerCase()
}
