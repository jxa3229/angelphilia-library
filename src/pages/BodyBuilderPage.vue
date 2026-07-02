<template>
  <section class="body-builder-page">
    <div class="builder-hero">
      <div>
        <span>{{ copy.partsAtelier }}</span>
        <h2>{{ copy.bodyBuilderHeading }}</h2>
        <p>{{ copy.bodyBuilderSubtitle }}</p>
      </div>
    </div>

    <div class="builder-layout builder-workspace">
      <div class="builder-column builder-measurements">
        <MeasurementSummary :rows="measurementRows" :copy="copy" />
        <PartsAtelier
          :parts="bodyData.parts"
          :selected-ids="selectedPartIds"
          :labels="categoryLabels"
          :copy="copy"
        />
      </div>

      <div class="builder-column builder-status">
        <BodyCodeCopy
          :code="bodyCode"
          :summary="copySummary"
          :copy="copy"
          :matching-body-exhibits="matchingBodyExhibits"
        />

        <BodyPresetSelector
          v-model="selectedPresetId"
          :presets="bodyData.presets"
          :current-code="bodyCode"
          :current-description="currentPresetDescription"
          :descriptions="presetDescriptions"
          :copy="copy"
        />

        <HeadPartSelector
          :head-parts="headParts"
          :selected-head-id="selection.head"
          :include-head-measurements="selection.includeHeadMeasurements"
          :copy="copy"
          @select-head="selectHead"
          @toggle-head-data="toggleHeadData"
        />
      </div>

      <div class="builder-column builder-controls">
        <BodyPartSelector
          :slots="partSlots"
          :parts-by-category="partsByCategory"
          :selection="selection"
          :initial-selection="bodyData.defaults.initialSelection"
          :copy="copy"
          @update="updateSelection"
        />
      </div>
    </div>

    <section class="builder-panel realart-parts-panel">
      <div class="panel-title">
        <div>
          <span>Real Art Project</span>
          <h3>{{ copy.realartPartsHeading }}</h3>
        </div>
        <el-button
          text
          type="primary"
          class="model-toggle"
          :icon="showAllModels ? ArrowUp : ArrowDown"
          @click="showAllModels = !showAllModels"
        >
          {{ showAllModels ? copy.hideAllModels : copy.showAllModels }}
        </el-button>
      </div>
      <p class="preset-note">{{ showAllModels ? copy.realartPartsSubtitle : copy.realartPartsCollapsed }}</p>

      <div v-show="showAllModels">
        <el-table :data="realartParts" stripe height="420" class="measurement-table parts-model-table">
          <el-table-column prop="id" label="ID" width="76" />
          <el-table-column prop="displayKindLabel" :label="copy.allOutfitCategories" width="140" />
          <el-table-column :label="copy.partModel" min-width="160">
            <template #default="{ row }">
              <el-tag v-if="row.displayKind === 'bodyExhibit' && row.bodyTypes?.length" size="small" effect="plain">
                {{ row.bodyTypes.join(' / ') }}
              </el-tag>
              <el-tag v-else-if="row.model" size="small" effect="plain">{{ row.model }}</el-tag>
              <span v-else>{{ copy.unknown }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" :label="copy.sourceItem" min-width="320" />
          <el-table-column prop="priceText" :label="copy.metadata" min-width="130" />
          <el-table-column min-width="120">
            <template #default="{ row }">
              <el-button link type="primary" tag="a" :href="row.sourceUrl" target="_blank" rel="noreferrer">
                {{ copy.sourcePage }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import bodyData from '../data/bodyParts.json'
import headParts from '../data/headParts.json'
import realartParts from '../data/realartParts.json'
import records from '../data/records.json'
import BodyCodeCopy from '../components/body-builder/BodyCodeCopy.vue'
import BodyPartSelector from '../components/body-builder/BodyPartSelector.vue'
import BodyPresetSelector from '../components/body-builder/BodyPresetSelector.vue'
import HeadPartSelector from '../components/body-builder/HeadPartSelector.vue'
import MeasurementSummary from '../components/body-builder/MeasurementSummary.vue'
import PartsAtelier from '../components/body-builder/PartsAtelier.vue'
import { usePreferencesStore } from '../stores/preferences'
import { buildInitialSelection, buildPresetDescriptions, generateBodyCode } from '../utils/bodyCode'
import { buildMeasurementCopyText, buildMeasurementSummary } from '../utils/measurements'

const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const selectedPresetId = ref(bodyData.presets[0]?.id || '')
const showAllModels = ref(false)
const selection = reactive(buildInitialSelection(bodyData))

const partSlots = [
  { key: 'upperTorso', label: '胸 / Upper torso' },
  { key: 'lowerTorso', label: '腰臀 / Lower torso' },
  { key: 'thigh', label: '大腿 / Thigh' },
  { key: 'shin', label: '小腿 / Shin' },
  { key: 'upperArm', label: '上臂 / Upper arm' },
  { key: 'forearm', label: '下臂 / Forearm' },
  { key: 'hand', label: '手 / Hand' },
  { key: 'foot', label: '脚 / Foot' }
]

const categoryLabels = {
  frame: 'Frame',
  upperTorso: '胸',
  lowerTorso: '腰臀',
  thigh: '大腿',
  shin: '小腿',
  upperArm: '上臂',
  forearm: '下臂',
  hand: '手',
  foot: '脚'
}

const partsByCategory = computed(() => {
  return bodyData.parts.reduce((groups, part) => {
    if (!groups[part.category]) groups[part.category] = []
    groups[part.category].push(part)
    return groups
  }, {})
})

const selectedHead = computed(() => headParts.find((head) => head.id === selection.head) || null)
const bodyCode = computed(() => generateBodyCode(selection, bodyData.parts))
const selectedCoreTypes = computed(() => {
  return ['upperTorso', 'lowerTorso', 'thigh'].map((category) => {
    return bodyData.parts.find((part) => part.id === selection[category])?.type || ''
  })
})
const bodyExhibits = computed(() => realartParts.filter((item) => item.displayKind === 'bodyExhibit'))
const matchingBodyExhibits = computed(() => bodyExhibits.value.filter((item) => matchesCurrentBody(item)))
const selectedPartIds = computed(() => {
  return Object.entries(selection)
    .filter(([key, value]) => key !== 'head' && key !== 'includeHeadMeasurements' && value)
    .map(([, value]) => value)
})
const measurementRows = computed(() => buildMeasurementSummary({
  selection,
  parts: bodyData.parts,
  measurementFields: bodyData.measurementFields,
  head: selectedHead.value,
  includeHeadMeasurements: selection.includeHeadMeasurements
}))
const copySummary = computed(() => buildMeasurementCopyText({
  rows: measurementRows.value,
  head: selectedHead.value,
  includeHeadMeasurements: selection.includeHeadMeasurements
}))
const presetDescriptions = computed(() => buildPresetDescriptions(bodyData.presets, records))
const currentPresetDescription = computed(() => {
  const preset = bodyData.presets.find((item) => item.id === selectedPresetId.value)
  return preset ? presetDescriptions.value[preset.id] || '' : ''
})

watch(selectedPresetId, (presetId) => {
  const preset = bodyData.presets.find((item) => item.id === presetId)
  if (!preset) return
  Object.assign(selection, buildInitialSelection(bodyData), preset.parts)
})

function updateSelection({ slot, value }) {
  selection[slot] = value
}

function selectHead(headId) {
  selection.head = headId
  if (!headId) selection.includeHeadMeasurements = false
}

function toggleHeadData(value) {
  selection.includeHeadMeasurements = Boolean(value && selection.head)
}

function matchesCurrentBody(item) {
  if (item.bodyCode) return item.bodyCode === bodyCode.value

  const itemTypes = Array.isArray(item.bodyTypes) ? item.bodyTypes : []
  const [upperType, lowerType, thighType] = selectedCoreTypes.value
  if (!upperType || !itemTypes.includes(upperType)) return false
  return itemTypes.includes(lowerType) || itemTypes.includes(thighType)
}
</script>
