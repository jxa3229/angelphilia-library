<template>
  <section class="builder-panel code-panel">
    <div class="code-panel-row">
      <div class="code-panel-main">
        <span>{{ copy.bodyCode }}</span>
        <strong class="body-code-value">{{ code }}</strong>
      </div>
      <div v-if="matchingBodyExhibits.length" class="code-panel-exhibits">
        <span class="code-panel-exhibits-label">{{ copy.currentBodyExhibitsHeading }}</span>
        <div class="code-panel-exhibit-tags">
          <el-tag
            v-for="item in matchingBodyExhibits"
            :key="item.id"
            size="small"
            effect="plain"
            class="code-panel-exhibit-tag"
          >
            #{{ item.id }} {{ item.bodyTypes.join(' / ') }}
          </el-tag>
        </div>
      </div>
    </div>
    <div class="code-panel-summary-row">
      <p class="copy-preview">{{ summary }}</p>
      <div v-if="matchingBodyExhibits.length" class="code-panel-preview-list">
        <CatalogCard
          v-for="item in matchingBodyExhibits"
          :key="item.id"
          class="code-panel-preview-card"
          :image="imagePreviewList(item)[0] || ''" :year="item.year" :name="item.title" @open="openExhibit(item)"
        />
      </div>
    </div>
    <el-button type="primary" :icon="CopyDocument" @click="copySummary">{{ copy.copyData }}</el-button>
    <ProductDetailDrawer v-model="isExhibitOpen" :name="activeExhibit?.title || copy.currentBodyExhibitsHeading"
      :images="activeExhibit ? imagePreviewList(activeExhibit) : []" :fields="exhibitFields" :description="activeExhibit?.description || ''" />
  </section>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import CatalogCard from '../shared/CatalogCard.vue'
import ProductDetailDrawer from '../shared/ProductDetailDrawer.vue'

const props = defineProps({
  code: { type: String, required: true },
  summary: { type: String, required: true },
  copy: { type: Object, required: true },
  matchingBodyExhibits: { type: Array, default: () => [] }
})

const activeExhibit = ref(null)
const isExhibitOpen = ref(false)
const exhibitFields = computed(() => {
  const item = activeExhibit.value
  if (!item) return []
  return [
    { key: 'year', label: props.copy.tableYear, value: item.year },
    { key: 'number', label: props.copy.tableNumber, value: `#${item.id}` },
    { key: 'category', label: props.copy.allOutfitCategories, value: item.displayKindLabel },
    { key: 'composition', label: props.copy.bodyCode, value: bodyCodeLabel(item) },
    { key: 'model', label: props.copy.partModel, value: item.model },
    { key: 'price', label: props.copy.metadata, value: item.priceText },
    { key: 'source', label: props.copy.sourcePage, value: item.source || item.sourceUrl, href: item.sourceUrl }
  ]
})
function openExhibit(item) { activeExhibit.value = item; isExhibitOpen.value = true }

function imagePreviewList(item) {
  const images = Array.isArray(item.images) && item.images.length ? item.images : [item.imageUrl]
  return images.filter(Boolean)
}

function bodyCodeLabel(item) {
  const composition = item.bodyComposition || {}
  const code = item.bodyCode || ''
  const parts = ['upperTorso', 'lowerTorso', 'thigh']
    .map((slot) => composition[slot]?.type)
    .filter(Boolean)

  if (!code && !parts.length) return ''
  if (!parts.length) return code
  return `${code} / ${parts.map((part) => `Type-${part}`).join(' + ')}`
}

async function copySummary() {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(props.summary)
  } else {
    const textarea = document.createElement('textarea')
    textarea.value = props.summary
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
  ElMessage.success(props.copy.copied)
}
</script>
