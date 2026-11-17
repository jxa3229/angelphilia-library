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
          <div>
            <dt>{{ copy.contactLabel }}</dt>
            <dd>
              <a class="contact-link" href="mailto:talon3229@163.com">talon3229@163.com</a>
              <p class="contact-hint">{{ copy.contactHint }}</p>
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="stat-strip" aria-label="Library statistics">
      <StatCard v-for="stat in stats" :key="stat.label" :label="stat.label" :value="stat.value" />
    </section>

    <section class="scope-text">
      <h2>{{ copy.scopeHeading }}</h2>
      <p>{{ copy.scopeText }}</p>
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
import { sharedImages } from '../data/sharedImages'
import { assetUrl } from '../utils/assetUrl'

const router = useRouter()
const preferences = usePreferencesStore()
const library = useLibraryStore()
const changelog = useChangelogStore()
const copy = computed(() => preferences.copy)
const stats = computed(() => library.stats(copy.value))

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
.contact-hint { margin: 4px 0 0; color: var(--muted); font-size: 13px; }
.update-date-link { min-height: 32px; padding: 0; border: 0; background: transparent; color: var(--primary); font: inherit; text-decoration: underline; text-underline-offset: 4px; cursor: pointer; }
.update-date-link:hover { color: var(--accent); }
.update-date-link:focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; }
</style>
