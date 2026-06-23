<template>
  <section class="builder-panel">
    <div class="panel-title">
      <h3>{{ copy.partsAtelier }}</h3>
      <span>{{ parts.length }}</span>
    </div>

    <div class="atelier-grid">
      <article
        v-for="part in parts"
        :key="part.id"
        class="part-card"
        :class="{ active: selectedIds.includes(part.id) }"
      >
        <div>
          <strong>{{ part.label }}</strong>
          <span>{{ labels[part.category] || part.category }}</span>
        </div>
        <el-tag v-if="part.isDefault" size="small" effect="plain">{{ copy.defaultObitsu }}</el-tag>
        <el-tag v-else-if="selectedIds.includes(part.id)" size="small" type="success">{{ copy.current }}</el-tag>
        <p>{{ measurementText(part) }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  parts: { type: Array, required: true },
  selectedIds: { type: Array, required: true },
  labels: { type: Object, required: true },
  copy: { type: Object, required: true }
})

function measurementText(part) {
  const values = Object.values(part.measurements || {})
    .filter((item) => typeof item.value === 'number')
    .map((item) => `${item.value}${item.unit || 'cm'}`)
  return values.length ? values.join(' / ') : '待补充'
}
</script>
