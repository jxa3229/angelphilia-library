import { computed, ref, watch } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { dictionary } from '../i18n/dictionary'
import { languages } from '../i18n/languages'

export const usePreferencesStore = defineStore('preferences', () => {
  const savedLang = localStorage.getItem('library-lang')
  const lang = ref(Object.hasOwn(dictionary, savedLang) ? savedLang : 'zh')
  const theme = ref(localStorage.getItem('library-theme') || 'system')

  const copy = computed(() => dictionary[lang.value] || dictionary.zh)
  const navItems = computed(() => [
    { route: 'overview', label: copy.value.navSummary },
    { route: 'library', label: copy.value.navLibrary },
    { route: 'limited', label: copy.value.navLimited },
    { route: 'official-faceups', label: copy.value.navOfficialFaceups },
    { route: 'body-builder', label: copy.value.navBodyBuilder },
    { route: 'outfits', label: copy.value.navOutfits },
    { route: 'index', label: copy.value.navIndex },
    { route: 'glossary', label: copy.value.navGlossary }
  ])

  watch(lang, (value) => {
    localStorage.setItem('library-lang', value)
    document.documentElement.lang = { zh: 'zh-Hans', en: 'en', ja: 'ja' }[value] || 'zh-Hans'
  }, { immediate: true })
  watch(theme, (value) => {
    localStorage.setItem('library-theme', value)
    applyTheme(value)
  })

  function setTheme(value) {
    theme.value = value
  }

  function applyTheme(value = theme.value) {
    document.documentElement.dataset.theme = value
  }

  applyTheme(theme.value)

  return {
    lang,
    theme,
    copy,
    languages,
    navItems,
    setTheme,
    applyTheme
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePreferencesStore, import.meta.hot))
}
