<template>
  <section class="image-page">
    <RouterLink :to="{ name: 'overview' }" class="image-back">← {{ copy.back }}</RouterLink>
    <template v-if="entry">
      <header class="image-page-heading">
        <p>ANGELPHILIA LIBRARY / IMAGE</p>
        <h1>{{ entry.title[language] }}</h1>
        <span>{{ entry.width }} × {{ entry.height }} · PNG</span>
      </header>
      <nav class="image-variants" :aria-label="copy.heading">
        <RouterLink :to="{ name: 'image', params: { id: entry.id } }" :aria-current="!isDark ? 'page' : undefined">{{ copy.original }}</RouterLink>
        <RouterLink :to="{ name: 'image', params: { id: `${entry.id}-dark` } }" :aria-current="isDark ? 'page' : undefined">{{ copy.dark }}</RouterLink>
      </nav>
      <div class="image-actions">
        <a :href="imageUrl" target="_blank" rel="noopener">{{ copy.open }}</a>
        <a :href="imageUrl" :download="`${route.params.id}.png`">{{ copy.download }}</a>
        <button type="button" @click="copyLink(imageUrl)">{{ copy.copyImage }}</button>
        <button type="button" @click="copyLink(pageUrl)">{{ copy.copyPage }}</button>
      </div>
      <p class="image-feedback" role="status">{{ feedback }}</p>
      <div class="image-frame" :class="{ 'is-dark': isDark }">
        <div v-if="failed" class="image-state" role="alert">
          <p>{{ copy.retry }}</p>
          <button type="button" @click="retryImage">{{ copy.retryAction }}</button>
        </div>
        <template v-else>
          <p v-if="loading" class="image-state" role="status">{{ copy.loading }}</p>
          <img :key="`${imageUrl}-${retryCount}`" :src="imageUrl" :alt="`${entry.title[language]} · ${isDark ? copy.dark : copy.original}`" :width="entry.width" :height="entry.height" @load="loading = false" @error="failed = true; loading = false" />
        </template>
      </div>
      <div class="image-links">
        <p>{{ copy.directHint }}</p>
        <a :href="imageUrl">{{ imageUrl }}</a>
        <p>{{ copy.page }}</p>
        <a :href="pageUrl">{{ pageUrl }}</a>
      </div>
    </template>
    <h1 v-else>{{ copy.missing }}</h1>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { sharedImages, imageCopy } from '../data/sharedImages'
import { usePreferencesStore } from '../stores/preferences'
import { assetUrl } from '../utils/assetUrl'

const route = useRoute()
const preferences = usePreferencesStore()
const language = computed(() => imageCopy[preferences.lang] ? preferences.lang : 'zh')
const copy = computed(() => imageCopy[language.value])
const isDark = computed(() => String(route.params.id).endsWith('-dark'))
const entry = computed(() => sharedImages.find((item) => route.params.id === item.id || route.params.id === `${item.id}-dark`))
const imageUrl = computed(() => entry.value ? new URL(assetUrl(isDark.value ? entry.value.dark : entry.value.original), window.location.origin).href : '')
const pageUrl = computed(() => new URL(`${import.meta.env.BASE_URL}#/image/${encodeURIComponent(route.params.id)}`, window.location.origin).href)
const feedback = ref('')
const loading = ref(true)
const failed = ref(false)
const retryCount = ref(0)

watch(() => route.params.id, () => {
  feedback.value = ''
  loading.value = true
  failed.value = false
})

function retryImage() {
  retryCount.value += 1
  failed.value = false
  loading.value = true
}

async function copyLink(value) {
  try {
    await navigator.clipboard.writeText(value)
    feedback.value = copy.value.copied
  } catch {
    feedback.value = copy.value.copyFailed
  }
}
</script>

<style scoped>
.image-page { max-width: 1100px; margin: 0 auto; }
.image-back { display: inline-flex; align-items: center; min-height: 44px; }
.image-page-heading { margin: 20px 0; }
.image-page-heading p { color: var(--accent); font-size: 12px; letter-spacing: .12em; }
.image-page-heading h1 { margin: 8px 0; font-size: clamp(25px, 4vw, 40px); }
.image-page-heading span, .image-links p { color: var(--muted); }
.image-variants, .image-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.image-variants a, .image-actions a, .image-actions button, .image-state button { display: inline-flex; align-items: center; min-height: 44px; padding: 10px 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); font: inherit; cursor: pointer; }
.image-variants a[aria-current='page'] { background: var(--primary); color: var(--surface); border-color: var(--primary); }
.image-page :is(a, button):focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; }
.image-feedback { min-height: 1.6em; margin: 12px 0; color: var(--primary); }
.image-frame { position: relative; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; background: #f5eee8; }
.image-frame.is-dark { background: #0b0c10; }
.image-frame img { display: block; width: 100%; height: auto; }
.image-state { padding: 24px; color: var(--ink); background: var(--surface); }
.image-links { margin: 22px 0; padding: 18px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
.image-links a { display: block; overflow-wrap: anywhere; user-select: all; }
</style>
