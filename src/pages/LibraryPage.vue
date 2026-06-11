<template>
  <section class="library-section">
    <div class="section-head">
      <div>
        <h2>{{ copy.libraryHeading }}</h2>
        <p>{{ library.resultText(copy) }}</p>
      </div>
      <el-button :icon="Refresh" @click="library.resetFilters">{{ copy.reset }}</el-button>
    </div>

    <RecordDetail
      v-if="library.activeRecord"
      :record="library.activeRecord"
      @close="closeRecord"
    />

    <template v-else>
      <LibraryFilters />
      <el-empty v-if="filteredRecords.length === 0" :description="copy.empty" />

      <div v-else class="card-grid">
        <RecordCard
          v-for="record in filteredRecords"
          :key="record.folder"
          :record="record"
          @open="openRecord"
        />
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, nextTick } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import LibraryFilters from '../components/library/LibraryFilters.vue'
import RecordCard from '../components/library/RecordCard.vue'
import RecordDetail from '../components/library/RecordDetail.vue'
import { useLibraryStore } from '../stores/library'
import { usePreferencesStore } from '../stores/preferences'

const props = defineProps({
  mainPanel: {
    type: Object,
    default: null
  }
})

const library = useLibraryStore()
const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const filteredRecords = computed(() => library.filteredRecords(copy.value.unknown))

function openRecord(record) {
  library.openRecord(record, props.mainPanel?.scrollTop || 0)
  nextTick(() => {
    if (props.mainPanel) props.mainPanel.scrollTop = 0
  })
}

function closeRecord() {
  const scrollTop = library.closeRecord()
  nextTick(() => {
    if (props.mainPanel) props.mainPanel.scrollTop = scrollTop
  })
}
</script>
