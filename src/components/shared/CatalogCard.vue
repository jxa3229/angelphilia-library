<template>
  <article class="catalog-card">
    <button type="button" class="catalog-card-image" :aria-label="name" @click="$emit('open')">
      <img v-if="image && !imageFailed" :src="assetUrl(image)" :alt="name" loading="lazy" @error="imageFailed = true" />
      <span v-else>{{ copy.noImage }}</span>
    </button>
    <div class="catalog-card-body">
      <span class="catalog-card-year">{{ year || copy.unknown }}</span>
      <h3><button type="button" @click="$emit('open')">{{ name }}</button></h3>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { assetUrl } from '../../utils/assetUrl'
import { usePreferencesStore } from '../../stores/preferences'

const props = defineProps({
  name: { type: String, required: true },
  year: { type: [String, Number], default: '' },
  image: { type: String, default: '' }
})
defineEmits(['open'])
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const imageFailed = ref(false)
watch(() => props.image, () => { imageFailed.value = false })
</script>

<style scoped>
.catalog-card { display: flex; flex-direction: column; min-width: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-strong); }
.catalog-card-image { display: grid; place-items: center; flex: 0 0 auto; width: 100%; height: var(--catalog-image-height, 260px); min-height: 0; padding: 0; overflow: hidden; border: 0; background: #1f2428; color: #fff; cursor: pointer; }
.catalog-card-image img { display: block; width: 100%; height: 100%; object-fit: contain; transition: transform 220ms ease; }
.catalog-card-image:hover img { transform: scale(1.035); }
.catalog-card-body { flex: 1; min-width: 0; padding: var(--catalog-card-padding, 16px); }
.catalog-card-year { color: var(--gold); font-size: 12px; font-weight: 800; }
h3 { margin: 8px 0 0; font-family: Georgia, "Times New Roman", "Noto Serif SC", serif; font-size: var(--catalog-title-size, 21px); line-height: 1.35; overflow-wrap: anywhere; }
h3 button { padding: 0; border: 0; background: transparent; color: var(--ink); font: inherit; text-align: left; cursor: pointer; }
h3 button:hover { color: var(--primary); }
button:focus-visible { outline: 2px solid var(--primary); outline-offset: -3px; }
@media (prefers-reduced-motion: reduce) { .catalog-card-image img { transition: none; } }
</style>
