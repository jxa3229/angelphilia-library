import { computed, ref, watch } from 'vue'
import bodyData from '../data/bodyParts.json'
import bodyPartPreview from '../data/bodyPartPreview.json'
import headPartPreview from '../data/headPartPreview.json'
import headParts from '../data/headParts.json'
import realartArchive from '../data/realartArchive.json'
import records from '../data/records.json'

export function usePartPreview(copy) {
  const activePreviewSlot = ref('head')
  const activePreviewType = ref('all')
  const activePreviewSkin = ref('all')
  const activePreview = ref(null)
  const isPreviewOpen = ref(false)
  const previewFields = computed(() => {
    const item = activePreview.value
    if (!item) return []
    return [
      { label: copy.value.tableYear, value: item.year },
      { label: copy.value.partModel, value: `Type-${item.type}` },
      { label: copy.value.allOutfitCategories, value: slotLabel(item.slot) },
      { label: copy.value.tableSkin, value: item.skin ? skinLabel(item.skin) : '' },
      { label: copy.value.tableVariant, value: item.finish },
      { label: copy.value.metadata, value: item.priceText },
      { label: copy.value.measurementSummary, value: measurementText(item) },
      { label: copy.value.sourcePage, value: item.source, href: item.sourceUrl }
    ]
  })
  function openPreview(item) { activePreview.value = item; isPreviewOpen.value = true }
  const previewSkinOrder = ['Whity', 'Super Whitey', 'Tan']

  const previewSlots = computed(() => [
    { key: 'head', label: copy.value.headPreviewTab },
    { key: 'upperTorso', label: copy.value.upperTorsoPreviewTab },
    { key: 'lowerTorso', label: copy.value.lowerTorsoPreviewTab },
    { key: 'thigh', label: copy.value.thighPreviewTab }
  ])

  const headPreviewCards = computed(() => {
    const headByType = new Map(headParts.map((head) => [head.type, head]))
    return headPartPreview.map((preview) => {
      const head = headByType.get(preview.type) || {}
      return {
        id: preview.id,
        year: preview.year || '',
        slot: 'head',
        type: preview.type,
        title: preview.title || `${head.label || `Type-${preview.type}`} ${copy.value.headModelRecord}`,
        skin: preview.skin,
        finish: preview.finish || head.revision || '',
        source: preview.source || copy.value.headData,
        measurements: head.measurements || {},
        eyeSizeOptions: head.eyeSizeOptions || [],
        eyeSizeStatus: head.eyeSizeStatus || '',
        sourceUrl: preview.sourceUrl || '',
        imageUrl: preview.imageUrl || ''
      }
    })
  })
  const basePreviewCards = computed(() => [...headPreviewCards.value, ...bodyPartPreview])
  const archiveRecords = computed(() => {
    return [...records, ...realartArchive]
      .map((record, index) => toArchiveRecord(record, index))
      .filter((record) => record.sourceUrl)
  })
  const archiveReferenceCards = computed(() => {
    const cards = []
    const groups = new Map()

    basePreviewCards.value.forEach((item) => {
      const key = `${item.slot}|${item.type}`
      if (!groups.has(key)) {
        groups.set(key, {
          slot: item.slot,
          type: item.type,
          skins: new Set()
        })
      }
      groups.get(key).skins.add(normalizeSkin(item.skin))
    })

    groups.forEach((group) => {
      previewSkinOrder.forEach((skin) => {
        if (group.skins.has(skin)) return
        const record = archiveRecords.value.find((archiveRecord) => {
          return archiveRecord.skin === skin && archiveRecordMatchesPreview(archiveRecord, group)
        })
        if (!record) return

        cards.push({
          id: `archive-${group.slot}-${group.type}-${skin}-${record.id}`,
          slot: group.slot,
          type: group.type,
          title: `${copy.value.archiveReferenceTitle}：Type-${group.type} ${skinLabel(skin)} · ${record.label}`,
          skin,
          finish: copy.value.localArchiveReference,
          priceText: record.year || '',
          year: record.year || '',
          source: record.source,
          sourceUrl: record.sourceUrl,
          imageUrl: record.imageUrl,
          archiveRecordId: record.id,
          isArchiveReference: true
        })
      })
    })

    return cards
  })
  const previewCards = computed(() => {
    return [...basePreviewCards.value, ...archiveReferenceCards.value].map((item) => {
      const related = findRelatedArchiveRecords(item)
      return {
        ...item,
        relatedRecords: related.slice(0, 3),
        relatedTotal: related.length
      }
    })
  })
  const activePreviewCards = computed(() => previewCards.value.filter((item) => item.slot === activePreviewSlot.value))
  const previewModelTypes = computed(() => {
    return [...new Set(activePreviewCards.value.map((item) => item.type))].sort((first, second) => {
      return typeSortValue(first) - typeSortValue(second)
    })
  })
  const previewSkinBaseCards = computed(() => {
    if (activePreviewType.value === 'all') return activePreviewCards.value
    return activePreviewCards.value.filter((item) => item.type === activePreviewType.value)
  })
  const previewSkinOptions = computed(() => {
    return [...new Set(previewSkinBaseCards.value.map((item) => item.skin).filter(Boolean))].sort(skinSortValue)
  })
  const filteredPreviewCards = computed(() => {
    if (activePreviewSkin.value === 'all') return previewSkinBaseCards.value
    return previewSkinBaseCards.value.filter((item) => item.skin === activePreviewSkin.value)
  })

  function selectPreviewSlot(slot) {
    activePreviewSlot.value = slot
    activePreviewType.value = 'all'
    activePreviewSkin.value = 'all'
  }

  watch([activePreviewSlot, activePreviewType], () => {
    activePreviewSkin.value = 'all'
  })

  function slotLabel(slot) {
    return previewSlots.value.find((item) => item.key === slot)?.label || slot
  }

  function skinLabel(skin) {
    return copy.value.skinToneLabels?.[skin] || skin
  }

  function measurementText(item) {
    if (item.slot === 'head') return headMeasurementText(item)

    const part = findPreviewMeasurementPart(item)
    if (!part?.measurements) return ''

    const values = Object.entries(part.measurements).map(([key, data]) => {
      const label = bodyData.measurementFields.find((field) => field.key === key)?.label || key
      return `${label} ${data.value}${data.unit || ''}`
    })
    return values.join(' · ')
  }

  function headMeasurementText(item) {
    const values = []
    const headMeasurement = item.measurements?.headCircumference
    if (headMeasurement) values.push(`${copy.value.headCircumference} ${headMeasurement.value}${headMeasurement.unit || 'cm'}`)

    const eyes = item.eyeSizeOptions || []
    if (eyes.length) {
      values.push(`${copy.value.eyeSizeOptions} ${eyes.map((eye) => eye.raw).join(' / ')}`)
    } else if (item.eyeSizeStatus === 'pending') {
      values.push(`${copy.value.eyeSizeOptions} ${copy.value.pending}`)
    }

    return values.join(' · ')
  }

  function findPreviewMeasurementPart(item) {
    const exact = bodyData.parts.find((bodyPart) => bodyPart.category === item.slot && bodyPart.type === item.type)
    if (exact) return exact

    const normalizedType = normalizedPreviewType(item.type)
    return bodyData.parts.find((bodyPart) => bodyPart.category === item.slot && bodyPart.type === normalizedType)
  }

  function normalizedPreviewType(type) {
    if (type === 'H3.2') return 'H3'
    if (type === 'C3') return 'C'
    if (type === 'H2') return 'H'
    return type
  }

  function toArchiveRecord(record, index) {
    const number = record.number && record.number !== '未记' ? record.number : ''
    const name = record.name || record.title || copy.value.unknown
    const label = [number, name].filter(Boolean).join(' ') || name
    const sourceId = record.detailKey || record.externalProductId || record.folder || record.sourceUrl || index

    return {
      id: `${record.source || 'archive'}-${sourceId}-${index}`,
      label,
      number,
      name,
      year: record.year || '',
      source: record.source || copy.value.recordFile,
      sourceUrl: record.sourceUrl || '',
      imageUrl: record.safeImageUrl || record.imageUrl || '',
      skin: normalizeSkin(record.skin),
      headType: normalizeRecordType(record.headType),
      parts: {
        upperTorso: normalizeRecordType(record.bodyComposition?.upperTorso?.type),
        lowerTorso: normalizeRecordType(record.bodyComposition?.lowerTorso?.type),
        thigh: normalizeRecordType(record.bodyComposition?.thigh?.type)
      }
    }
  }

  function findRelatedArchiveRecords(item) {
    const itemSkin = normalizeSkin(item.skin)
    return archiveRecords.value
      .filter((record) => {
        if (item.archiveRecordId && record.id === item.archiveRecordId) return false
        if (itemSkin && record.skin && record.skin !== itemSkin) return false
        return archiveRecordMatchesPreview(record, item)
      })
      .slice()
      .sort(archiveRecordSort)
  }

  function archiveRecordMatchesPreview(record, item) {
    const previewType = normalizeRecordType(item.type)
    if (!previewType) return false
    if (item.slot === 'head') return record.headType === previewType
    return record.parts?.[item.slot] === previewType
  }

  function archiveRecordSort(first, second) {
    const firstNumber = numericRecordNumber(first.number)
    const secondNumber = numericRecordNumber(second.number)
    if (firstNumber !== secondNumber) return firstNumber - secondNumber
    return String(first.year || '').localeCompare(String(second.year || '')) || first.label.localeCompare(second.label)
  }

  function numericRecordNumber(number) {
    const numeric = Number(String(number || '').match(/\d+/)?.[0] || 9999)
    return Number.isFinite(numeric) ? numeric : 9999
  }

  function normalizeRecordType(type) {
    if (!type) return ''
    return normalizedPreviewType(String(type).trim().toUpperCase())
  }

  function normalizeSkin(skin) {
    const value = String(skin || '').trim().toLowerCase()
    if (!value) return ''
    if (value.includes('super') || value.includes('スーパー') || value.includes('超')) return 'Super Whitey'
    if (value.includes('tan') || value.includes('褐')) return 'Tan'
    if (value.includes('whity') || value.includes('whitey') || value.includes('ホワイティ') || value.includes('白')) return 'Whity'
    return skin
  }

  function typeSortValue(type) {
    const [, letter = '', number = '0', decimal = '0'] = String(type).match(/^([A-Z]+)(\d*)(?:\.(\d+))?$/) || []
    return (letter.charCodeAt(0) || 0) * 100 + Number(number || 0) * 10 + Number(decimal || 0)
  }

  function skinSortValue(first, second) {
    const firstIndex = previewSkinOrder.includes(first) ? previewSkinOrder.indexOf(first) : previewSkinOrder.length
    const secondIndex = previewSkinOrder.includes(second) ? previewSkinOrder.indexOf(second) : previewSkinOrder.length
    return firstIndex - secondIndex || String(first).localeCompare(String(second))
  }


  return {
    activePreviewSlot, activePreviewType, activePreviewSkin, activePreview, isPreviewOpen,
    previewFields, previewSlots, previewModelTypes, previewSkinOptions,
    filteredPreviewCards, openPreview, selectPreviewSlot, skinLabel
  }
}
