const CORE_SLOTS = ['upperTorso', 'lowerTorso', 'thigh']

const SLOT_LABELS = {
  upperTorso: '上胴',
  lowerTorso: '下胴',
  thigh: 'フトモモ',
  shin: 'スネ',
  upperArm: '上腕',
  forearm: '下腕',
  arm: '腕',
  hand: '手',
  foot: '足'
}

export function parseBodyCompositionFromText(value, options = {}) {
  const sourceText = String(value || '').trim()
  const text = normalizeBodyText(sourceText)
  const sourceLine = extractBodySpecText(text) || (normalizeFullBodyType(text) ? text : '')
  if (!sourceLine) return null

  const parts = parseBodySegments(sourceLine)
  const code = buildBodyCode(parts)
  if (!isUsableBodyCode(code)) return null

  return {
    code,
    parts,
    sourceLine: sourceLine.trim(),
    source: options.source || ''
  }
}

export function parseBodyCodeFromSummary(value, options = {}) {
  const pieces = String(value || '')
    .split('/')
    .map((piece) => normalizeBodyType(piece) || normalizeTypeToken(piece.replace(/^TYPE-?/i, '').trim()))
    .filter(Boolean)

  const code = pieces.slice(0, 3).join('')
  if (!isUsableBodyCode(code)) return null

  const parts = {}
  for (const [index, slot] of CORE_SLOTS.entries()) {
    parts[slot] = {
      type: pieces[index],
      label: SLOT_LABELS[slot],
      sourceText: String(value || '')
    }
  }

  if (pieces[3]) {
    parts.shin = {
      type: pieces[3],
      label: SLOT_LABELS.shin,
      sourceText: String(value || '')
    }
  }

  return {
    code,
    parts,
    sourceLine: String(value || '').trim(),
    source: options.source || ''
  }
}

export function buildBodyCode(parts = {}) {
  return CORE_SLOTS.map((slot) => parts[slot]?.type || '').join('')
}

export function isUsableBodyCode(code) {
  return /^[A-Z][0-9]?[A-Z][0-9]?[A-Z][0-9]?$/.test(String(code || ''))
}

export function normalizeBodyType(value) {
  const text = normalizeBodyText(value)
    .replace(/T[P]?YPE/g, 'TYPE')
    .replace(/タイプ/g, 'TYPE')

  const typeMatch = text.match(/TYPE\s*-?\s*([A-Z](?:[0-9]|[IVX]+)?)/)
  if (typeMatch) return normalizeTypeToken(typeMatch[1])

  const vmfMatch = text.match(/VMF\s*50\s*TYPE\s*-?\s*([A-Z][0-9]?)/)
  if (vmfMatch) return vmfMatch[1]

  if (/OBITSU\s*50|OB50|オビツ\s*50/.test(text)) return 'Obitsu50'
  if (/HEEL|ヒール|跟鞋脚|跟鞋腳/.test(text)) return 'Heel'
  return ''
}

export function normalizeBodyText(value) {
  return String(value || '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[ⅠⅡⅢⅣⅤⅥ]/g, (char) => ({ Ⅰ: 'I', Ⅱ: 'II', Ⅲ: 'III', Ⅳ: 'IV', Ⅴ: 'V', Ⅵ: 'VI' })[char] || char)
    .replace(/[／]/g, '/')
    .replace(/[：]/g, ':')
    .replace(/[，]/g, ',')
    .replace(/､/g, '、')
    .replace(/[｡。]/g, '。')
    .replace(/[･・]/g, '・')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .toUpperCase()
    .trim()
}

export function extractBodySpecText(value) {
  const text = normalizeBodyText(value)
  const explicitMatches = [...text.matchAll(/(?:●|■|◆|・|-)?\s*(?:ボディ|BODY|身体|素体|素體)\s*[:：]?\s*/g)]
    .map((match) => text.slice(match.index + match[0].length, match.index + match[0].length + 900))
    .filter((chunk) => hasBodySpecPattern(chunk))

  if (explicitMatches.length) return cleanBodyLine(explicitMatches.at(-1))

  const fallback = text.match(/((?:上胴|上身|胸|CHEST)[^#\n\r]{0,260}(?:下胴|下身|腹|ABDOMEN|フトモモ|大腿|THIGH)[^#\n\r]{0,260})/)
  return fallback ? cleanBodyLine(fallback[1]) : ''
}

function parseBodySegments(sourceLine) {
  const parts = {}
  const segments = splitBodySegments(sourceLine)

  for (const segment of segments) {
    const normalizedSegment = normalizeImplicitSlash(segment)
    const separatorIndex = normalizedSegment.indexOf('/')
    if (separatorIndex === -1) continue

    const rawSlots = normalizedSegment.slice(0, separatorIndex).trim()
    const rawType = normalizedSegment.slice(separatorIndex + 1).trim()
    const slots = bodySlotsFromLabel(rawSlots)
    const type = normalizeBodyType(rawType)
    if (!slots.length || !type) continue

    for (const slot of slots) {
      parts[slot] = {
        type,
        label: SLOT_LABELS[slot] || rawSlots,
        sourceText: segment
      }
    }
  }

  if (!Object.keys(parts).length) {
    const fullBodyType = normalizeFullBodyType(sourceLine)
    if (fullBodyType) {
      for (const slot of ['upperTorso', 'lowerTorso', 'thigh', 'shin', 'upperArm', 'forearm']) {
        parts[slot] = {
          type: fullBodyType,
          label: SLOT_LABELS[slot],
          sourceText: sourceLine
        }
      }
    }
  }

  return parts
}

function normalizeImplicitSlash(segment) {
  if (segment.includes('/')) return segment
  return segment.replace(/((?:上胴|上身|胸|CHEST|下胴|下身|下半身|腹|ABDOMEN|フトモモ|太もも|大腿|THIGH|スネ|すね|小腿|CALF|上腕|上臂|下腕|下臂|腕|手臂|ARMS?|手首|手|HAND|足首|脚|足|腳|FEET|FOOT)(?:[・･](?:上胴|上身|胸|CHEST|下胴|下身|下半身|腹|ABDOMEN|フトモモ|太もも|大腿|THIGH|スネ|すね|小腿|CALF|上腕|上臂|下腕|下臂|腕|手臂|ARMS?|手首|手|HAND|足首|脚|足|腳|FEET|FOOT))*)\s*(T[P]?YPE|TYPE|タイプ)\s*-?\s*/i, '$1/$2-')
}

function splitBodySegments(value) {
  const compact = cleanBodyLine(value)
    .replace(/\([^)]*\)|（[^）]*）/g, '')
    .replace(/\s*、\s*/g, '、')
    .replace(/\s*,\s*/g, '、')
    .replace(/\s*\*\s*/g, '、')
    .replace(/[:：]\s*/g, '/')
    .replace(/((?:上胴|上身|胸|CHEST|下胴|下身|下半身|腹|ABDOMEN|フトモモ|太もも|大腿|THIGH|スネ|すね|小腿|CALF|上腕|上臂|下腕|下臂|腕|手臂|ARMS?|手首|手|HAND|足首|脚|足|腳|FEET|FOOT))\s+(TYPE\s*-?\s*[A-Z][0-9IVX]*|OBITSU\s*50|OB50|オビツ\s*50|ヒール足?|跟鞋脚|跟鞋腳)/g, '$1/$2')
    .replace(/\s+\/\s+(?=(?:上胴|上身|胸|CHEST|下胴|下身|下半身|腹|ABDOMEN|フトモモ|太もも|大腿|THIGH|スネ|すね|小腿|CALF|上腕|上臂|下腕|下臂|腕|手臂|ARMS?|手首|手|HAND|足首|脚|足|腳|FEET|FOOT)\s*\/)/g, '、')
    .replace(/(TYPE\s*-?\s*[A-Z][0-9IVX]*)(?:\s*[・･]\s*)(?=(?:上胴|上身|胸|CHEST|下胴|下身|下半身|腹|ABDOMEN|フトモモ|太もも|大腿|THIGH|スネ|すね|小腿|CALF|上腕|上臂|下腕|下臂|腕|手臂|ARMS?|手首|手|HAND|足首|脚|足|腳|FEET|FOOT)\s*(?:\(|（|\/)?)/g, '$1、')
    .replace(/(OBITSU\s*50|OB50|オビツ\s*50|ヒール足?|跟鞋脚|跟鞋腳)(?:\s*[・･]\s*)(?=(?:上胴|上身|胸|CHEST|下胴|下身|下半身|腹|ABDOMEN|フトモモ|太もも|大腿|THIGH|スネ|すね|小腿|CALF|上腕|上臂|下腕|下臂|腕|手臂|ARMS?|手首|手|HAND|足首|脚|足|腳|FEET|FOOT)\s*(?:\(|（)?)/g, '$1、')
    .replace(/\s+/g, ' ')

  const rawSegments = compact.split(/[、,]/).map((item) => item.trim()).filter(Boolean)
  const segments = []

  for (const segment of rawSegments) {
    if (segment.includes('/')) {
      segments.push(segment)
      continue
    }

    const previous = segments.at(-1)
    if (!previous) continue

    const inheritedType = previous.slice(previous.indexOf('/') + 1).trim()
    if (inheritedType && bodySlotsFromLabel(segment).length) {
      segments.push(`${segment}/${inheritedType}`)
    }
  }

  return segments
}

function hasBodySpecPattern(value) {
  const text = normalizeBodyText(value)
  if (normalizeFullBodyType(text)) return true

  return /(?:上胴|上身|胸|CHEST|下胴|下身|腹|ABDOMEN|フトモモ|大腿|THIGH|スネ|小腿|CALF)(?:\s*(?:\([^)]*\)|（[^）]*）))?\s*(?:[・･、]|\/|\s+TYPE)/.test(text)
    && /(?:上胴|上身|胸|CHEST|下胴|下身|腹|ABDOMEN|フトモモ|大腿|THIGH|スネ|小腿|CALF)[^。#\n\r]{0,80}(?:\/|\s+)[^。#\n\r]{0,80}(?:TYPE|タイプ|OBITSU|OB50|オビツ|ヒール|跟鞋脚|跟鞋腳)/.test(text)
}

function bodySlotsFromLabel(value) {
  const label = normalizeBodyText(value).replace(/\([^)]*\)|（[^）]*）/g, '')
  const slots = []

  if (/その他.*外皮/.test(label)) {
    return ['lowerTorso', 'thigh', 'shin']
  }

  if (/外装|外皮パーツ/.test(label)) {
    return ['upperTorso', 'lowerTorso', 'thigh', 'shin', 'upperArm', 'forearm']
  }

  if (/上胴|上身|胸|CHEST/.test(label)) slots.push('upperTorso')
  if (/下胴|下身|下半身|腹|ABDOMEN/.test(label)) slots.push('lowerTorso')
  if (/フトモモ|太もも|大腿|THIGH/.test(label)) slots.push('thigh')
  if (/スネ|すね|小腿|CALF/.test(label)) slots.push('shin')
  if (/上腕|上臂/.test(label)) slots.push('upperArm')
  if (/下腕|下臂/.test(label)) slots.push('forearm')
  if (/腕|手臂|ARMS?/.test(label) && !slots.includes('upperArm') && !slots.includes('forearm')) slots.push('arm')
  if (/手首|手|HAND/.test(label)) slots.push('hand')
  if (/足首|脚|足|腳|FEET|FOOT/.test(label)) slots.push('foot')

  return slots
}

function cleanBodyLine(value) {
  return normalizeBodyText(value)
    .replace(/^仕様\s*/, '')
    .replace(/^[:：]\s*/, '')
    .replace(/(?:●|■|◆|・|-)?\s*(?:ボディ|Body|身体|素体|素體)\s*[:：]?\s*/i, '')
    .replace(/(?:●|■|◆|・|-)?\s*(?:オプション|インナーフレーム|内部フレーム|成型色|材質|発売元|ヘッド|ドールアイ|アイ)\b[\s\S]*$/i, '')
    .replace(/\([^)]*\)/g, '')
    .trim()
}

function normalizeFullBodyType(value) {
  const text = normalizeBodyText(value)
  const fullBodyMatch = text.match(/(?:VMF\s*50\s*)?TYPE\s*-?\s*([A-Z][0-9]?)(?:\s*(?:ボディ|BODY)|\s*彩色済み|\b)/)
  if (fullBodyMatch) return normalizeTypeToken(fullBodyMatch[1])

  const exteriorMatch = text.match(/(?:外装|外皮パーツ)\s*\/\s*(?:VMF\s*50\s*)?TYPE\s*-?\s*([A-Z][0-9]?)/)
  if (exteriorMatch) return normalizeTypeToken(exteriorMatch[1])

  return ''
}

function normalizeTypeToken(value) {
  const text = String(value || '').toUpperCase()
  return text.replace(/([A-Z])([IVX]+)$/, (_match, letter, roman) => {
    const romanMap = { I: '1', II: '2', III: '3', IV: '4', V: '5', VI: '6' }
    return `${letter}${romanMap[roman] || roman}`
  })
}
