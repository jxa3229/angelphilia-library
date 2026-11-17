<template>
  <div class="filters">
    <el-input
      v-model="library.query"
      :prefix-icon="Search"
      clearable
      :placeholder="copy.searchPlaceholder"
    />
    <el-select v-model="library.selectedGroup" :placeholder="copy.allGroups">
      <el-option :label="copy.allGroups" value="" />
      <el-option v-for="item in library.groups" :key="item" :label="item" :value="item" />
    </el-select>
    <el-select v-model="library.selectedYear" :placeholder="copy.allYears">
      <el-option :label="copy.allYears" value="" />
      <el-option v-for="item in library.years" :key="item" :label="item" :value="item" />
    </el-select>
    <el-select v-model="library.selectedSource" :placeholder="copy.allSources">
      <el-option :label="copy.allSources" value="" />
      <el-option v-for="item in sources" :key="item" :label="item" :value="item" />
    </el-select>
    <el-select v-model="library.selectedHeadType" clearable :aria-label="copy.tableHeadType" :placeholder="copy.allHeadTypes">
      <el-option :label="copy.allHeadTypes" value="" />
      <el-option v-for="item in library.headTypes" :key="item" :label="item === unknownFilterValue ? copy.unknown : item" :value="item" />
    </el-select>
    <el-select v-model="library.selectedSkinTone" clearable :aria-label="copy.tableSkin" :placeholder="copy.allPreviewSkins">
      <el-option :label="copy.allPreviewSkins" value="" />
      <el-option v-for="item in library.skinTones" :key="item" :label="skinLabel(item)" :value="item" />
    </el-select>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useLibraryStore } from '../../stores/library'
import { usePreferencesStore } from '../../stores/preferences'
import { unknownFilterValue } from '../../utils/libraryFilters'

const library = useLibraryStore()
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const sources = computed(() => library.sources(copy.value.unknown))

function skinLabel(value) {
  if (value === unknownFilterValue) return copy.value.unknown
  return copy.value.skinToneLabels[value] || value
}
</script>

<style scoped>
.filters { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.filters > * { min-width: 0; }
@media (max-width: 1280px) { .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .filters { grid-template-columns: minmax(0, 1fr); } }
</style>
