<template>
  <section class="builder-panel">
    <div class="panel-title">
      <h3>{{ copy.presetSelect }}</h3>
      <span>{{ currentCode }}</span>
    </div>
    <el-select :model-value="modelValue" class="full-control" @change="$emit('update:modelValue', $event)">
      <el-option
        v-for="preset in presets"
        :key="preset.id"
        :label="preset.label"
        :value="preset.id"
      >
        <span>{{ preset.label }}</span>
        <small v-if="descriptions[preset.id]">（{{ descriptions[preset.id] }}）</small>
      </el-option>
    </el-select>
    <p v-if="currentDescription" class="preset-note">{{ currentDescription }}</p>
  </section>
</template>

<script setup>
defineProps({
  presets: { type: Array, required: true },
  modelValue: { type: String, default: '' },
  currentCode: { type: String, required: true },
  currentDescription: { type: String, default: '' },
  descriptions: { type: Object, default: () => ({}) },
  copy: { type: Object, required: true }
})

defineEmits(['update:modelValue'])
</script>
