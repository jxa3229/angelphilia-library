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

    <button class="changelog-trigger" type="button" @click="openChangelog">
      <span aria-hidden="true">+</span>
      {{ copy.updateLogTitle }}
    </button>

    <el-dialog
      v-model="isChangelogOpen"
      :title="copy.updateLogTitle"
      width="min(560px, calc(100vw - 32px))"
      class="changelog-dialog"
      append-to-body
    >
      <ol class="changelog-dialog-list" :class="{ 'is-full': isFullChangelog }">
        <li v-for="entry in visibleUpdateLogEntries" :key="`${entry.date}-${entry.text}`">
          <time :datetime="entry.date">{{ entry.date }}</time>
          <p>{{ entry.text }}</p>
        </li>
      </ol>
      <template #footer>
        <button class="changelog-dialog-link" type="button" @click="isFullChangelog = !isFullChangelog">
          {{ isFullChangelog ? copy.updateLogShowRecent : copy.updateLogShowAll }}
        </button>
      </template>
    </el-dialog>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
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
const isChangelogOpen = ref(false)
const isFullChangelog = ref(false)
const visibleUpdateLogEntries = computed(() => {
  const entries = copy.value.updateLogEntries || []
  return isFullChangelog.value ? entries : entries.slice(0, 3)
})

function handleNav(routeName) {
  if (routeName !== 'library') {
    library.clearActiveRecord()
  }
}

function focusRecord(record) {
  library.focusRecord(record)
  router.push({ name: 'library' })
}

function openChangelog() {
  isFullChangelog.value = false
  isChangelogOpen.value = true
}
</script>
