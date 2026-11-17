<template>
  <article class="part-card" :class="{ active: selected }">
    <div><strong>{{ part.label }}</strong><span>{{ categoryLabel }}</span></div>
    <el-tag v-if="part.isDefault" size="small" effect="plain">{{ copy.defaultObitsu }}</el-tag>
    <el-tag v-else-if="selected" size="small" type="success">{{ copy.current }}</el-tag>
    <p>{{ measurements }}</p>
  </article>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  part: { type: Object, required: true }, selected: { type: Boolean, default: false },
  categoryLabel: { type: String, default: '' }, copy: { type: Object, required: true }
})
const measurements = computed(() => {
  const values = Object.values(props.part.measurements || {})
    .filter((item) => typeof item.value === 'number')
    .map((item) => `${item.value}${item.unit || 'cm'}`)
  return values.length ? values.join(' / ') : props.copy.pending
})
</script>
