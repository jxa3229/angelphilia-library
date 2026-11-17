<template>
  <CatalogCard class="record-card" :image="cover" :fallback-image="originalCover" :priority="priority" :year="record.year" :name="displayRecord.name" @open="$emit('open', record)" />
</template>

<script setup>
import { computed } from 'vue'
import CatalogCard from '../shared/CatalogCard.vue'
import { usePreferencesStore } from '../../stores/preferences'
import { localizeLimitedRecord } from '../../i18n/limited'
import catalogCovers from '../../data/catalogCovers.json'

defineEmits(['open'])

const props = defineProps({
  priority: { type: Boolean, default: false },
  record: {
    type: Object,
    required: true
  }
})

const preferences = usePreferencesStore()
const displayRecord = computed(() => localizeLimitedRecord(props.record, preferences.lang))
const originalCover = computed(() => {
  const images = Array.isArray(props.record.safeImages) && props.record.safeImages.length
    ? props.record.safeImages
    : [props.record.safeImageUrl || props.record.imageUrl].filter(Boolean)
  return images[0] || ''
})
const cover = computed(() => catalogCovers[originalCover.value] || originalCover.value)
</script>
