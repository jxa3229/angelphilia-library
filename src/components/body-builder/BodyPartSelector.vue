<template>
  <section class="builder-panel selector-panel">
    <div class="panel-title">
      <h3>{{ copy.selectedParts }}</h3>
    </div>

    <div class="part-selector-grid">
      <label v-for="slot in slots" :key="slot.key" class="part-control">
        <span>{{ slot.label }}</span>
        <el-select
          :model-value="selection[slot.key]"
          class="full-control"
          @change="updateSlot(slot.key, $event)"
        >
          <el-option
            v-for="part in partsByCategory[slot.key] || []"
            :key="part.id"
            :label="part.label"
            :value="part.id"
          >
            <span>{{ part.label }}</span>
            <small v-if="isCurrent(slot.key, part.id)">{{ copy.current }}</small>
          </el-option>
        </el-select>
      </label>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  slots: { type: Array, required: true },
  partsByCategory: { type: Object, required: true },
  selection: { type: Object, required: true },
  initialSelection: { type: Object, required: true },
  copy: { type: Object, required: true }
})

const emit = defineEmits(['update'])

function updateSlot(slot, value) {
  emit('update', { slot, value })
}

function isCurrent(slot, value) {
  return props.initialSelection[slot] === value
}
</script>
