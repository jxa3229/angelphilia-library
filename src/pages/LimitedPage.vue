<template>
  <section class="limited-page" :lang="preferences.lang === 'zh' ? 'zh-CN' : preferences.lang" :aria-labelledby="activeRecord ? undefined : 'limited-title'">
    <template v-if="!activeRecord">
      <header class="limited-header">
        <p class="limited-eyebrow">{{ text.eyebrow }}</p>
        <h1 id="limited-title">{{ text.title }}</h1>
        <p>{{ text.intro }}</p>
        <div class="limited-intro-grid">
          <div><strong>{{ text.osd }}</strong><p>{{ text.osdIntro }}</p></div>
          <div><strong>{{ text.fcd }}</strong><p>{{ text.fcdIntro }}</p></div>
        </div>
        <p class="limited-note">{{ text.note }}</p>
      </header>

      <details class="limited-guide">
        <summary>{{ text.guide }}</summary>
        <div class="limited-guide-content">
          <div class="limited-table-wrap" tabindex="0" role="region" :aria-label="text.tableLabel">
            <table>
              <caption>{{ text.caption }}</caption>
              <thead><tr><th scope="col">{{ text.dimension }}</th><th scope="col">ONE SELECTION DOLL</th><th scope="col">Full Coordinate Doll</th></tr></thead>
              <tbody><tr v-for="row in guide.comparison" :key="row.label"><th scope="row">{{ row.label }}</th><td>{{ row.osd }}</td><td>{{ row.fcd }}</td></tr></tbody>
            </table>
          </div>
          <h2>{{ text.scope }}</h2>
          <p>{{ text.scopeText }}</p>
          <ol class="limited-milestones"><li v-for="item in guide.milestones" :key="item.year"><strong>{{ item.year }}</strong><span>{{ item.text }}</span></li></ol>
          <p>{{ text.spinoffs }}</p>
          <h2>{{ text.sources }}</h2>
          <ul class="limited-source-list"><li v-for="source in guide.sources" :key="source.url"><a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.label }} ↗</a></li></ul>
        </div>
      </details>

      <div class="limited-toolbar">
        <nav class="limited-tabs" :aria-label="text.categories">
          <button type="button" :aria-pressed="selectedType === ''" @click="selectedType = ''">{{ text.all }} <span>{{ limitedRecords.length }}</span></button>
          <button v-for="type in limitedTypes" :key="type.id" type="button" :aria-pressed="selectedType === type.id" @click="selectedType = type.id">{{ type.label }} <span>{{ countType(type.id) }}</span></button>
        </nav>
        <el-input v-model="query" clearable :aria-label="text.search" :placeholder="text.placeholder" />
      </div>
      <div class="limited-results" aria-live="polite"><p>{{ text.results.replace('{shown}', filteredRecords.length).replace('{total}', limitedRecords.length) }}</p><button type="button" @click="resetFilters">{{ text.reset }}</button></div>
      <div v-if="filteredRecords.length" class="card-grid">
        <RecordCard v-for="record in filteredRecords" :key="record.folder" :record="record" @open="openRecord" />
      </div>
      <div v-else class="limited-empty"><el-empty :description="text.empty" /><el-button @click="resetFilters">{{ text.clear }}</el-button></div>
    </template>

    <template v-else>
      <RecordDetail :record="activeRecord" :back-label="text.back" @close="closeRecord" />
    </template>
  </section>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import RecordCard from '../components/library/RecordCard.vue'
import RecordDetail from '../components/library/RecordDetail.vue'
import { useLibraryStore } from '../stores/library'
import { usePreferencesStore } from '../stores/preferences'
import { limitedCategories, limitedSearchText } from '../utils/limitedRecords'
import { limitedCopy, localizedLimitedGuide, localizeLimitedRecord } from '../i18n/limited'

const props = defineProps({ mainPanel: { type: Object, default: null } })
const library = useLibraryStore()
const preferences = usePreferencesStore()
const text = computed(() => limitedCopy[preferences.lang] || limitedCopy.zh)
const guide = computed(() => localizedLimitedGuide(preferences.lang))
const limitedTypes = computed(() => [
  { id: 'osd', label: 'ONE SELECTION DOLL', short: text.value.osd },
  { id: 'fcd', label: 'Full Coordinate Doll', short: text.value.fcd },
  { id: 'collab', label: text.value.collaboration, short: text.value.collab }
])
const selectedType = ref('')
const query = ref('')
const activeRecord = ref(null)
let savedScroll = { panel: 0, window: 0 }

const limitedRecords = computed(() => library.allRecords.filter((record) => limitedCategories(record).length)
  .sort((a, b) => (Number.parseInt(b.year, 10) || 0) - (Number.parseInt(a.year, 10) || 0)
    || a.name.localeCompare(b.name, undefined, { numeric: true })))
const filteredRecords = computed(() => {
  const keyword = query.value.normalize('NFKC').trim().toLowerCase()
  return limitedRecords.value.filter((record) => (!selectedType.value || limitedCategories(record).includes(selectedType.value))
    && (!keyword || `${limitedSearchText(record)} ${limitedSearchText(localizeLimitedRecord(record, preferences.lang))}`.includes(keyword)))
})

function countType(id) { return limitedRecords.value.filter((record) => limitedCategories(record).includes(id)).length }
function resetFilters() { selectedType.value = ''; query.value = '' }

async function openRecord(record) {
  savedScroll = { panel: props.mainPanel?.scrollTop || 0, window: window.scrollY }
  activeRecord.value = record
  library.loadDetails(record)
  await nextTick()
  if (props.mainPanel) props.mainPanel.scrollTop = 0
  window.scrollTo({ top: 0, behavior: 'instant' })
}

async function closeRecord() {
  activeRecord.value = null
  await nextTick()
  if (props.mainPanel) props.mainPanel.scrollTop = savedScroll.panel || 0
  window.scrollTo({ top: savedScroll.window || 0, behavior: 'instant' })
}
</script>

<style scoped>
.limited-page { max-width: 1400px; margin: 0 auto; min-width: 0; overflow-wrap: anywhere; }
.limited-header { padding: clamp(22px, 3vw, 36px); border: 1px solid var(--line); border-top: 4px solid var(--gold); border-radius: 8px; background: var(--surface); }
.limited-eyebrow { margin: 0 0 12px; color: var(--gold); font-size: 12px; font-weight: 800; letter-spacing: .06em; }
h1 { margin: 0; font-family: Georgia, "Noto Serif SC", serif; font-size: clamp(30px, 4vw, 44px); }
p { line-height: 1.85; }
.limited-header > p:not(.limited-eyebrow) { color: var(--muted); }
.limited-intro-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; margin-top: 24px; }
.limited-intro-grid > div { padding: 18px; border-left: 3px solid var(--primary); background: var(--primary-soft); }
.limited-intro-grid p { margin: 8px 0 0; font-size: 14px; }
.limited-note { margin-bottom: 0; font-size: 13px; }
.limited-guide { margin: 16px 0 24px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
summary { padding: 18px 22px; cursor: pointer; font-weight: 700; line-height: 1.7; }
.limited-guide-content { min-width: 0; padding: 0 22px 22px; }
.limited-guide-content h2 { margin-top: 28px; font-size: 18px; }
.limited-guide-content p, .limited-milestones { color: var(--muted); font-size: 14px; }
.limited-table-wrap { overflow-x: auto; }
table { width: 100%; min-width: 620px; border-collapse: collapse; font-size: 14px; text-align: left; line-height: 1.8; }
caption { padding-bottom: 12px; text-align: left; font-weight: 700; }
th, td { padding: 14px; border: 1px solid var(--line); vertical-align: top; }
thead { background: var(--primary-soft); }
tbody th { width: 110px; }
.limited-milestones { display: grid; gap: 12px; padding: 0; list-style: none; }
.limited-milestones li { display: flex; gap: 18px; line-height: 1.8; }
.limited-milestones strong { color: var(--primary); }
.limited-source-list { display: grid; gap: 12px; padding-left: 20px; font-size: 14px; }
.limited-toolbar { display: grid; gap: 16px; }
.limited-toolbar .el-input { max-width: 420px; }
.limited-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
.limited-tabs button { min-height: 44px; display: inline-flex; align-items: center; gap: 10px; padding: 10px 14px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); cursor: pointer; }
.limited-tabs button[aria-pressed='true'] { border-color: var(--primary); background: var(--primary-soft); color: var(--primary); }
.limited-tabs button > span { font-size: 12px; font-weight: 800; }
button:focus-visible, summary:focus-visible, a:focus-visible, .limited-table-wrap:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
.limited-results { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 13px; color: var(--muted); }
.limited-results button { flex-shrink: 0; min-height: 44px; padding: 8px; border: 0; background: transparent; color: var(--primary); cursor: pointer; }
.limited-empty { padding: 20px; text-align: center; }
:deep(.external-detail p) { white-space: pre-line; }
@media (max-width: 720px) {
  .limited-intro-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .limited-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .limited-tabs button { justify-content: space-between; font-size: 12px; }
  .limited-toolbar .el-input { max-width: none; }
  .limited-guide-content { padding-right: 14px; padding-left: 14px; }
}
</style>
