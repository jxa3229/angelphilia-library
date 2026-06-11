import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { dictionary } from '../i18n/dictionary'
import { languages } from '../i18n/languages'

export const usePreferencesStore = defineStore('preferences', () => {
  const lang = ref(localStorage.getItem('library-lang') || 'zh')
  const theme = ref(localStorage.getItem('library-theme') || 'system')

  const copy = computed(() => dictionary[lang.value] || dictionary.zh)
  const navItems = computed(() => [
    { route: 'overview', label: copy.value.navSummary },
    { route: 'library', label: copy.value.navLibrary },
    { route: 'index', label: copy.value.navIndex },
    { route: 'repository', label: copy.value.navRepo }
  ])

  watch(lang, (value) => localStorage.setItem('library-lang', value))
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
