<template>
  <section class="detail-page">
    <header class="detail-head">
      <el-button :icon="Back" @click="$emit('close')">{{ backLabel || copy.backToLibrary }}</el-button>
      <div>
        <h2>{{ displayRecord.name }}</h2>
        <p>{{ displayRecord.title }}</p>
      </div>
    </header>

    <div class="detail-layout">
      <RecordGallery :record="record" />

      <article class="docx-content">
        <RecordMetadata :record="record" />
        <template v-if="isLimited">
          <div class="external-detail limited-description">
            <p>{{ displayRecord.description || limitedRecordSummary(record, preferences.lang) }}</p>
            <a v-if="record.sourceUrl" :href="record.sourceUrl" target="_blank" rel="noopener noreferrer">{{ copy.sourcePage }}</a>
          </div>
          <details v-if="record.detailKey" class="limited-source-detail">
            <summary>{{ limitedLabels.details }}</summary>
            <div v-if="library.isDetailLoading(record)" class="detail-loading">{{ copy.loading }}</div>
            <div v-else-if="library.detailError(record, copy)" class="detail-error">{{ library.detailError(record, copy) }}</div>
            <div v-else-if="safeDetailHtml" v-html="safeDetailHtml"></div>
            <el-empty v-else :description="copy.noDetail" />
          </details>
        </template>
        <div v-else-if="library.isDetailLoading(record)" class="detail-loading">{{ copy.loading }}</div>
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
import RecordMetadata from './RecordMetadata.vue'
import { sanitizeHtml } from '../../utils/sanitizeHtml'
import { useLibraryStore } from '../../stores/library'
import { usePreferencesStore } from '../../stores/preferences'
import { limitedCategories } from '../../utils/limitedRecords'
import { limitedCopy, localizeLimitedRecord, limitedRecordSummary } from '../../i18n/limited'
import { normalizeSelectionName } from '../../utils/recordNames'

defineEmits(['close'])

const props = defineProps({
  backLabel: {
    type: String,
    default: ''
  },
  record: {
    type: Object,
    required: true
  }
})

const library = useLibraryStore()
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const isLimited = computed(() => limitedCategories(props.record).length > 0)
const displayRecord = computed(() => localizeLimitedRecord(props.record, preferences.lang))
const limitedLabels = computed(() => limitedCopy[preferences.lang] || limitedCopy.zh)
const safeDetailHtml = computed(() => {
  const html = sanitizeHtml(library.detailHtml(props.record))
  if (!isLimited.value || !html) return html
  // 只规范文本节点，避免替换 URL 或图片路径中的历史日文名称。
  const template = document.createElement('template')
  template.innerHTML = html
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) walker.currentNode.textContent = normalizeSelectionName(walker.currentNode.textContent)
  return template.innerHTML
})
</script>

<style scoped>
.limited-description p { white-space: pre-line; }
.limited-source-detail { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--line); }
.limited-source-detail summary { cursor: pointer; margin-bottom: 16px; color: var(--primary); font-weight: 700; }
</style>
