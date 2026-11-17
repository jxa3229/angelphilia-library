<template>
  <CatalogCard class="record-card" :image="cover" :year="record.year" :name="displayRecord.name" @open="$emit('open', record)" />
</template>

<script setup>
import { computed } from 'vue'
import CatalogCard from '../shared/CatalogCard.vue'
import { usePreferencesStore } from '../../stores/preferences'
import { localizeLimitedRecord } from '../../i18n/limited'

defineEmits(['open'])

const props = defineProps({
  record: {
    type: Object,
    required: true
  }
})

const preferences = usePreferencesStore()
const displayRecord = computed(() => localizeLimitedRecord(props.record, preferences.lang))
const cover = computed(() => {
  const images = Array.isArray(props.record.safeImages) && props.record.safeImages.length
    ? props.record.safeImages
    : [props.record.safeImageUrl || props.record.imageUrl].filter(Boolean)
  return images[0] || ''
})
</script>
