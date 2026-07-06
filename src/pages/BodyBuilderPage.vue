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

    <section class="builder-panel part-preview-panel">
      <div class="panel-title">
        <div>
          <span>{{ copy.partPreviewKicker }}</span>
          <h3>{{ copy.partPreviewHeading }}</h3>
        </div>
      </div>
      <p class="preset-note">{{ copy.partPreviewSubtitle }}</p>

      <div class="part-preview-toolbar" role="group" :aria-label="copy.partPreviewHeading">
        <el-button
          v-for="slot in previewSlots"
          :key="slot.key"
          :type="activePreviewSlot === slot.key ? 'primary' : 'default'"
          @click="selectPreviewSlot(slot.key)"
        >
          {{ slot.label }}
        </el-button>
      </div>

      <div class="part-preview-filter" role="group" :aria-label="copy.partPreviewModelFilter">
        <button
          type="button"
          class="preview-chip"
          :class="{ active: activePreviewType === 'all' }"
          @click="activePreviewType = 'all'"
        >
          {{ copy.allPreviewModels }}
        </button>
        <button
          v-for="type in previewModelTypes"
          :key="type"
          type="button"
          class="preview-chip"
          :class="{ active: activePreviewType === type }"
          @click="activePreviewType = type"
        >
          Type-{{ type }}
        </button>
      </div>

      <div v-if="previewSkinOptions.length" class="part-preview-filter" role="group" :aria-label="copy.partPreviewSkinFilter">
        <button
          type="button"
          class="preview-chip"
          :class="{ active: activePreviewSkin === 'all' }"
          @click="activePreviewSkin = 'all'"
        >
          {{ copy.allPreviewSkins }}
        </button>
        <button
          v-for="skin in previewSkinOptions"
          :key="skin"
          type="button"
          class="preview-chip skin-chip"
          :class="{ active: activePreviewSkin === skin }"
          @click="activePreviewSkin = skin"
        >
          {{ skinLabel(skin) }}
        </button>
      </div>

      <div v-if="filteredPreviewCards.length" class="part-preview-grid">
        <article v-for="item in filteredPreviewCards" :key="item.id" class="part-preview-card">
          <div class="part-preview-image">
            <el-image
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :preview-src-list="[item.imageUrl]"
              fit="contain"
              loading="lazy"
              :alt="item.title"
            >
              <template #error>
                <div class="part-preview-image-empty">{{ copy.noImage }}</div>
              </template>
            </el-image>
            <div v-else class="part-preview-image-empty">{{ copy.noImage }}</div>
          </div>
          <div class="part-preview-content">
            <div class="part-preview-card-head">
              <strong>Type-{{ item.type }}</strong>
              <span>{{ slotLabel(item.slot) }}</span>
            </div>
            <p class="part-preview-title">{{ item.title }}</p>
            <div class="part-preview-tags">
              <el-tag v-if="item.skin" size="small" effect="plain">{{ item.skin }}</el-tag>
              <el-tag v-if="item.finish" size="small" effect="plain">{{ item.finish }}</el-tag>
              <el-tag v-if="item.priceText" size="small" effect="plain">{{ item.priceText }}</el-tag>
            </div>
            <p v-if="measurementText(item)" class="part-preview-measurement">
              {{ measurementText(item) }}
            </p>
            <a v-if="item.sourceUrl" class="part-preview-source" :href="item.sourceUrl" target="_blank" rel="noreferrer">
              {{ copy.sourcePage }} · {{ item.source }}
            </a>
            <span v-else class="part-preview-source">{{ item.source }}</span>
            <div v-if="item.relatedRecords?.length" class="part-preview-related">
              <span class="part-preview-related-label">{{ copy.relatedArchiveRecords }}</span>
              <div class="part-preview-related-list">
                <a
                  v-for="record in item.relatedRecords"
                  :key="record.id"
                  class="part-preview-related-link"
                  :href="record.sourceUrl"
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ record.label }}
                </a>
                <span v-if="item.relatedTotal > item.relatedRecords.length" class="part-preview-related-more">
                  +{{ item.relatedTotal - item.relatedRecords.length }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <p v-else class="part-preview-empty">{{ copy.partPreviewEmpty }}</p>
    </section>

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
import bodyPartPreview from '../data/bodyPartPreview.json'
import headPartPreview from '../data/headPartPreview.json'
import headParts from '../data/headParts.json'
import realartParts from '../data/realartParts.json'
import realartArchive from '../data/realartArchive.json'
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
const activePreviewSlot = ref('head')
const activePreviewType = ref('all')
const activePreviewSkin = ref('all')
const selection = reactive(buildInitialSelection(bodyData))
const previewSkinOrder = ['Whity', 'Super Whitey', 'Tan']

const previewSlots = computed(() => [
  { key: 'head', label: copy.value.headPreviewTab },
  { key: 'upperTorso', label: copy.value.upperTorsoPreviewTab },
  { key: 'lowerTorso', label: copy.value.lowerTorsoPreviewTab },
  { key: 'thigh', label: copy.value.thighPreviewTab }
])

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
const headPreviewCards = computed(() => {
  const headByType = new Map(headParts.map((head) => [head.type, head]))
  return headPartPreview.map((preview) => {
    const head = headByType.get(preview.type) || {}
    return {
      id: preview.id,
      slot: 'head',
      type: preview.type,
      title: preview.title || `${head.label || `Type-${preview.type}`} ${copy.value.headModelRecord}`,
      skin: preview.skin,
      finish: preview.finish || head.revision || '',
      source: preview.source || copy.value.headData,
      measurements: head.measurements || {},
      eyeSizeOptions: head.eyeSizeOptions || [],
      eyeSizeStatus: head.eyeSizeStatus || '',
      sourceUrl: preview.sourceUrl || '',
      imageUrl: preview.imageUrl || ''
    }
  })
})
const basePreviewCards = computed(() => [...headPreviewCards.value, ...bodyPartPreview])
const archiveRecords = computed(() => {
  return [...records, ...realartArchive]
    .map((record, index) => toArchiveRecord(record, index))
    .filter((record) => record.sourceUrl)
})
const archiveReferenceCards = computed(() => {
  const cards = []
  const groups = new Map()

  basePreviewCards.value.forEach((item) => {
    const key = `${item.slot}|${item.type}`
    if (!groups.has(key)) {
      groups.set(key, {
        slot: item.slot,
        type: item.type,
        skins: new Set()
      })
    }
    groups.get(key).skins.add(normalizeSkin(item.skin))
  })

  groups.forEach((group) => {
    previewSkinOrder.forEach((skin) => {
      if (group.skins.has(skin)) return
      const record = archiveRecords.value.find((archiveRecord) => {
        return archiveRecord.skin === skin && archiveRecordMatchesPreview(archiveRecord, group)
      })
      if (!record) return

      cards.push({
        id: `archive-${group.slot}-${group.type}-${skin}-${record.id}`,
        slot: group.slot,
        type: group.type,
        title: `${copy.value.archiveReferenceTitle}：Type-${group.type} ${skinLabel(skin)} · ${record.label}`,
        skin,
        finish: copy.value.localArchiveReference,
        priceText: record.year || '',
        source: record.source,
        sourceUrl: record.sourceUrl,
        imageUrl: record.imageUrl,
        archiveRecordId: record.id,
        isArchiveReference: true
      })
    })
  })

  return cards
})
const previewCards = computed(() => {
  return [...basePreviewCards.value, ...archiveReferenceCards.value].map((item) => {
    const related = findRelatedArchiveRecords(item)
    return {
      ...item,
      relatedRecords: related.slice(0, 3),
      relatedTotal: related.length
    }
  })
})
const activePreviewCards = computed(() => previewCards.value.filter((item) => item.slot === activePreviewSlot.value))
const previewModelTypes = computed(() => {
  return [...new Set(activePreviewCards.value.map((item) => item.type))].sort((first, second) => {
    return typeSortValue(first) - typeSortValue(second)
  })
})
const previewSkinBaseCards = computed(() => {
  if (activePreviewType.value === 'all') return activePreviewCards.value
  return activePreviewCards.value.filter((item) => item.type === activePreviewType.value)
})
const previewSkinOptions = computed(() => {
  return [...new Set(previewSkinBaseCards.value.map((item) => item.skin).filter(Boolean))].sort(skinSortValue)
})
const filteredPreviewCards = computed(() => {
  if (activePreviewSkin.value === 'all') return previewSkinBaseCards.value
  return previewSkinBaseCards.value.filter((item) => item.skin === activePreviewSkin.value)
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

function selectPreviewSlot(slot) {
  activePreviewSlot.value = slot
  activePreviewType.value = 'all'
  activePreviewSkin.value = 'all'
}

watch([activePreviewSlot, activePreviewType], () => {
  activePreviewSkin.value = 'all'
})

function slotLabel(slot) {
  return previewSlots.value.find((item) => item.key === slot)?.label || slot
}

function skinLabel(skin) {
  return copy.value.skinToneLabels?.[skin] || skin
}

function measurementText(item) {
  if (item.slot === 'head') return headMeasurementText(item)

  const part = findPreviewMeasurementPart(item)
  if (!part?.measurements) return ''

  const values = Object.entries(part.measurements).map(([key, data]) => {
    const label = bodyData.measurementFields.find((field) => field.key === key)?.label || key
    return `${label} ${data.value}${data.unit || ''}`
  })
  return values.join(' · ')
}

function headMeasurementText(item) {
  const values = []
  const headMeasurement = item.measurements?.headCircumference
  if (headMeasurement) values.push(`${copy.value.headCircumference} ${headMeasurement.value}${headMeasurement.unit || 'cm'}`)

  const eyes = item.eyeSizeOptions || []
  if (eyes.length) {
    values.push(`${copy.value.eyeSizeOptions} ${eyes.map((eye) => eye.raw).join(' / ')}`)
  } else if (item.eyeSizeStatus === 'pending') {
    values.push(`${copy.value.eyeSizeOptions} ${copy.value.pending}`)
  }

  return values.join(' · ')
}

function findPreviewMeasurementPart(item) {
  const exact = bodyData.parts.find((bodyPart) => bodyPart.category === item.slot && bodyPart.type === item.type)
  if (exact) return exact

  const normalizedType = normalizedPreviewType(item.type)
  return bodyData.parts.find((bodyPart) => bodyPart.category === item.slot && bodyPart.type === normalizedType)
}

function normalizedPreviewType(type) {
  if (type === 'H3.2') return 'H3'
  if (type === 'C3') return 'C'
  if (type === 'H2') return 'H'
  return type
}

function toArchiveRecord(record, index) {
  const number = record.number && record.number !== '未记' ? record.number : ''
  const name = record.name || record.title || copy.value.unknown
  const label = [number, name].filter(Boolean).join(' ') || name
  const sourceId = record.detailKey || record.externalProductId || record.folder || record.sourceUrl || index

  return {
    id: `${record.source || 'archive'}-${sourceId}-${index}`,
    label,
    number,
    name,
    year: record.year || '',
    source: record.source || copy.value.recordFile,
    sourceUrl: record.sourceUrl || '',
    imageUrl: record.safeImageUrl || record.imageUrl || '',
    skin: normalizeSkin(record.skin),
    headType: normalizeRecordType(record.headType),
    parts: {
      upperTorso: normalizeRecordType(record.bodyComposition?.upperTorso?.type),
      lowerTorso: normalizeRecordType(record.bodyComposition?.lowerTorso?.type),
      thigh: normalizeRecordType(record.bodyComposition?.thigh?.type)
    }
  }
}

function findRelatedArchiveRecords(item) {
  const itemSkin = normalizeSkin(item.skin)
  return archiveRecords.value
    .filter((record) => {
      if (item.archiveRecordId && record.id === item.archiveRecordId) return false
      if (itemSkin && record.skin && record.skin !== itemSkin) return false
      return archiveRecordMatchesPreview(record, item)
    })
    .slice()
    .sort(archiveRecordSort)
}

function archiveRecordMatchesPreview(record, item) {
  const previewType = normalizeRecordType(item.type)
  if (!previewType) return false
  if (item.slot === 'head') return record.headType === previewType
  return record.parts?.[item.slot] === previewType
}

function archiveRecordSort(first, second) {
  const firstNumber = numericRecordNumber(first.number)
  const secondNumber = numericRecordNumber(second.number)
  if (firstNumber !== secondNumber) return firstNumber - secondNumber
  return String(first.year || '').localeCompare(String(second.year || '')) || first.label.localeCompare(second.label)
}

function numericRecordNumber(number) {
  const numeric = Number(String(number || '').match(/\d+/)?.[0] || 9999)
  return Number.isFinite(numeric) ? numeric : 9999
}

function normalizeRecordType(type) {
  if (!type) return ''
  return normalizedPreviewType(String(type).trim().toUpperCase())
}

function normalizeSkin(skin) {
  const value = String(skin || '').trim().toLowerCase()
  if (!value) return ''
  if (value.includes('super') || value.includes('スーパー') || value.includes('超')) return 'Super Whitey'
  if (value.includes('tan') || value.includes('褐')) return 'Tan'
  if (value.includes('whity') || value.includes('whitey') || value.includes('ホワイティ') || value.includes('白')) return 'Whity'
  return skin
}

function typeSortValue(type) {
  const [, letter = '', number = '0', decimal = '0'] = String(type).match(/^([A-Z]+)(\d*)(?:\.(\d+))?$/) || []
  return (letter.charCodeAt(0) || 0) * 100 + Number(number || 0) * 10 + Number(decimal || 0)
}

function skinSortValue(first, second) {
  const firstIndex = previewSkinOrder.includes(first) ? previewSkinOrder.indexOf(first) : previewSkinOrder.length
  const secondIndex = previewSkinOrder.includes(second) ? previewSkinOrder.indexOf(second) : previewSkinOrder.length
  return firstIndex - secondIndex || String(first).localeCompare(String(second))
}

function matchesCurrentBody(item) {
  if (item.bodyCode) return item.bodyCode === bodyCode.value

  const itemTypes = Array.isArray(item.bodyTypes) ? item.bodyTypes : []
  const [upperType, lowerType, thighType] = selectedCoreTypes.value
  if (!upperType || !itemTypes.includes(upperType)) return false
  return itemTypes.includes(lowerType) || itemTypes.includes(thighType)
}
</script>
