<template>
  <el-config-provider>
    <div class="app-shell" :data-theme="theme">
      <aside class="side-nav">
        <div class="brand-block">
          <span>{{ copy.brandKicker }}</span>
          <strong>Angelphilia Library</strong>
        </div>

        <div class="segmented" aria-label="Language">
          <button
            v-for="item in languages"
            :key="item.value"
            type="button"
            :class="{ active: lang === item.value }"
            @click="lang = item.value"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="theme-row" aria-label="Theme">
          <el-tooltip :content="copy.light">
            <button type="button" :class="{ active: theme === 'light' }" @click="setTheme('light')">
              <el-icon><Sunny /></el-icon>
            </button>
          </el-tooltip>
          <el-tooltip :content="copy.dark">
            <button type="button" :class="{ active: theme === 'dark' }" @click="setTheme('dark')">
              <el-icon><Moon /></el-icon>
            </button>
          </el-tooltip>
          <el-tooltip :content="copy.system">
            <button type="button" :class="{ active: theme === 'system' }" @click="setTheme('system')">
              <el-icon><Monitor /></el-icon>
            </button>
          </el-tooltip>
        </div>

        <nav class="toc">
          <a
            v-for="item in navItems"
            :key="item.route"
            :href="`#/${item.route}`"
            :class="{ active: route === item.route }"
          >
            {{ item.label }}
          </a>
        </nav>

        <section class="recent-list" aria-labelledby="recent-title">
          <h2 id="recent-title">{{ copy.recentEntries }}</h2>
          <button
            v-for="record in recentRecords"
            :key="`${record.folder}-${record.name}`"
            type="button"
            @click="focusRecord(record)"
          >
            <span>{{ record.year }}</span>
            <strong>{{ record.name }}</strong>
          </button>
        </section>
      </aside>

      <main class="main-panel" :class="`route-${route}`">
        <template v-if="route === 'overview'">
          <section class="masthead">
            <div class="masthead-copy">
              <p>{{ copy.brandKicker }}</p>
              <h1>{{ copy.pageTitle }}</h1>
              <div class="notice">{{ copy.notice }}</div>
              <el-button class="journey-button" type="primary" size="large" :icon="Right" @click="goRoute('library')">
                {{ copy.journey }}
              </el-button>
            </div>

            <div class="metadata-panel">
              <h2>{{ copy.metadata }}</h2>
              <dl>
                <div><dt>{{ copy.organizer }}</dt><dd>影青(HeavyRain_3229)</dd></div>
                <div><dt>{{ copy.updated }}</dt><dd>2026-06-11</dd></div>
                <div><dt>{{ copy.repository }}</dt><dd>github.com/jxa3229/angelphilia-library</dd></div>
                <div><dt>{{ copy.scopeLabel }}</dt><dd>{{ copy.scopeValue }}</dd></div>
              </dl>
            </div>
          </section>

          <section class="stat-strip" aria-label="Library statistics">
            <div v-for="stat in stats" :key="stat.label">
              <span>{{ stat.label }}</span>
              <strong>{{ stat.value }}</strong>
            </div>
          </section>

          <section class="scope-text">
            <h2>{{ copy.scopeHeading }}</h2>
            <p>{{ copy.scopeText }}</p>
          </section>
        </template>

        <section v-if="route === 'library'" class="library-section">
          <div class="section-head">
            <div>
              <h2>{{ copy.libraryHeading }}</h2>
              <p>{{ resultText }}</p>
            </div>
            <el-button :icon="Refresh" @click="resetFilters">{{ copy.reset }}</el-button>
          </div>

          <template v-if="activeRecord">
            <section class="detail-page">
              <header class="detail-head">
                <el-button :icon="Back" @click="closeRecord">{{ copy.backToLibrary }}</el-button>
                <div>
                  <h2>{{ activeRecord.name }}</h2>
                  <p>{{ activeRecord.title }}</p>
                </div>
              </header>

              <div class="detail-layout">
                <div class="detail-gallery">
                  <el-carousel
                    v-if="recordImages(activeRecord).length > 0"
                    class="detail-carousel"
                    height="min(58vh, 620px)"
                    indicator-position="outside"
                    arrow="always"
                  >
                    <el-carousel-item v-for="item in recordImages(activeRecord)" :key="item">
                      <img :src="assetUrl(item)" :alt="activeRecord.name" @error="markImageFailed(activeRecord.folder, item)" />
                    </el-carousel-item>
                  </el-carousel>
                  <div v-else class="drawer-empty-image">{{ copy.noImage }}</div>
                </div>

                <article class="docx-content">
                  <div v-if="detailLoading" class="detail-loading">{{ copy.loading }}</div>
                  <div v-else-if="detailHtml(activeRecord)" v-html="detailHtml(activeRecord)"></div>
                  <el-empty v-else :description="copy.noDetail" />
                </article>
              </div>
            </section>
          </template>

          <template v-else>
            <div class="filters">
              <el-input
                v-model="query"
                :prefix-icon="Search"
                clearable
                :placeholder="copy.searchPlaceholder"
              />
              <el-select v-model="selectedGroup" :placeholder="copy.allGroups">
                <el-option :label="copy.allGroups" value="" />
                <el-option v-for="item in groups" :key="item" :label="item" :value="item" />
              </el-select>
              <el-select v-model="selectedYear" :placeholder="copy.allYears">
                <el-option :label="copy.allYears" value="" />
                <el-option v-for="item in years" :key="item" :label="item" :value="item" />
              </el-select>
              <el-select v-model="selectedSource" :placeholder="copy.allSources">
                <el-option :label="copy.allSources" value="" />
                <el-option v-for="item in sources" :key="item" :label="item" :value="item" />
              </el-select>
            </div>

            <el-empty v-if="filteredRecords.length === 0" :description="copy.empty" />

            <div v-else class="card-grid">
              <article v-for="record in filteredRecords" :key="record.folder" class="record-card">
                <button type="button" class="image-button" @click="openRecord(record)">
                  <img
                    v-if="coverImage(record)"
                    :src="assetUrl(coverImage(record))"
                    :alt="record.name"
                    loading="lazy"
                    @error="markImageFailed(record.folder, coverImage(record))"
                  />
                  <span v-else>{{ copy.noImage }}</span>
                </button>

                <div class="record-body">
                  <div class="record-meta">
                    <span>{{ record.year }}</span>
                    <span>{{ record.group }}</span>
                  </div>
                  <h3>
                    <button type="button" @click="openRecord(record)">{{ record.name }}</button>
                  </h3>
                  <p>{{ record.title }}</p>

                  <div class="tags">
                    <el-tag size="small" effect="plain">{{ record.series || copy.unknown }}</el-tag>
                    <el-tag size="small" type="info" effect="plain">{{ record.skin || copy.unknown }}</el-tag>
                  </div>

                  <dl class="compact-fields">
                    <div><dt>{{ copy.tableNumber }}</dt><dd>{{ record.number || copy.unknown }}</dd></div>
                    <div><dt>{{ copy.tableHead }}</dt><dd>{{ record.head || copy.unknown }}</dd></div>
                    <div><dt>{{ copy.tableBody }}</dt><dd>{{ record.body || copy.unknown }}</dd></div>
                  </dl>
                </div>
              </article>
            </div>
          </template>
        </section>

        <section v-if="route === 'index'" class="index-section">
          <div class="section-head">
            <div>
              <h2>{{ copy.fullIndexHeading }}</h2>
              <p>{{ copy.indexSubtitle }}</p>
            </div>
          </div>

          <el-table :data="filteredRecords" stripe height="560" class="index-table">
            <el-table-column prop="year" :label="copy.tableYear" width="88" sortable />
            <el-table-column prop="group" :label="copy.tableGroup" min-width="140" />
            <el-table-column prop="number" :label="copy.tableNumber" width="96" />
            <el-table-column :label="copy.tableName" min-width="180">
              <template #default="{ row }">
                <el-button link type="primary" @click="openRecord(row)">{{ row.name }}</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="variant" :label="copy.tableVariant" min-width="170" />
            <el-table-column prop="head" :label="copy.tableHead" min-width="140" />
            <el-table-column prop="body" :label="copy.tableBody" min-width="170" />
            <el-table-column prop="skin" :label="copy.tableSkin" min-width="150" />
            <el-table-column :label="copy.tableFolder" min-width="210">
              <template #default="{ row }">
                <button class="plain-link" type="button" @click="openRecord(row)">{{ row.folder }}</button>
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section v-if="route === 'repository'" class="repo-section">
          <h2>{{ copy.repoHeading }}</h2>
          <p v-html="copy.repoText"></p>
          <p>{{ copy.openText }}</p>
        </section>

        <footer>{{ copy.footer }}</footer>
      </main>
    </div>
  </el-config-provider>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Back, Monitor, Moon, Refresh, Right, Search, Sunny } from '@element-plus/icons-vue'
import records from './data/records.json'

const languages = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' }
]

const dictionary = {
  zh: {
    brandKicker: 'Library Index',
    navSummary: '图书馆速览',
    navLibrary: '馆藏条目',
    navIndex: '完整索引',
    navRepo: '仓库说明',
    recentEntries: '最近条目',
    pageTitle: 'Angelphilia / RealArtProject / VMF50 图书馆',
    journey: '启程',
    notice: '本页仅供资料查询、交流与个人收藏整理使用；规格、售价、库存、版权与销售信息以官方原页面为准。',
    metadata: 'Library metadata',
    organizer: '整理人',
    updated: '更新时间',
    repository: '仓库',
    scopeLabel: '资料范围',
    scopeValue: 'Angel Philia、Real Art Project / Pink Drops、VMF50 / YAMATO',
    scopeHeading: '范围说明',
    scopeText: '本项目记录 Angel Philia 主线整娃、Real Art Project / Pink Drops 旧页补档、VMF50 / YAMATO 早期条目，以及部分联动和抽选记录。馆藏字段与速览文档保持一致，每条记录保留来源页、record.md 和可用的公开图片链接。',
    libraryHeading: '馆藏条目',
    fullIndexHeading: '完整索引',
    indexSubtitle: '索引与卡片共享筛选条件，便于快速核对年份、系列、肤色和目录。',
    repoHeading: '仓库与部署说明',
    repoText: '当前图书馆项目仓库为 <a href="https://github.com/jxa3229/angelphilia-library" target="_blank" rel="noreferrer">jxa3229/angelphilia-library</a>。',
    openText: 'GitHub Pages 由 Vite 构建产物发布；records 目录在构建时复制为静态资源。',
    footer: 'Angelphilia Library · personal reference index',
    searchPlaceholder: '搜索名字、编号、Body、肤色、目录...',
    allGroups: '全部馆别',
    allYears: '全部年份',
    allSources: '全部来源',
    reset: '重置',
    empty: '没有匹配条目',
    noImage: 'No image',
    unknown: '未明',
    light: '亮色',
    dark: '暗色',
    system: '跟随系统',
    total: '总条目',
    yearSpan: '年份跨度',
    imageCount: '含图片',
    groupCount: '馆别',
    resultCount: '显示 {shown} / {total} 条',
    tableYear: '年份',
    tableGroup: '馆别',
    tableSeries: '系列',
    tableNumber: '编号',
    tableName: '名字',
    tableVariant: '版本/区别',
    tableHead: '头',
    tableBody: 'Body',
    tableSkin: '肤色',
    tableFolder: '目录',
    recordFile: 'record.md',
    sourcePage: '来源页',
    backToLibrary: '返回馆藏条目',
    noDetail: '暂无 docx 详情',
    loading: '正在加载详情...'
  },
  en: {
    brandKicker: 'Library Index',
    navSummary: 'Library overview',
    navLibrary: 'Collection',
    navIndex: 'Full index',
    navRepo: 'Repository',
    recentEntries: 'Recent entries',
    pageTitle: 'Angelphilia / RealArtProject / VMF50 Library',
    journey: 'Begin',
    notice: 'For reference, personal collecting, and discussion only. Specifications, prices, stock, copyrights, and sales information should be checked on official pages.',
    metadata: 'Library metadata',
    organizer: 'Maintainer',
    updated: 'Updated',
    repository: 'Repository',
    scopeLabel: 'Scope',
    scopeValue: 'Angel Philia, Real Art Project / Pink Drops, VMF50 / YAMATO',
    scopeHeading: 'Scope',
    scopeText: 'This project records Angel Philia main-line dolls, Real Art Project / Pink Drops archive entries, early VMF50 / YAMATO items, and selected collaboration or lottery releases. Fields stay aligned with the overview document, while each item keeps its source page, record.md file, and available public images.',
    libraryHeading: 'Collection',
    fullIndexHeading: 'Full index',
    indexSubtitle: 'The index shares the same filters as the card view for quick checks across year, series, skin tone, and folder.',
    repoHeading: 'Repository and deployment',
    repoText: 'The library repository is <a href="https://github.com/jxa3229/angelphilia-library" target="_blank" rel="noreferrer">jxa3229/angelphilia-library</a>.',
    openText: 'GitHub Pages publishes the Vite build output. The records directory is copied as static assets during build.',
    footer: 'Angelphilia Library · personal reference index',
    searchPlaceholder: 'Search name, number, body, skin, folder...',
    allGroups: 'All groups',
    allYears: 'All years',
    allSources: 'All sources',
    reset: 'Reset',
    empty: 'No matching records',
    noImage: 'No image',
    unknown: 'Unknown',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    total: 'Records',
    yearSpan: 'Year span',
    imageCount: 'With images',
    groupCount: 'Groups',
    resultCount: 'Showing {shown} / {total}',
    tableYear: 'Year',
    tableGroup: 'Group',
    tableSeries: 'Series',
    tableNumber: 'No.',
    tableName: 'Name',
    tableVariant: 'Variant',
    tableHead: 'Head',
    tableBody: 'Body',
    tableSkin: 'Skin',
    tableFolder: 'Folder',
    recordFile: 'record.md',
    sourcePage: 'Source',
    backToLibrary: 'Back to collection',
    noDetail: 'No DOCX detail',
    loading: 'Loading detail...'
  },
  ja: {
    brandKicker: 'Library Index',
    navSummary: 'ライブラリ概要',
    navLibrary: 'コレクション',
    navIndex: '索引',
    navRepo: 'リポジトリ',
    recentEntries: '最近の項目',
    pageTitle: 'Angelphilia / RealArtProject / VMF50 ライブラリ',
    journey: '出発',
    notice: '資料確認、交流、個人コレクション整理用です。仕様、価格、在庫、著作権、販売情報は公式ページを確認してください。',
    metadata: 'Library metadata',
    organizer: '整理',
    updated: '更新日',
    repository: 'リポジトリ',
    scopeLabel: '範囲',
    scopeValue: 'Angel Philia、Real Art Project / Pink Drops、VMF50 / YAMATO',
    scopeHeading: '範囲',
    scopeText: 'Angel Philia 本線、Real Art Project / Pink Drops の旧ページ補完、VMF50 / YAMATO 初期項目、一部のコラボと抽選記録を収録します。項目体系は速覧資料に合わせ、各記録に source page、record.md、利用可能な公開画像を保持します。',
    libraryHeading: 'コレクション',
    fullIndexHeading: '完全索引',
    indexSubtitle: '索引はカード表示と同じ絞り込み条件を使い、年、シリーズ、肌色、フォルダを確認できます。',
    repoHeading: 'リポジトリとデプロイ',
    repoText: 'ライブラリのリポジトリは <a href="https://github.com/jxa3229/angelphilia-library" target="_blank" rel="noreferrer">jxa3229/angelphilia-library</a> です。',
    openText: 'GitHub Pages は Vite のビルド成果物を公開します。records ディレクトリはビルド時に静的資産としてコピーされます。',
    footer: 'Angelphilia Library · personal reference index',
    searchPlaceholder: '名前、番号、Body、肌色、フォルダを検索...',
    allGroups: 'すべての館別',
    allYears: 'すべての年',
    allSources: 'すべての出典',
    reset: 'リセット',
    empty: '一致する項目がありません',
    noImage: 'No image',
    unknown: '未明',
    light: 'ライト',
    dark: 'ダーク',
    system: 'システム',
    total: '項目',
    yearSpan: '年範囲',
    imageCount: '画像あり',
    groupCount: '館別',
    resultCount: '{shown} / {total} 件を表示',
    tableYear: '年',
    tableGroup: '館別',
    tableSeries: 'シリーズ',
    tableNumber: '番号',
    tableName: '名前',
    tableVariant: '版/差異',
    tableHead: 'Head',
    tableBody: 'Body',
    tableSkin: '肌色',
    tableFolder: 'フォルダ',
    recordFile: 'record.md',
    sourcePage: '出典',
    backToLibrary: 'コレクションに戻る',
    noDetail: 'DOCX 詳細なし',
    loading: '詳細を読み込み中...'
  }
}

const lang = ref(localStorage.getItem('library-lang') || 'zh')
const theme = ref(localStorage.getItem('library-theme') || 'system')
const route = ref(readRoute())
const query = ref('')
const selectedGroup = ref('')
const selectedYear = ref('')
const selectedSource = ref('')
const activeRecord = ref(null)
const savedLibraryScroll = ref(0)
const failedImages = ref(new Set())
const detailsCache = ref({})
const detailLoading = ref(false)

const copy = computed(() => dictionary[lang.value] || dictionary.zh)
const navItems = computed(() => [
  { route: 'overview', label: copy.value.navSummary },
  { route: 'library', label: copy.value.navLibrary },
  { route: 'index', label: copy.value.navIndex },
  { route: 'repository', label: copy.value.navRepo }
])
const groups = computed(() => unique(records.map((item) => item.group)).sort())
const years = computed(() => unique(records.map((item) => item.year)).sort(compareYear))
const sources = computed(() => unique(records.map((item) => item.source || copy.value.unknown)).sort())

const filteredRecords = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return records.filter((record) => {
    const haystack = [
      record.year,
      record.group,
      record.series,
      record.number,
      record.name,
      record.title,
      record.variant,
      record.head,
      record.body,
      record.skin,
      record.source,
      record.folder
    ].join(' ').toLowerCase()

    return (!keyword || haystack.includes(keyword))
      && (!selectedGroup.value || record.group === selectedGroup.value)
      && (!selectedYear.value || record.year === selectedYear.value)
      && (!selectedSource.value || (record.source || copy.value.unknown) === selectedSource.value)
  })
})

const recentRecords = computed(() => [...records].sort((a, b) => compareYear(b.year, a.year)).slice(0, 8))
const resultText = computed(() => copy.value.resultCount.replace('{shown}', filteredRecords.value.length).replace('{total}', records.length))
const stats = computed(() => [
  { label: copy.value.total, value: records.length },
  { label: copy.value.yearSpan, value: `${years.value[0]}-${years.value[years.value.length - 2] || years.value.at(-1)}` },
  { label: copy.value.imageCount, value: records.filter((item) => recordImages(item).length).length },
  { label: copy.value.groupCount, value: groups.value.length }
])

watch(lang, (value) => localStorage.setItem('library-lang', value))
watch(theme, (value) => {
  localStorage.setItem('library-theme', value)
  applyTheme(value)
})

onMounted(() => {
  applyTheme(theme.value)
  if (!location.hash || location.hash === '#repository' || location.hash === '#overview') {
    history.replaceState(null, '', '#/overview')
    route.value = 'overview'
  }
  window.addEventListener('hashchange', () => {
    route.value = readRoute()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
})

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function compareYear(a, b) {
  const left = Number.parseInt(a, 10)
  const right = Number.parseInt(b, 10)
  if (Number.isNaN(left) && Number.isNaN(right)) return String(a).localeCompare(String(b))
  if (Number.isNaN(left)) return 1
  if (Number.isNaN(right)) return -1
  return left - right
}

function setTheme(value) {
  theme.value = value
}

function applyTheme(value) {
  document.documentElement.dataset.theme = value
}

function resetFilters() {
  query.value = ''
  selectedGroup.value = ''
  selectedYear.value = ''
  selectedSource.value = ''
}

function readRoute() {
  const raw = location.hash.replace(/^#\/?/, '')
  return ['overview', 'library', 'index', 'repository'].includes(raw) ? raw : 'overview'
}

function goRoute(nextRoute) {
  activeRecord.value = null
  location.hash = `#/${nextRoute}`
  route.value = nextRoute
}

function coverImage(record) {
  return recordImages(record)[0] || ''
}

function recordImages(record) {
  if (!record) return []
  const failed = failedImages.value
  const images = Array.isArray(record.images) && record.images.length
    ? (Array.isArray(record.safeImages) && record.safeImages.length ? record.safeImages : record.images)
    : [record.safeImageUrl || record.imageUrl || (record.safeFolder ? `media/${record.safeFolder}/01.jpg` : '')].filter(Boolean)

  return images.filter((item) => !failed.has(imageFailureKey(record.folder, item)))
}

function assetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  return `${base}${path.split('/').map((part) => encodeURIComponent(part)).join('/')}`
}

function markImageFailed(folder, imagePath) {
  failedImages.value = new Set([...failedImages.value, imageFailureKey(folder, imagePath)])
}

function imageFailureKey(folder, imagePath) {
  return `${folder || ''}::${imagePath || ''}`
}

function focusRecord(record) {
  goRoute('library')
  query.value = record.name
}

function openRecord(record) {
  if (route.value !== 'library') {
    history.replaceState(null, '', '#/library')
    route.value = 'library'
  }
  const main = document.querySelector('.main-panel')
  savedLibraryScroll.value = main?.scrollTop || 0
  activeRecord.value = record
  loadDetails()
  nextTick(() => {
    if (main) main.scrollTop = 0
  })
}

function closeRecord() {
  activeRecord.value = null
  nextTick(() => {
    const main = document.querySelector('.main-panel')
    if (main) main.scrollTop = savedLibraryScroll.value
  })
}

function detailHtml(record) {
  return detailsCache.value[record?.detailKey] || ''
}

async function loadDetails() {
  if (Object.keys(detailsCache.value).length || detailLoading.value) return

  detailLoading.value = true
  try {
    const response = await fetch(assetUrl('details.json'))
    if (!response.ok) return
    detailsCache.value = await response.json()
  } catch {
    detailsCache.value = {}
  } finally {
    detailLoading.value = false
  }
}
</script>
