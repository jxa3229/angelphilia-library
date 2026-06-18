import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import records from '../data/records.json'
import { assetUrl } from '../utils/assetUrl'
import { compareYear, unique } from '../utils/records'

export const useLibraryStore = defineStore('library', () => {
  const query = ref('')
  const selectedGroup = ref('')
  const selectedYear = ref('')
  const selectedSource = ref('')
  const activeRecord = ref(null)
  const savedLibraryScroll = ref(0)
  const detailsCache = ref({})
  const detailLoadingKey = ref('')
  const detailErrors = ref({})

  const allRecords = records
  const groups = computed(() => unique(allRecords.map((item) => item.group)).sort())
  const years = computed(() => unique(allRecords.map((item) => item.year)).sort(compareYear))
  const recentRecords = computed(() => [...allRecords].sort((a, b) => compareYear(b.year, a.year)).slice(0, 8))

  function sources(unknown) {
    return unique(allRecords.map((item) => item.source || unknown)).sort()
  }

  function filteredRecords(unknown) {
    const keyword = query.value.trim().toLowerCase()
    return allRecords.filter((record) => {
      const haystack = [
        record.year,
        record.group,
        record.series,
        record.number,
        record.name,
        record.title,
        record.variant,
        record.head,
        record.body,
        record.skin,
        record.source
      ].join(' ').toLowerCase()

      return (!keyword || haystack.includes(keyword))
        && (!selectedGroup.value || record.group === selectedGroup.value)
        && (!selectedYear.value || record.year === selectedYear.value)
        && (!selectedSource.value || (record.source || unknown) === selectedSource.value)
    })
  }

  function resultText(copy) {
    return copy.resultCount
      .replace('{shown}', filteredRecords(copy.unknown).length)
      .replace('{total}', allRecords.length)
  }

  function stats(copy) {
    return [
      { label: copy.total, value: allRecords.length },
      { label: copy.yearSpan, value: `${years.value[0]}-${years.value[years.value.length - 2] || years.value.at(-1)}` },
      { label: copy.imageCount, value: allRecords.filter((item) => recordImages(item).length).length },
      { label: copy.groupCount, value: groups.value.length }
    ]
  }

  function resetFilters() {
    query.value = ''
    selectedGroup.value = ''
    selectedYear.value = ''
    selectedSource.value = ''
  }

  function coverImage(record) {
    return recordImages(record)[0] || ''
  }

  function recordImages(record) {
    if (!record) return []
    const images = Array.isArray(record.images) && record.images.length
      ? (Array.isArray(record.safeImages) && record.safeImages.length ? record.safeImages : record.images)
      : [record.safeImageUrl || record.imageUrl || (record.safeFolder ? `media/${record.safeFolder}/01.jpg` : '')].filter(Boolean)

    return images
  }

  function focusRecord(record) {
    activeRecord.value = null
    query.value = record.name
  }

  function openRecord(record, scrollTop = 0) {
    savedLibraryScroll.value = scrollTop
    activeRecord.value = record
    loadDetails(record)
  }

  function closeRecord() {
    activeRecord.value = null
    return savedLibraryScroll.value
  }

  function clearActiveRecord() {
    activeRecord.value = null
  }

  function detailHtml(record) {
    return detailsCache.value[record?.detailKey] || ''
  }

  function isDetailLoading(record) {
    return Boolean(record?.detailKey && detailLoadingKey.value === record.detailKey)
  }

  function detailError(record, copy) {
    return detailErrors.value[record?.detailKey] ? copy.detailLoadFailed : ''
  }

  async function loadDetails(record = activeRecord.value) {
    const key = record?.detailKey
    if (!key || detailsCache.value[key] || detailLoadingKey.value === key) return

    detailLoadingKey.value = key
    detailErrors.value = { ...detailErrors.value, [key]: false }
    try {
      const response = await fetch(assetUrl(`details/${key}.html`))
      if (!response.ok) throw new Error(`Detail request failed: ${response.status}`)
      const html = await response.text()
      detailsCache.value = { ...detailsCache.value, [key]: html }
    } catch {
      detailErrors.value = { ...detailErrors.value, [key]: true }
    } finally {
      if (detailLoadingKey.value === key) {
        detailLoadingKey.value = ''
      }
    }
  }

  return {
    allRecords,
    query,
    selectedGroup,
    selectedYear,
    selectedSource,
    activeRecord,
    groups,
    years,
    recentRecords,
    sources,
    filteredRecords,
    resultText,
    stats,
    resetFilters,
    coverImage,
    recordImages,
    focusRecord,
    openRecord,
    closeRecord,
    clearActiveRecord,
    detailHtml,
    isDetailLoading,
    detailError
  }
})
