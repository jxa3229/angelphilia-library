<template>
  <el-dialog
    v-model="visible"
    class="purchase-links-dialog"
    modal-class="purchase-links-overlay"
    width="min(1220px, calc(100vw - 40px))"
    append-to-body
    destroy-on-close
    :modal="true"
    :close-on-click-modal="true"
    @opened="bindOverlayClose"
    @closed="unbindOverlayClose"
  >
    <template #header>
      <div class="purchase-dialog-head">
        <span>Hidden Index</span>
        <h2>购买入口 / Purchase Links</h2>
        <p>VMF50、Angel Philia、Pink Drops、Obitsu 48-50cm 与 AZO2 衣服配饰渠道。</p>
      </div>
    </template>

    <section class="personal-image-tools">
      <h3>{{ collageCopy.heading }}</h3>
      <p>{{ collageCopy.intro }}</p>
      <div>
        <RouterLink v-for="image in sharedImages" :key="image.id" :to="{ name: 'image', params: { id: image.id } }" @click="visible = false">
          {{ image.title[language] }} ↗
        </RouterLink>
      </div>
    </section>

    <div class="purchase-dialog-tools">
      <el-input
        v-model="query"
        clearable
        placeholder="搜索店铺、地区、关键词..."
        aria-label="搜索购买入口"
      />
      <div class="purchase-category-tabs" role="tablist" aria-label="购买入口分类">
        <button
          v-for="category in categoryTabs"
          :key="category.value"
          type="button"
          :class="{ active: activeCategory === category.value }"
          @click="activeCategory = category.value"
        >
          {{ category.label }}
          <small>{{ category.count }}</small>
        </button>
      </div>
    </div>

    <div class="purchase-summary">
      <strong>{{ filteredShops.length }}</strong>
      <span>个入口</span>
      <span>数据更新：{{ shopData.metadata.lastChecked }}</span>
    </div>

    <div class="purchase-links-grid">
      <ShopLinkCard v-for="shop in filteredShops" :key="shop.id" :shop="shop"
        :category="categoryLabel(shop.category)" :platform="platformLabel(shop.platformType)" :confidence="confidenceLabel(shop.sourceConfidence)" />
    </div>

    <section class="purchase-keywords" aria-label="搜索关键词">
      <h3>搜索关键词</h3>
      <div>
        <span v-for="keyword in allSearchKeywords" :key="keyword">{{ keyword }}</span>
      </div>
    </section>
  </el-dialog>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import shopData from '../../../records/doll-clothing-shops.json'
import ShopLinkCard from './ShopLinkCard.vue'
import { sharedImages, imageCopy } from '../../data/sharedImages'
import { usePreferencesStore } from '../../stores/preferences'

const visible = defineModel({ type: Boolean, default: false })
const preferences = usePreferencesStore()
const language = computed(() => imageCopy[preferences.lang] ? preferences.lang : 'zh')
const collageCopy = computed(() => imageCopy[language.value])
const query = ref('')
const activeCategory = ref('all')

const labels = {
  all: '全部',
  new: '新品',
  second_hand: '二手',
  auction: '拍卖',
  handmade: '手作',
  marketplace: '平台',
  retailer_directory: '官方目录'
}

const platformLabels = {
  official_store: '官方店',
  official_directory: '官方目录',
  specialist_retailer: '专业零售',
  hobby_retailer: 'Hobby 店',
  second_hand_marketplace: '二手平台',
  second_hand_store: '二手店',
  auction_marketplace: '拍卖平台',
  handmade_marketplace: '手作平台',
  creator_store: '创作者店',
  general_marketplace: '综合平台'
}

const shops = computed(() => shopData.shops)
const allSearchKeywords = computed(() => [
  ...shopData.searchKeywords.english,
  ...shopData.searchKeywords.japanese,
  ...shopData.searchKeywords.chinese
])

const categoryTabs = computed(() => {
  const counts = shops.value.reduce((result, shop) => {
    result[shop.category] = (result[shop.category] || 0) + 1
    return result
  }, {})

  return [
    { value: 'all', label: labels.all, count: shops.value.length },
    ...Object.entries(counts).map(([value, count]) => ({
      value,
      label: categoryLabel(value),
      count
    }))
  ]
})

const filteredShops = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()

  return shops.value.filter((shop) => {
    const matchesCategory = activeCategory.value === 'all' || shop.category === activeCategory.value
    if (!matchesCategory) return false
    if (!normalizedQuery) return true

    const searchable = [
      shop.name,
      shop.url,
      shop.category,
      shop.platformType,
      shop.region,
      shop.notes,
      ...shop.fitKeywords,
      ...shop.itemsToSearch
    ].join(' ').toLowerCase()

    return searchable.includes(normalizedQuery)
  })
})

function categoryLabel(category) {
  return labels[category] || category
}

function platformLabel(platformType) {
  return platformLabels[platformType] || platformType
}

function confidenceLabel(confidence) {
  if (confidence === 'high') return '高可信'
  if (confidence === 'medium') return '需核对库存'
  return '待核对'
}

function closeWhenOverlayClicked(event) {
  if (event.target?.classList?.contains('el-overlay-dialog')) {
    visible.value = false
  }
}

function bindOverlayClose() {
  const overlay = document.querySelector('.purchase-links-overlay .el-overlay-dialog')
  overlay?.addEventListener('click', closeWhenOverlayClicked)
}

function unbindOverlayClose() {
  const overlay = document.querySelector('.purchase-links-overlay .el-overlay-dialog')
  overlay?.removeEventListener('click', closeWhenOverlayClicked)
}

onBeforeUnmount(unbindOverlayClose)
</script>

<style scoped>
.personal-image-tools { margin-bottom: 20px; padding: 16px; border: 1px solid var(--line); border-radius: 8px; }
.personal-image-tools h3 { margin: 0; }
.personal-image-tools p { margin: 8px 0 12px; color: var(--muted); }
.personal-image-tools > div { display: flex; flex-wrap: wrap; gap: 12px; }
.personal-image-tools a { display: inline-flex; align-items: center; min-height: 44px; padding: 8px 12px; border: 1px solid var(--line); border-radius: 8px; }
.personal-image-tools a:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
</style>
