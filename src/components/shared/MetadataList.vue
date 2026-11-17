<template>
  <dl class="metadata-list">
    <div v-for="field in fields" :key="field.key || field.label">
      <dt>{{ field.label }}</dt>
      <dd>
        <a v-if="field.href" :href="field.href" target="_blank" rel="noopener noreferrer">{{ field.value || field.href }}</a>
        <template v-else>{{ field.value || copy.unknown }}</template>
      </dd>
    </div>
  </dl>
</template>

<script setup>
import { computed } from 'vue'
import { usePreferencesStore } from '../../stores/preferences'
defineProps({ fields: { type: Array, required: true } })
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
</script>

<style scoped>
.metadata-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 24px; margin: 0; }
.metadata-list > div { display: grid; align-content: start; gap: 5px; min-width: 0; }
dd { margin: 0; overflow-wrap: anywhere; }
a { color: var(--primary); }
@media (max-width: 720px) { .metadata-list { grid-template-columns: minmax(0, 1fr); } }
</style>
