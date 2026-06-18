<template>
  <section class="builder-panel">
    <div class="panel-title">
      <h3>{{ copy.measurementSummary }}</h3>
      <span>cm</span>
    </div>

    <el-table :data="rows" stripe class="measurement-table">
      <el-table-column prop="label" label="项目" min-width="130" />
      <el-table-column prop="displayValue" label="尺寸" width="110" />
      <el-table-column prop="partLabel" label="配件" min-width="180">
        <template #default="{ row }">
          <span>{{ row.partLabel }}</span>
          <el-tag v-if="row.isDefault" size="small" effect="plain">{{ copy.defaultObitsu }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="tolerance" label="备注" min-width="130" />
    </el-table>
  </section>
</template>

<script setup>
defineProps({
  rows: { type: Array, required: true },
  copy: { type: Object, required: true }
})
</script>
