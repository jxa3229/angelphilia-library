<template>
  <div class="detail-gallery">
    <ProductGallery :images="images" :name="record.name" height="min(58vh, 620px)" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProductGallery from '../shared/ProductGallery.vue'

const props = defineProps({
  record: {
    type: Object,
    required: true
  }
})

const images = computed(() => {
  if (!props.record) return []
  if (Array.isArray(props.record.safeImages) && props.record.safeImages.length) return props.record.safeImages
  return [props.record.safeImageUrl || props.record.imageUrl].filter(Boolean)
})
</script>
