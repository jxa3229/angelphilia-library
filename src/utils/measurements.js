import sources from '../data/partSources.json'

const sourceMap = new Map(sources.map((source) => [source.sourceId || source.id, source]))

function hasKnownMeasurementValue(measurement) {
  return typeof measurement?.value === 'number'
}

export function formatMeasurementValue(measurement) {
  if (!hasKnownMeasurementValue(measurement)) return '待补充'
  return `${measurement.value}${measurement.unit || 'cm'}`
}

export function getSourceLabel(sourceId) {
  return sourceMap.get(sourceId)?.label || '网络数据'
}

export function getToleranceText(measurement) {
  if (!measurement?.toleranceCm) return ''
  return `约 ${measurement.toleranceCm}cm 误差`
}

export function buildSelectedParts(selection = {}, parts = []) {
  const partIndex = new Map(parts.map((part) => [part.id, part]))
  return Object.entries(selection).reduce((result, [slot, partId]) => {
    if (slot === 'head' || slot === 'includeHeadMeasurements') return result
    const part = partIndex.get(partId)
    if (part) result[slot] = part
    return result
  }, {})
}

export function buildMeasurementSummary({ selection, parts, measurementFields, head, includeHeadMeasurements = false }) {
  const selectedParts = buildSelectedParts(selection, parts)
  const rows = measurementFields.map((field) => {
    const part = selectedParts[field.slot]
    const measurement = part?.measurements?.[field.key]
    return {
      key: field.key,
      label: field.label,
      slot: field.slot,
      partLabel: part?.label || '待补充',
      value: measurement?.value ?? null,
      unit: measurement?.unit || 'cm',
      displayValue: formatMeasurementValue(measurement),
      source: measurement?.sourceId ? getSourceLabel(measurement.sourceId) : '待补充',
      tolerance: getToleranceText(measurement),
      isDefault: Boolean(part?.isDefault),
      status: hasKnownMeasurementValue(measurement) ? 'known' : 'pending'
    }
  })

  if (head && includeHeadMeasurements) {
    const headMeasurement = head.measurements?.headCircumference
    rows.push({
      key: 'headCircumference',
      label: '头围',
      slot: 'head',
      partLabel: head.label,
      value: headMeasurement?.value ?? null,
      unit: headMeasurement?.unit || 'cm',
      displayValue: formatMeasurementValue(headMeasurement),
      source: headMeasurement?.sourceId ? getSourceLabel(headMeasurement.sourceId) : '待补充',
      tolerance: getToleranceText(headMeasurement),
      isDefault: false,
      status: hasKnownMeasurementValue(headMeasurement) ? 'known' : 'pending'
    })
  }

  return rows
}

export function buildSourceRows(summaryRows = []) {
  return summaryRows
    .filter((row) => row.status === 'known')
    .map((row) => ({
      key: row.key,
      field: row.label,
      source: row.source,
      tolerance: row.tolerance || '无',
      note: row.isDefault ? 'Obitsu default' : '当前选择'
    }))
}

export function buildMissingRows(summaryRows = []) {
  return summaryRows.filter((row) => row.status !== 'known')
}

export function buildMeasurementCopyText({ rows = [], head = null, includeHeadMeasurements = false } = {}) {
  const copyRows = rows.filter(
    (row) => row.key !== 'headCircumference' && row.status === 'known' && typeof row.value === 'number'
  )
  const headMeasurement = includeHeadMeasurements ? head?.measurements?.headCircumference : null
  if (hasKnownMeasurementValue(headMeasurement)) {
    copyRows.splice(1, 0, {
      key: 'headCircumference',
      label: '头围',
      displayValue: formatMeasurementValue(headMeasurement)
    })
  }

  return copyRows
    .map((row) => `${row.label}：${row.displayValue || '待补充'}`)
    .join('\n')
}
