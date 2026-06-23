<template>
  <section class="builder-panel">
    <div class="panel-title">
      <h3>{{ copy.headData }}</h3>
      <el-switch
        :model-value="includeHeadMeasurements"
        :disabled="!selectedHeadId"
        :active-text="copy.insertHeadData"
        @change="$emit('toggle-head-data', $event)"
      />
    </div>

    <el-select
      :model-value="selectedHeadId"
      clearable
      class="full-control"
      :placeholder="copy.noHeadData"
      @change="$emit('select-head', $event || null)"
    >
      <el-option
        v-for="head in headParts"
        :key="head.id"
        :label="head.label"
        :value="head.id"
      />
    </el-select>

    <div v-if="selectedHead" class="head-facts">
      <span>Head {{ selectedHead.type }}</span>
      <span>{{ selectedHead.measurements.headCircumference.value }}cm</span>
      <span>{{ eyeText }}</span>
    </div>
    <el-empty v-else :description="copy.noHeadData" />
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  headParts: { type: Array, required: true },
  selectedHeadId: { type: String, default: null },
  includeHeadMeasurements: { type: Boolean, default: false },
  copy: { type: Object, required: true }
})

defineEmits(['select-head', 'toggle-head-data'])

const selectedHead = computed(() => props.headParts.find((head) => head.id === props.selectedHeadId))
const eyeText = computed(() => {
  const eyes = selectedHead.value?.eyeSizeOptions || []
  return eyes.length ? eyes.map((eye) => eye.raw).join(', ') : props.copy.pending
})
</script>
