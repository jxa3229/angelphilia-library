<template>
  <section class="repo-section">
    <h2>{{ copy.repoHeading }}</h2>
    <p>
      {{ copy.repoLinkPrefix }}
      <span>{{ copy.repoLinkLabel }}</span>
      {{ copy.repoLinkSuffix }}
    </p>
    <p>{{ copy.openText }}</p>

    <div class="repo-disclosure">
      <section class="notice-panel">
        <span>{{ copy.importantLabel }}</span>
        <h3>{{ copy.officialNoticeTitle }}</h3>
        <p v-for="item in copy.officialNoticeParagraphs" :key="item">{{ item }}</p>
      </section>

      <section class="relation-panel">
        <h3>{{ copy.relationTitle }}</h3>
        <p>{{ copy.relationIntro }}</p>
        <dl class="relation-list">
          <div v-for="item in copy.brandRelations" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
        <p>{{ copy.relationNote }}</p>
      </section>

      <section class="notice-panel">
        <h3>{{ copy.vmf50Title }}</h3>
        <p>{{ copy.vmf50Text }}</p>
      </section>

      <section class="notice-panel">
        <h3>{{ copy.nonCommercialTitle }}</h3>
        <p>{{ copy.nonCommercialText }}</p>
        <p>{{ copy.correctionText }}</p>
        <p>{{ copy.contactText }}</p>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { usePreferencesStore } from '../stores/preferences'

const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)

defineProps({
  mainPanel: {
    type: Object,
    default: null
  }
})
</script>
