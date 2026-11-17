import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { usePreferencesStore } from './preferences'

export const useChangelogStore = defineStore('changelog', () => {
  const preferences = usePreferencesStore()
  const isOpen = ref(false)
  const entries = computed(() => [...(preferences.copy.updateLogEntries || [])]
    .sort((a, b) => b.date.localeCompare(a.date)))
  const latestDate = computed(() => entries.value[0]?.date || '')

  function open() {
    isOpen.value = true
  }

  return { isOpen, entries, latestDate, open }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChangelogStore, import.meta.hot))
}
