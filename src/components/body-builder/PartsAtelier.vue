<template>
  <section class="builder-panel atelier-panel">
    <div class="panel-title">
      <h3>{{ copy.partsAtelier }}</h3>
      <div class="panel-actions">
        <span>{{ parts.length }}</span>
        <el-button
          text
          type="primary"
          class="model-toggle"
          :icon="showParts ? ArrowUp : ArrowDown"
          @click="showParts = !showParts"
        >
          {{ showParts ? copy.hidePartsAtelier : copy.showPartsAtelier }}
        </el-button>
      </div>
    </div>

    <p v-if="!showParts" class="preset-note">{{ copy.partsAtelierCollapsed }}</p>

    <div v-show="showParts" class="atelier-grid">
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
import { ref } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

defineProps({
  parts: { type: Array, required: true },
  selectedIds: { type: Array, required: true },
  labels: { type: Object, required: true },
  copy: { type: Object, required: true }
})

const showParts = ref(false)

function measurementText(part) {
  const values = Object.values(part.measurements || {})
    .filter((item) => typeof item.value === 'number')
    .map((item) => `${item.value}${item.unit || 'cm'}`)
  return values.length ? values.join(' / ') : '待补充'
}
</script>
