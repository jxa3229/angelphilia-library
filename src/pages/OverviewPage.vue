<template>
  <template v-if="copy">
    <section class="masthead">
      <div class="masthead-copy">
        <p>{{ copy.brandKicker }}</p>
        <h1>{{ copy.pageTitle }}</h1>
        <div class="notice">{{ copy.notice }}</div>
        <el-button class="journey-button" type="primary" size="large" :icon="Right" @click="router.push({ name: 'library' })">
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

const router = useRouter()
const preferences = usePreferencesStore()
const library = useLibraryStore()
const copy = computed(() => preferences.copy)
const stats = computed(() => library.stats(copy.value))

defineProps({
  mainPanel: {
    type: Object,
    default: null
  }
})
</script>
