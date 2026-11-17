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
      </RouterLink>
      <details class="nav-more">
        <summary>{{ copy.moreNavigation }}</summary>
        <RouterLink :to="{ name: 'repository' }" :class="{ active: route.name === 'repository' }" @click="handleNav('repository')">
          <span>{{ copy.navRepo }}</span>
        </RouterLink>
      </details>
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

    <button class="changelog-trigger" type="button" @click="changelog.open">
      <span aria-hidden="true">+</span>
      {{ copy.updateLogTitle }}
    </button>

  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import { useLibraryStore } from '../../stores/library'
import { usePreferencesStore } from '../../stores/preferences'
import { useChangelogStore } from '../../stores/changelog'

const route = useRoute()
const router = useRouter()
const preferences = usePreferencesStore()
const library = useLibraryStore()
const changelog = useChangelogStore()
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

<style scoped>
.nav-more > summary { min-height: 44px; padding: 10px; border-radius: 8px; color: var(--muted); cursor: pointer; }
.nav-more > summary:hover { background: var(--primary-soft); }
.nav-more > summary:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.nav-more > a { display: block; margin-top: 4px; }
</style>
