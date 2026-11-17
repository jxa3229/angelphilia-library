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
      <PartMeasurementCard
        v-for="part in parts"
        :key="part.id"
        :part="part" :selected="selectedIds.includes(part.id)" :category-label="labels[part.category] || part.category" :copy="copy"
      />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import PartMeasurementCard from './PartMeasurementCard.vue'

defineProps({
  parts: { type: Array, required: true },
  selectedIds: { type: Array, required: true },
  labels: { type: Object, required: true },
  copy: { type: Object, required: true }
})

const showParts = ref(false)

</script>
