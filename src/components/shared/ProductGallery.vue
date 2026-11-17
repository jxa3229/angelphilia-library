<template>
  <el-carousel v-if="images.length" class="detail-carousel" :height="height" indicator-position="outside" arrow="always" :autoplay="false">
    <el-carousel-item v-for="image in images" :key="image">
      <el-image :src="assetUrl(image)" :alt="name" :preview-src-list="previewImages" :initial-index="images.indexOf(image)" fit="contain" preview-teleported>
        <template #error><div class="drawer-empty-image">{{ copy.noImage }}</div></template>
      </el-image>
    </el-carousel-item>
  </el-carousel>
  <div v-else class="drawer-empty-image">{{ copy.noImage }}</div>
</template>

<script setup>
import { computed } from 'vue'
import { assetUrl } from '../../utils/assetUrl'
import { usePreferencesStore } from '../../stores/preferences'
const props = defineProps({
  images: { type: Array, default: () => [] },
  name: { type: String, default: '' },
  height: { type: String, default: 'min(58vh, 560px)' }
})
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const previewImages = computed(() => props.images.map(assetUrl))
</script>

<style scoped>
.el-image { width: 100%; height: 100%; cursor: zoom-in; }
</style>
