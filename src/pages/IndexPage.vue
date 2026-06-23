<template>
  <section class="index-section">
    <div class="section-head">
      <div>
        <h2>{{ copy.fullIndexHeading }}</h2>
        <p>{{ copy.indexSubtitle }}</p>
      </div>
    </div>

    <el-table :data="filteredRecords" stripe height="560" class="index-table">
      <el-table-column prop="year" :label="copy.tableYear" width="88" sortable />
      <el-table-column prop="group" :label="copy.tableGroup" min-width="140" />
      <el-table-column prop="number" :label="copy.tableNumber" width="96" />
      <el-table-column :label="copy.tableName" min-width="180">
        <template #default="{ row }">
          <el-button link type="primary" @click="openRecord(row)">{{ row.name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="variant" :label="copy.tableVariant" min-width="170" />
      <el-table-column prop="head" :label="copy.tableHead" min-width="140" />
      <el-table-column prop="body" :label="copy.tableBody" min-width="170" />
      <el-table-column prop="skin" :label="copy.tableSkin" min-width="150" />
      <el-table-column :label="copy.tableFolder" min-width="140">
        <template #default="{ row }">
          <button class="plain-link" type="button" @click="openRecord(row)">{{ row.detailKey || row.folder }}</button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLibraryStore } from '../stores/library'
import { usePreferencesStore } from '../stores/preferences'

const router = useRouter()
const library = useLibraryStore()
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const filteredRecords = computed(() => library.filteredRecords(copy.value.unknown))

defineProps({
  mainPanel: {
    type: Object,
    default: null
  }
})

async function openRecord(record) {
  await router.push({ name: 'library' })
  library.openRecord(record, 0)
}
</script>
