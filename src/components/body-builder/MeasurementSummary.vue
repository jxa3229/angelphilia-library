<template>
  <section class="builder-panel measurement-panel">
    <div class="panel-title">
      <h3>{{ copy.measurementSummary }}</h3>
      <span>cm</span>
    </div>

    <el-table :data="rows" stripe class="measurement-table" table-layout="fixed">
      <el-table-column prop="label" label="项目" width="72" />
      <el-table-column prop="displayValue" label="尺寸" width="70" />
      <el-table-column prop="partLabel" label="配件" min-width="180" class-name="measurement-part-column">
        <template #default="{ row }">
          <span class="measurement-part-name">{{ row.partLabel }}</span>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup>
defineProps({
  rows: { type: Array, required: true },
  copy: { type: Object, required: true }
})
</script>
