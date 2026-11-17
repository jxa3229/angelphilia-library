import { computed, nextTick, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function recordRouteId(record) {
  return String(record.folder || record.detailKey || record.externalProductId || '')
}

// 同一路由内仅更新 query，保留列表组件、筛选和分批数量。
export function useRecordRoute({ records, mainPanel, onOpen, onClose }) {
  const route = useRoute()
  const router = useRouter()
  const routeName = route.name
  const recordId = computed(() => route.name === routeName && typeof route.query.record === 'string' ? route.query.record : '')
  const activeRecord = computed(() => records.value.find((record) => recordRouteId(record) === recordId.value) || null)
  const invalidRecord = computed(() => Boolean(recordId.value && !activeRecord.value))
  let savedScroll = { panel: 0, window: 0 }
  let openedHere = false
  let revision = 0

  watch(recordId, async (id, previous) => {
    const current = ++revision
    if (id && !previous) savedScroll = { panel: mainPanel()?.scrollTop || 0, window: window.scrollY }
    if (activeRecord.value) onOpen?.(activeRecord.value)
    else onClose?.()
    await nextTick()
    if (current !== revision || route.name !== routeName) return
    if (mainPanel()) mainPanel().scrollTop = id ? 0 : savedScroll.panel
    window.scrollTo({ top: id ? 0 : savedScroll.window, behavior: 'instant' })
  }, { immediate: true })

  onBeforeUnmount(() => { revision++ })

  function openRecord(record) {
    openedHere = !recordId.value
    return router.push({ name: routeName, query: { ...route.query, record: recordRouteId(record) } })
  }

  function closeRecord() {
    if (openedHere && router.options.history.state.back) {
      openedHere = false
      router.back()
    } else {
      const { record, ...query } = route.query
      return router.replace({ name: routeName, query })
    }
  }

  return { activeRecord, invalidRecord, openRecord, closeRecord }
}
