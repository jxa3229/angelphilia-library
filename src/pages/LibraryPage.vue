<template>
  <section class="library-section">
    <div class="section-head">
      <div>
        <h2>{{ copy.libraryHeading }}</h2>
        <p>{{ library.resultText(copy) }}</p>
      </div>
      <el-button :icon="Refresh" @click="library.resetFilters">{{ copy.reset }}</el-button>
    </div>

    <DollRoster v-show="!activeRecord && !invalidRecord" :records="library.allRecords" @open="openRecord" />

    <RecordDetail
      v-if="activeRecord"
      :record="activeRecord"
      :back-label="backLabel"
      @close="returnToSource"
    />

    <div v-else-if="invalidRecord" role="alert">
      <el-empty :description="copy.recordNotFound" />
      <el-button @click="returnToSource">{{ backLabel }}</el-button>
    </div>
    <template v-else>
      <LibraryFilters />
      <el-empty v-if="filteredRecords.length === 0" :description="copy.empty" />

      <div v-else class="card-grid">
        <RecordCard
          v-for="(record, index) in visibleRecords"
          :key="record.folder"
          :record="record"
          :priority="index < 4"
          @open="openRecord"
        />
      </div>
      <div v-if="filteredRecords.length" class="library-load-more">
        <p aria-live="polite">{{ copy.libraryVisibleCount.replace('{shown}', visibleRecords.length).replace('{total}', filteredRecords.length) }}</p>
        <el-button v-if="visibleRecords.length < filteredRecords.length" @click="visibleCount += batchSize">{{ copy.loadMoreRecords }}</el-button>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'
import LibraryFilters from '../components/library/LibraryFilters.vue'
import RecordCard from '../components/library/RecordCard.vue'
import RecordDetail from '../components/library/RecordDetail.vue'
import DollRoster from '../components/library/DollRoster.vue'
import { useLibraryStore } from '../stores/library'
import { usePreferencesStore } from '../stores/preferences'
import { useRecordRoute } from '../composables/useRecordRoute'

const props = defineProps({
  mainPanel: {
    type: Object,
    default: null
  }
})

const library = useLibraryStore()
const preferences = usePreferencesStore()
const route = useRoute()
const router = useRouter()
const copy = computed(() => preferences.copy)
const fromFaceups = computed(() => route.query.from === 'official-faceups')
const backLabel = computed(() => fromFaceups.value ? copy.value.backToOfficialFaceups : copy.value.backToLibrary)
const filteredRecords = computed(() => library.filteredRecords(copy.value.unknown))
const batchSize = 24
const visibleCount = ref(batchSize)
const visibleRecords = computed(() => filteredRecords.value.slice(0, visibleCount.value))
const { activeRecord, invalidRecord, openRecord, closeRecord } = useRecordRoute({
  records: computed(() => library.allRecords),
  mainPanel: () => props.mainPanel,
  onOpen: (record) => library.openRecord(record),
  onClose: () => library.clearActiveRecord()
})

function returnToSource() {
  if (!fromFaceups.value) return closeRecord()
  const previousPath = router.options.history.state.back
  if (typeof previousPath === 'string' && router.resolve(previousPath).name === 'official-faceups') {
    return router.back()
  }
  return router.replace({ name: 'official-faceups' })
}

watch(() => [library.query, library.selectedGroup, library.selectedYear, library.selectedSource, library.selectedHeadType, library.selectedSkinTone], () => { visibleCount.value = batchSize })

</script>

<style scoped>
.library-load-more { display: grid; justify-items: center; gap: 8px; padding: 24px 0; color: var(--muted); font-size: 14px; }
.library-load-more p { margin: 0; }
.library-load-more .el-button { min-height: 44px; }
</style>
