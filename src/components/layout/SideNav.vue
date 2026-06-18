<template>
  <aside class="side-nav">
    <div class="brand-block">
      <span>{{ copy.brandKicker }}</span>
      <strong>Angelphilia Library</strong>
    </div>

    <LanguageSwitcher />
    <ThemeSwitcher />

    <nav class="toc">
      <RouterLink
        v-for="item in preferences.navItems"
        :key="item.route"
        :to="{ name: item.route }"
        :class="{ active: route.name === item.route }"
        @click="handleNav(item.route)"
      >
        <span>{{ item.label }}</span>
        <strong v-if="item.bubble" class="comic-bubble">{{ item.bubble }}</strong>
      </RouterLink>
    </nav>

    <section class="recent-list" aria-labelledby="recent-title">
      <h2 id="recent-title">{{ copy.recentEntries }}</h2>
      <button
        v-for="record in library.recentRecords"
        :key="`${record.folder}-${record.name}`"
        type="button"
        @click="focusRecord(record)"
      >
        <span>{{ record.year }}</span>
        <strong>{{ record.name }}</strong>
      </button>
    </section>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import { useLibraryStore } from '../../stores/library'
import { usePreferencesStore } from '../../stores/preferences'

const route = useRoute()
const router = useRouter()
const preferences = usePreferencesStore()
const library = useLibraryStore()
const copy = computed(() => preferences.copy)

function handleNav(routeName) {
  if (routeName !== 'library') {
    library.clearActiveRecord()
  }
}

function focusRecord(record) {
  library.focusRecord(record)
  router.push({ name: 'library' })
}
</script>
