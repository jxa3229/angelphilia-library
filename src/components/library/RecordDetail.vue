<template>
  <section class="detail-page">
    <header class="detail-head">
      <el-button :icon="Back" @click="$emit('close')">{{ copy.backToLibrary }}</el-button>
      <div>
        <h2>{{ record.name }}</h2>
        <p>{{ record.title }}</p>
      </div>
    </header>

    <div class="detail-layout">
      <RecordGallery :record="record" />

      <article class="docx-content">
        <div v-if="library.isDetailLoading(record)" class="detail-loading">{{ copy.loading }}</div>
        <div v-else-if="library.detailError(record, copy)" class="detail-error">{{ library.detailError(record, copy) }}</div>
        <div v-else-if="safeDetailHtml" v-html="safeDetailHtml"></div>
        <div v-else-if="record.description" class="external-detail">
          <p>{{ record.description }}</p>
          <a v-if="record.sourceUrl" :href="record.sourceUrl" target="_blank" rel="noreferrer">
            {{ copy.sourcePage }}
          </a>
        </div>
        <el-empty v-else :description="copy.noDetail" />
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { Back } from '@element-plus/icons-vue'
import RecordGallery from './RecordGallery.vue'
import { sanitizeHtml } from '../../utils/sanitizeHtml'
import { useLibraryStore } from '../../stores/library'
import { usePreferencesStore } from '../../stores/preferences'

defineEmits(['close'])

const props = defineProps({
  record: {
    type: Object,
    required: true
  }
})

const library = useLibraryStore()
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const safeDetailHtml = computed(() => sanitizeHtml(library.detailHtml(props.record)))
</script>
