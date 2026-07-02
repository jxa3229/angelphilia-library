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
          :label="category"
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
      <article v-for="item in filteredItems" :key="item.id" class="outfit-card">
        <button
          class="outfit-image"
          type="button"
          :aria-label="item.title"
          @click="openItem(item)"
        >
          <img v-if="item.imageUrl" :src="assetUrl(item.imageUrl)" :alt="translatedTitle(item)" loading="lazy" />
          <span v-else>{{ copy.noImage }}</span>
        </button>

        <div class="outfit-card-body">
          <div class="record-meta">
            <span>#{{ item.id }}</span>
            <span>{{ outfitCategory(item) }}</span>
          </div>
          <h3>
            <button type="button" @click="openItem(item)">{{ translatedTitle(item) }}</button>
          </h3>
          <small class="original-title">{{ item.title }}</small>
          <p>{{ translatedDescription(item) }}</p>

          <div class="tags">
            <el-tag v-if="item.model" size="small" effect="plain">{{ item.model }}</el-tag>
            <el-tag size="small" type="info" effect="plain">{{ item.priceText || copy.unknown }}</el-tag>
          </div>
        </div>
      </article>
    </div>

    <el-drawer
      v-model="isDrawerOpen"
      :title="activeItem ? translatedTitle(activeItem) : copy.outfitDetail"
      size="min(720px, 100vw)"
      class="outfit-detail-drawer"
      append-to-body
    >
      <article v-if="activeItem" class="drawer-content outfit-detail">
        <p class="original-title">{{ activeItem.title }}</p>

        <el-carousel
          v-if="activeImages.length > 0"
          class="detail-carousel"
          height="min(58vh, 560px)"
          indicator-position="outside"
          arrow="always"
        >
          <el-carousel-item v-for="image in activeImages" :key="image">
            <img :src="assetUrl(image)" :alt="translatedTitle(activeItem)" />
          </el-carousel-item>
        </el-carousel>
        <div v-else class="drawer-empty-image">{{ copy.noImage }}</div>

        <dl>
          <div>
            <dt>{{ copy.tableNumber }}</dt>
            <dd>#{{ activeItem.id }}</dd>
          </div>
          <div>
            <dt>{{ copy.allOutfitCategories }}</dt>
            <dd>{{ outfitCategory(activeItem) }}</dd>
          </div>
          <div v-if="activeItem.model">
            <dt>{{ copy.partModel }}</dt>
            <dd>{{ activeItem.model }}</dd>
          </div>
          <div>
            <dt>{{ copy.metadata }}</dt>
            <dd>{{ activeItem.priceText || copy.unknown }}</dd>
          </div>
          <div>
            <dt>{{ copy.productSourceLink }}</dt>
            <dd>
              <a :href="activeItem.sourceUrl" target="_blank" rel="noreferrer">{{ activeItem.sourceUrl }}</a>
            </dd>
          </div>
        </dl>

        <section class="notice-panel outfit-description">
          <h3>{{ copy.outfitDescription }}</h3>
          <p>{{ translatedDescription(activeItem) }}</p>
        </section>
      </article>
    </el-drawer>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import outfits from '../data/outfits.json'
import { usePreferencesStore } from '../stores/preferences'
import { assetUrl } from '../utils/assetUrl'
import { outfitCategoryLabel, sortOutfitCategories } from '../utils/outfitCategory'
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

const categories = computed(() => sortOutfitCategories(unique(outfits.map(outfitCategoryLabel))))
const statuses = computed(() => unique(outfits.map((item) => item.status)).sort())
const filteredItems = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return outfits.filter((item) => {
    const category = outfitCategory(item)
    const haystack = [
      item.id,
      item.title,
      item.model,
      item.categoryLabel,
      category,
      item.priceText,
      item.description
    ].join(' ').toLowerCase()
    return (!keyword || haystack.includes(keyword))
      && (!selectedCategory.value || category === selectedCategory.value)
      && (!selectedStatus.value || item.status === selectedStatus.value)
  })
})
const resultText = computed(() => copy.value.outfitsResultCount
  .replace('{shown}', filteredItems.value.length)
  .replace('{total}', outfits.length))
const activeImages = computed(() => Array.isArray(activeItem.value?.images) ? activeItem.value.images : [])

function resetFilters() {
  query.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
}

function statusLabel(status) {
  return copy.value.statusLabels?.[status] || status || copy.value.unknown
}

function translatedTitle(item) {
  return translateOutfitTitle(item?.title)
}

function translatedDescription(item) {
  return translateOutfitDescription(item?.description)
}

function outfitCategory(item) {
  return outfitCategoryLabel(item)
}

function openItem(item) {
  activeItem.value = item
  isDrawerOpen.value = true
}
</script>
