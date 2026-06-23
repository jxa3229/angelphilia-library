<template>
  <section class="builder-panel">
    <div class="panel-title">
      <h3>{{ copy.sourceSummary }}</h3>
      <span>{{ copy.networkData }}</span>
    </div>

    <div class="source-list">
      <div v-for="row in rows" :key="row.key">
        <strong>{{ row.field }}</strong>
        <span>{{ row.source }}</span>
        <small>{{ row.tolerance }}</small>
      </div>
    </div>

    <div v-if="missingRows.length" class="missing-list">
      <h4>{{ copy.missingData }}</h4>
      <el-tag v-for="row in missingRows" :key="row.key" type="warning" effect="plain">
        {{ row.label }}
      </el-tag>
    </div>
  </section>
</template>

<script setup>
defineProps({
  rows: { type: Array, required: true },
  missingRows: { type: Array, required: true },
  copy: { type: Object, required: true }
})
</script>
