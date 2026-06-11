<template>
  <div class="segmented" aria-label="Language">
    <button
      v-for="item in preferences.languages"
      :key="item.value"
      type="button"
      :class="{ active: preferences.lang === item.value }"
      @click="preferences.lang = item.value"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup>
import { usePreferencesStore } from '../../stores/preferences'

const preferences = usePreferencesStore()
</script>
