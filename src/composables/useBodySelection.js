import { computed, reactive, ref, watch } from 'vue'
import bodyData from '../data/bodyParts.json'
import headParts from '../data/headParts.json'
import realartParts from '../data/realartParts.json'
import records from '../data/records.json'
import { buildInitialSelection, buildPresetDescriptions, generateBodyCode } from '../utils/bodyCode'
import { buildMeasurementCopyText, buildMeasurementSummary } from '../utils/measurements'

export function useBodySelection() {
  const selectedPresetId = ref(bodyData.presets[0]?.id || '')
  const selection = reactive(buildInitialSelection(bodyData))
  const partSlots = [
    { key: 'upperTorso', label: '胸 / Upper torso' },
    { key: 'lowerTorso', label: '腰臀 / Lower torso' },
    { key: 'thigh', label: '大腿 / Thigh' },
    { key: 'shin', label: '小腿 / Shin' },
    { key: 'upperArm', label: '上臂 / Upper arm' },
    { key: 'forearm', label: '下臂 / Forearm' },
    { key: 'hand', label: '手 / Hand' },
    { key: 'foot', label: '脚 / Foot' }
  ]

  const categoryLabels = {
    frame: 'Frame',
    upperTorso: '胸',
    lowerTorso: '腰臀',
    thigh: '大腿',
    shin: '小腿',
    upperArm: '上臂',
    forearm: '下臂',
    hand: '手',
    foot: '脚'
  }

  const partsByCategory = computed(() => {
    return bodyData.parts.reduce((groups, part) => {
      if (!groups[part.category]) groups[part.category] = []
      groups[part.category].push(part)
      return groups
    }, {})
  })

  const selectedHead = computed(() => headParts.find((head) => head.id === selection.head) || null)
  const bodyCode = computed(() => generateBodyCode(selection, bodyData.parts))
  const selectedCoreTypes = computed(() => {
    return ['upperTorso', 'lowerTorso', 'thigh'].map((category) => {
      return bodyData.parts.find((part) => part.id === selection[category])?.type || ''
    })
  })
  const bodyExhibits = computed(() => realartParts.filter((item) => item.displayKind === 'bodyExhibit'))
  const matchingBodyExhibits = computed(() => bodyExhibits.value.filter((item) => matchesCurrentBody(item)))
  const selectedPartIds = computed(() => {
    return Object.entries(selection)
      .filter(([key, value]) => key !== 'head' && key !== 'includeHeadMeasurements' && value)
      .map(([, value]) => value)
  })
  const measurementRows = computed(() => buildMeasurementSummary({
    selection,
    parts: bodyData.parts,
    measurementFields: bodyData.measurementFields,
    head: selectedHead.value,
    includeHeadMeasurements: selection.includeHeadMeasurements
  }))
  const copySummary = computed(() => buildMeasurementCopyText({
    rows: measurementRows.value,
    head: selectedHead.value,
    includeHeadMeasurements: selection.includeHeadMeasurements
  }))
  const presetDescriptions = computed(() => buildPresetDescriptions(bodyData.presets, records))
  const currentPresetDescription = computed(() => {
    const preset = bodyData.presets.find((item) => item.id === selectedPresetId.value)
    return preset ? presetDescriptions.value[preset.id] || '' : ''
  })
  watch(selectedPresetId, (presetId) => {
    const preset = bodyData.presets.find((item) => item.id === presetId)
    if (!preset) return
    Object.assign(selection, buildInitialSelection(bodyData), preset.parts)
  })

  function updateSelection({ slot, value }) {
    selection[slot] = value
  }

  function selectHead(headId) {
    selection.head = headId
    if (!headId) selection.includeHeadMeasurements = false
  }

  function toggleHeadData(value) {
    selection.includeHeadMeasurements = Boolean(value && selection.head)
  }

  function matchesCurrentBody(item) {
    if (item.bodyCode) return item.bodyCode === bodyCode.value

    const itemTypes = Array.isArray(item.bodyTypes) ? item.bodyTypes : []
    const [upperType, lowerType, thighType] = selectedCoreTypes.value
    if (!upperType || !itemTypes.includes(upperType)) return false
    return itemTypes.includes(lowerType) || itemTypes.includes(thighType)
  }

  return {
    selectedPresetId, selection, partSlots, categoryLabels, partsByCategory, bodyCode,
    matchingBodyExhibits, selectedPartIds, measurementRows, copySummary, presetDescriptions,
    currentPresetDescription, updateSelection, selectHead, toggleHeadData
  }
}
