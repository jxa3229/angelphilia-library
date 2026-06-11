<template>
  <div class="detail-gallery">
    <el-carousel
      v-if="images.length > 0"
      class="detail-carousel"
      height="min(58vh, 620px)"
      indicator-position="outside"
      arrow="always"
    >
      <el-carousel-item v-for="item in images" :key="item">
        <img :src="assetUrl(item)" :alt="record.name" />
      </el-carousel-item>
    </el-carousel>
    <div v-else class="drawer-empty-image">{{ copy.noImage }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { assetUrl } from '../../utils/assetUrl'
import { usePreferencesStore } from '../../stores/preferences'

const props = defineProps({
  record: {
    type: Object,
    required: true
  }
})

const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const images = computed(() => {
  if (!props.record) return []
  if (Array.isArray(props.record.safeImages) && props.record.safeImages.length) return props.record.safeImages
  return [props.record.safeImageUrl || props.record.imageUrl].filter(Boolean)
})
</script>
