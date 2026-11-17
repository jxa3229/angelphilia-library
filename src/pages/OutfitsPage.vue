<template>
  <section class="outfits-section">
    <div class="section-head">
      <div>
        <h2>{{ copy.outfitsHeading }}</h2>
        <p>{{ resultText }}</p>
      </div>
      <el-button :icon="Refresh" @click="resetFilters">{{ copy.reset }}</el-button>
    </div>

    <div class="filters outfits-filters">
      <el-input v-model="query" :placeholder="copy.outfitsSearchPlaceholder" clearable />
      <el-select v-model="selectedCategory" :placeholder="copy.allOutfitCategories" clearable>
        <el-option
          v-for="category in categories"
          :key="category"
          :label="categoryLabel(category, preferences.lang)"
          :value="category"
        />
      </el-select>
      <el-select v-model="selectedStatus" :placeholder="copy.allStatuses" clearable>
        <el-option
          v-for="status in statuses"
          :key="status"
          :label="statusLabel(status)"
          :value="status"
        />
      </el-select>
    </div>

    <el-empty v-if="filteredItems.length === 0" :description="copy.empty" />

    <div v-else class="outfit-grid">
      <CatalogCard v-for="(item, index) in visibleItems" :key="item.id" class="outfit-card"
        :image="item.imageUrl" :priority="index < 4" :year="item.year" :name="translatedTitle(item)" @open="openItem(item)" />
    </div>
    <div v-if="filteredItems.length" class="outfits-load-more">
      <p aria-live="polite">{{ copy.libraryVisibleCount.replace('{shown}', visibleItems.length).replace('{total}', filteredItems.length) }}</p>
      <el-button v-if="visibleItems.length < filteredItems.length" @click="visibleCount += 24">{{ copy.loadMoreRecords }}</el-button>
    </div>

    <ProductDetailDrawer
      v-model="isDrawerOpen"
      :name="activeItem ? translatedTitle(activeItem) : copy.outfitDetail"
      :subtitle="activeItem?.title || ''"
      :images="activeImages"
      :fields="detailFields"
      :description="activeItem ? translatedDescription(activeItem) : ''"
      :description-label="copy.outfitDescription"
      description-lang="ja"
      :description-note="copy.originalJapaneseNotes"
      class="outfit-detail-drawer"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import outfits from '../data/outfits.json'
import { usePreferencesStore } from '../stores/preferences'
import CatalogCard from '../components/shared/CatalogCard.vue'
import ProductDetailDrawer from '../components/shared/ProductDetailDrawer.vue'
import { categoryLabel, outfitCategoryKey, outfitCategoryKeys, outfitCategoryLabel } from '../utils/outfitCategory'
import { translateOutfitDescription, translateOutfitTitle } from '../utils/outfitText'
import { unique } from '../utils/records'

defineProps({
  mainPanel: {
    type: Object,
    default: null
  }
})

const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const query = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const activeItem = ref(null)
const isDrawerOpen = ref(false)
const visibleCount = ref(24)
watch([query, selectedCategory, selectedStatus], () => { visibleCount.value = 24 })

const categories = outfitCategoryKeys.filter((key) => outfits.some((item) => outfitCategoryKey(item) === key))
const statuses = computed(() => unique(outfits.map((item) => item.status)).sort())
const searchableItems = outfits.map((item) => ({
  item,
  category: outfitCategoryKey(item),
  text: [item.id, item.title, item.model, item.categoryLabel, item.priceText, item.description,
    ...['zh', 'en', 'ja'].flatMap((lang) => [translateOutfitTitle(item.title, lang), outfitCategoryLabel(item, lang)])
  ].join(' ').normalize('NFKC').toLowerCase()
}))
const filteredItems = computed(() => {
  const keyword = query.value.normalize('NFKC').trim().toLowerCase()
  return searchableItems.filter(({ item, category, text }) => {
    return (!keyword || text.includes(keyword))
      && (!selectedCategory.value || category === selectedCategory.value)
      && (!selectedStatus.value || item.status === selectedStatus.value)
  }).map(({ item }) => item)
})
const visibleItems = computed(() => filteredItems.value.slice(0, visibleCount.value))
const resultText = computed(() => copy.value.outfitsResultCount
  .replace('{shown}', filteredItems.value.length)
  .replace('{total}', outfits.length))
const activeImages = computed(() => activeItem.value?.images?.length ? activeItem.value.images : [activeItem.value?.imageUrl].filter(Boolean))
const detailFields = computed(() => {
  const item = activeItem.value
  if (!item) return []
  return [
    { label: copy.value.tableYear, value: item.year },
    { label: copy.value.tableNumber, value: `#${item.id}` },
    { label: copy.value.allOutfitCategories, value: outfitCategory(item) },
    { label: copy.value.partModel, value: item.model },
    { label: copy.value.metadata, value: item.priceText },
    { label: copy.value.allStatuses, value: statusLabel(item.status) },
    { label: copy.value.productSourceLink, value: item.sourceUrl, href: item.sourceUrl }
  ]
})

function resetFilters() {
  query.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
}

function statusLabel(status) {
  return copy.value.statusLabels?.[status] || status || copy.value.unknown
}

function translatedTitle(item) {
  return translateOutfitTitle(item?.title, preferences.lang)
}

function translatedDescription(item) {
  return translateOutfitDescription(item?.description)
}

function outfitCategory(item) {
  return outfitCategoryLabel(item, preferences.lang)
}

function openItem(item) {
  activeItem.value = item
  isDrawerOpen.value = true
}
</script>

<style scoped>
.outfits-load-more { display: grid; justify-items: center; gap: 8px; padding: 24px 0; color: var(--muted); font-size: 14px; }
.outfits-load-more .el-button { min-height: 44px; }
</style>
