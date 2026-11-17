<template>
  <article class="catalog-card">
    <div class="catalog-card-media">
      <button type="button" class="catalog-card-image" :aria-label="name" :aria-busy="imageLoading" @click="$emit('open')">
        <img v-if="currentImage && showImage" :key="attempt" :src="assetUrl(currentImage)" :alt="name"
          :loading="priority ? 'eager' : 'lazy'" :fetchpriority="priority ? 'high' : 'auto'" decoding="async"
          :class="{ 'is-loading': imageLoading }" @load="imageLoading = false" @error="handleImageError" />
        <span v-if="imageLoading" class="catalog-image-placeholder">{{ copy.imageLoading }}</span>
        <span v-else-if="!currentImage">{{ copy.noImage }}</span>
        <span v-else-if="imageFailed" class="catalog-image-error">{{ copy.imageLoadFailed }}</span>
      </button>
      <button v-if="imageFailed" type="button" class="catalog-card-retry" :aria-label="`${copy.retryImage}: ${name}`" @click="retryImage">{{ copy.retryImage }}</button>
    </div>
    <div class="catalog-card-body">
      <span class="catalog-card-year">{{ year || copy.unknown }}</span>
      <h3><button type="button" @click="$emit('open')">{{ name }}</button></h3>
    </div>
  </article>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { assetUrl } from '../../utils/assetUrl'
import { usePreferencesStore } from '../../stores/preferences'

const props = defineProps({
  name: { type: String, required: true },
  year: { type: [String, Number], default: '' },
  image: { type: String, default: '' },
  fallbackImage: { type: String, default: '' },
  priority: { type: Boolean, default: false }
})
defineEmits(['open'])
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const imageFailed = ref(false)
const imageLoading = ref(Boolean(props.image))
const showImage = ref(true)
const sourceIndex = ref(0)
const attempt = ref(0)
const sources = computed(() => [...new Set([props.image, props.fallbackImage].filter(Boolean))])
const currentImage = computed(() => sources.value[sourceIndex.value] || '')
let retries = 0
let retryTimer

function clearRetryTimer() { window.clearTimeout(retryTimer) }

function retryImage() {
  clearRetryTimer()
  retries = 0
  sourceIndex.value = 0
  imageFailed.value = false
  imageLoading.value = Boolean(currentImage.value)
  showImage.value = true
  attempt.value++
}

function handleImageError() {
  if (sourceIndex.value + 1 < sources.value.length) {
    sourceIndex.value++
    attempt.value++
    return
  }
  showImage.value = false
  if (retries < 1) {
    retries++
    retryTimer = window.setTimeout(() => { attempt.value++; showImage.value = true }, 600)
    return
  }
  imageLoading.value = false
  imageFailed.value = true
}

watch(() => [props.image, props.fallbackImage], retryImage)
onBeforeUnmount(clearRetryTimer)
</script>

<style scoped>
.catalog-card { display: flex; flex-direction: column; min-width: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-strong); }
.catalog-card-media { position: relative; }
.catalog-card-image { display: grid; place-items: center; flex: 0 0 auto; width: 100%; height: var(--catalog-image-height, 260px); min-height: 0; padding: 0; overflow: hidden; border: 0; background: #1f2428; color: #fff; cursor: pointer; }
.catalog-card-image img { display: block; width: 100%; height: 100%; object-fit: contain; transition: transform 220ms ease; }
.catalog-card-image img.is-loading { opacity: 0; }
.catalog-image-placeholder { position: absolute; inset: 0; display: grid; place-items: center; color: #ddd; pointer-events: none; }
.catalog-image-error { padding: 16px 16px 60px; }
.catalog-card-retry { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); min-height: 44px; padding: 8px 18px; border: 1px solid #ddd; border-radius: 6px; color: #fff; background: #30383f; white-space: nowrap; cursor: pointer; }
.catalog-card-image:hover img { transform: scale(1.035); }
.catalog-card-body { flex: 1; min-width: 0; padding: var(--catalog-card-padding, 16px); }
.catalog-card-year { color: var(--gold); font-size: 12px; font-weight: 800; }
h3 { margin: 8px 0 0; font-family: Georgia, "Times New Roman", "Noto Serif SC", serif; font-size: var(--catalog-title-size, 21px); line-height: 1.35; overflow-wrap: anywhere; }
h3 button { padding: 0; border: 0; background: transparent; color: var(--ink); font: inherit; text-align: left; cursor: pointer; }
h3 button:hover { color: var(--primary); }
button:focus-visible { outline: 2px solid var(--primary); outline-offset: -3px; }
@media (prefers-reduced-motion: reduce) { .catalog-card-image img { transition: none; } }
</style>
