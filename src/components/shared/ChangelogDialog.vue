<template>
  <el-dialog
    v-model="changelog.isOpen"
    :title="copy.updateLogTitle"
    width="min(560px, calc(100vw - 32px))"
    class="changelog-dialog"
    append-to-body
  >
    <ol class="changelog-dialog-list" :class="{ 'is-full': isFullChangelog }">
      <li v-for="entry in visibleEntries" :key="`${entry.date}-${entry.text}`">
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
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useChangelogStore } from '../../stores/changelog'
import { usePreferencesStore } from '../../stores/preferences'

const changelog = useChangelogStore()
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const isFullChangelog = ref(false)
const visibleEntries = computed(() => isFullChangelog.value ? changelog.entries : changelog.entries.slice(0, 3))

watch(() => changelog.isOpen, (isOpen) => {
  if (isOpen) isFullChangelog.value = false
})
</script>
