// 仅规范展示名称，不改来源 URL、历史目录及文件名。
export function normalizeSelectionName(value = '') {
  return value.replace(/(?:ONE[\s_-]*(?:セレクションドール|SELECTION[\s_-]*DOLL)|ワンセレクションドール)(?:[\s_]*(?:No\.?|№|＃|#)\s*(\d+))?/gi,
    (_, number) => `ONE SELECTION DOLL${number ? ` #${number}` : ''}`)
}

export function normalizeRecordName(record) {
  return { ...record, name: normalizeSelectionName(record.name), title: normalizeSelectionName(record.title) }
}
