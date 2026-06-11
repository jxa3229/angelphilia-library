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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useLibraryStore } from '../../stores/library'
import { usePreferencesStore } from '../../stores/preferences'

const library = useLibraryStore()
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const sources = computed(() => library.sources(copy.value.unknown))
</script>
