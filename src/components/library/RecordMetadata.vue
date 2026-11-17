<template>
  <section class="record-metadata" :aria-label="copy.metadata">
    <h3>{{ copy.metadata }}</h3>
    <MetadataList :fields="fields" />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import MetadataList from '../shared/MetadataList.vue'
import { usePreferencesStore } from '../../stores/preferences'
import { limitedCategories } from '../../utils/limitedRecords'
import { limitedCopy, localizeLimitedRecord } from '../../i18n/limited'
const props = defineProps({ record: { type: Object, required: true } })
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const fields = computed(() => {
  const record = localizeLimitedRecord(props.record, preferences.lang)
  const labels = copy.value
  const result = [
    ['year', labels.tableYear], ['group', labels.tableGroup], ['series', labels.tableSeries],
    ['number', labels.tableNumber], ['variant', labels.tableVariant], ['skin', labels.tableSkin],
    ['headType', labels.tableHeadType], ['head', labels.tableHead], ['body', labels.tableBody]
  ].map(([key, label]) => ({ key, label, value: record[key] }))
  const categories = limitedCategories(props.record)
  if (categories.length) {
    const text = limitedCopy[preferences.lang] || limitedCopy.zh
    result.push({ key: 'category', label: text.category, value: categories.map((category) => text[category]).join(' / ') })
  }
  if (record.sourceUrl) result.push({ key: 'source', label: labels.sourcePage, value: record.source || record.sourceUrl, href: record.sourceUrl })
  return result
})
</script>

<style scoped>
.record-metadata { padding-bottom: 22px; margin-bottom: 24px; border-bottom: 1px solid var(--line); }
.record-metadata h3 { margin: 0 0 18px; font-size: 18px; }
</style>
