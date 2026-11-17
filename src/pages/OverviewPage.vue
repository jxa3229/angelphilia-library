<template>
  <template v-if="copy">
    <section class="masthead overview-masthead">
      <div class="masthead-copy overview-portraits" :style="{ '--collage-image': `url('${assetUrl(sharedImages[0].background)}')` }">
        <p>{{ copy.brandKicker }}</p>
        <h1>{{ copy.pageTitle }}</h1>
        <div class="notice">{{ copy.notice }}</div>
        <el-button class="journey-button" type="primary" size="large" :icon="Right" @click="router.push({ name: 'library' })">
          {{ copy.journey }}
        </el-button>
      </div>

      <div class="metadata-panel overview-outfits" :style="{ '--collage-image': `url('${assetUrl(sharedImages[1].background)}')` }">
        <h2>{{ copy.metadata }}</h2>
        <dl>
          <div><dt>{{ copy.organizer }}</dt><dd>影青(HeavyRain_3229)</dd></div>
          <div>
            <dt>{{ copy.updated }}</dt>
            <dd>
              <button class="update-date-link" type="button" aria-haspopup="dialog" :aria-label="`${copy.updated} ${changelog.latestDate} · ${copy.updateLogTitle}`" @click="changelog.open">
                <time :datetime="changelog.latestDate">{{ changelog.latestDate }}</time>
              </button>
            </dd>
          </div>
          <div><dt>{{ copy.repository }}</dt><dd>github.com/jxa3229/angelphilia-library</dd></div>
          <div><dt>{{ copy.scopeLabel }}</dt><dd>{{ copy.scopeValue }}</dd></div>
        </dl>
      </div>
    </section>

    <section class="stat-strip" aria-label="Library statistics">
      <StatCard v-for="stat in stats" :key="stat.label" :label="stat.label" :value="stat.value" />
    </section>

    <section class="overview-images" aria-labelledby="overview-images-heading">
      <div class="overview-images-heading">
        <h2 id="overview-images-heading">{{ collageCopy.heading }}</h2>
        <p>{{ collageCopy.intro }}</p>
      </div>
      <div class="overview-image-links">
        <RouterLink v-for="image in sharedImages" :key="image.id" :to="{ name: 'image', params: { id: image.id } }">
          <span>{{ image.title[language] }}</span><span aria-hidden="true">↗</span>
        </RouterLink>
      </div>
    </section>

    <section class="scope-text">
      <h2>{{ copy.scopeHeading }}</h2>
      <p>{{ copy.scopeText }}</p>
    </section>

    <section class="notice-panel overview-notice">
      <span>{{ copy.importantLabel }}</span>
      <h2>{{ copy.officialNoticeTitle }}</h2>
      <p>{{ copy.officialNoticeSummary }}</p>
      <p>{{ copy.officialRelationSummary }}</p>
    </section>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Right } from '@element-plus/icons-vue'
import { useLibraryStore } from '../stores/library'
import { usePreferencesStore } from '../stores/preferences'
import StatCard from '../components/shared/StatCard.vue'
import { useChangelogStore } from '../stores/changelog'
import { sharedImages, imageCopy } from '../data/sharedImages'
import { assetUrl } from '../utils/assetUrl'

const router = useRouter()
const preferences = usePreferencesStore()
const library = useLibraryStore()
const changelog = useChangelogStore()
const copy = computed(() => preferences.copy)
const stats = computed(() => library.stats(copy.value))
const language = computed(() => imageCopy[preferences.lang] ? preferences.lang : 'zh')
const collageCopy = computed(() => imageCopy[language.value])

defineProps({
  mainPanel: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.overview-masthead :is(.overview-portraits, .overview-outfits) { position: relative; isolation: isolate; overflow: hidden; background: #0b0c10; color: #f5f3f1; border-color: #42424c; }
.overview-masthead :is(.overview-portraits, .overview-outfits)::before { content: ''; position: absolute; inset: 0; z-index: -2; background: var(--collage-image) center 38% / cover no-repeat; opacity: .6; }
.overview-masthead :is(.overview-portraits, .overview-outfits)::after { content: ''; position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(7, 8, 12, .94), rgba(7, 8, 12, .55)); }
.overview-masthead .overview-outfits { align-self: stretch; }
.overview-masthead .overview-outfits::after { background: linear-gradient(180deg, rgba(7, 8, 12, .88), rgba(7, 8, 12, .7)); }
.overview-masthead :is(h1, h2, dd) { color: #f5f3f1; }
.overview-masthead :is(dt, .notice) { color: #e0dce1; }
.overview-masthead .masthead-copy > p { color: #d4b786; }
.overview-masthead .update-date-link { color: #a9ecdf; }
.overview-images { margin-top: 14px; padding: 24px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
.overview-images h2 { margin: 0; font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif; font-size: 24px; }
.overview-images p { margin: 8px 0 18px; color: var(--muted); }
.overview-image-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.overview-image-links a { display: flex; justify-content: space-between; gap: 12px; align-items: center; min-height: 52px; padding: 12px 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-strong); color: var(--ink); }
.overview-image-links a:hover { border-color: var(--primary); }
.overview-image-links a:focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; }
@media (max-width: 600px) { .overview-image-links { grid-template-columns: 1fr; } }
.update-date-link { min-height: 32px; padding: 0; border: 0; background: transparent; color: var(--primary); font: inherit; text-decoration: underline; text-underline-offset: 4px; cursor: pointer; }
.update-date-link:hover { color: var(--accent); }
.update-date-link:focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; }
</style>
