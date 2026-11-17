<template>
  <el-drawer v-model="visible" :title="name" size="min(720px, 100vw)" append-to-body destroy-on-close>
    <article class="drawer-content product-detail">
      <p v-if="subtitle" class="original-title">{{ subtitle }}</p>
      <ProductGallery :images="images" :name="name" />
      <MetadataList :fields="fields" />
      <section v-if="description" class="notice-panel product-description">
        <h3>{{ descriptionLabel || copy.metadata }}</h3>
        <p>{{ description }}</p>
      </section>
      <slot />
    </article>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue'
import ProductGallery from './ProductGallery.vue'
import MetadataList from './MetadataList.vue'
import { usePreferencesStore } from '../../stores/preferences'
const visible = defineModel({ type: Boolean, default: false })
defineProps({
  name: { type: String, required: true },
  subtitle: { type: String, default: '' },
  images: { type: Array, default: () => [] },
  fields: { type: Array, default: () => [] },
  description: { type: String, default: '' },
  descriptionLabel: { type: String, default: '' }
})
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
</script>

<style scoped>
.product-detail { padding-top: 4px; }
.product-description { margin-top: 0; }
.product-description p { white-space: pre-line; overflow-wrap: anywhere; }
</style>
