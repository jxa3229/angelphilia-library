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
        <CatalogCard v-for="item in filteredPreviewCards" :key="item.id" class="part-preview-card"
          :image="item.imageUrl" :year="item.year" :name="item.title" @open="openPreview(item)" />
      </div>

      <p v-else class="part-preview-empty">{{ copy.partPreviewEmpty }}</p>
      <ProductDetailDrawer v-model="isPreviewOpen" :name="activePreview?.title || copy.partPreviewHeading"
        :images="activePreview?.imageUrl ? [activePreview.imageUrl] : []" :fields="previewFields">
        <div v-if="activePreview?.relatedRecords?.length" class="part-preview-related">
          <span class="part-preview-related-label">{{ copy.relatedArchiveRecords }}</span>
          <div class="part-preview-related-list">
            <a v-for="record in activePreview.relatedRecords" :key="record.id" class="part-preview-related-link"
              :href="record.sourceUrl" target="_blank" rel="noopener noreferrer">{{ record.label }}</a>
            <span v-if="activePreview.relatedTotal > activePreview.relatedRecords.length" class="part-preview-related-more">
              +{{ activePreview.relatedTotal - activePreview.relatedRecords.length }}
            </span>
          </div>
        </div>
      </ProductDetailDrawer>
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
import { computed, ref } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import bodyData from '../data/bodyParts.json'
import headParts from '../data/headParts.json'
import realartParts from '../data/realartParts.json'
import BodyCodeCopy from '../components/body-builder/BodyCodeCopy.vue'
import BodyPartSelector from '../components/body-builder/BodyPartSelector.vue'
import BodyPresetSelector from '../components/body-builder/BodyPresetSelector.vue'
import HeadPartSelector from '../components/body-builder/HeadPartSelector.vue'
import MeasurementSummary from '../components/body-builder/MeasurementSummary.vue'
import PartsAtelier from '../components/body-builder/PartsAtelier.vue'
import CatalogCard from '../components/shared/CatalogCard.vue'
import ProductDetailDrawer from '../components/shared/ProductDetailDrawer.vue'
import { usePreferencesStore } from '../stores/preferences'
import { useBodySelection } from '../composables/useBodySelection'
import { usePartPreview } from '../composables/usePartPreview'

const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const showAllModels = ref(false)
const {
  selectedPresetId, selection, partSlots, categoryLabels, partsByCategory, bodyCode,
  matchingBodyExhibits, selectedPartIds, measurementRows, copySummary, presetDescriptions,
  currentPresetDescription, updateSelection, selectHead, toggleHeadData
} = useBodySelection()
const {
  activePreviewSlot, activePreviewType, activePreviewSkin, activePreview, isPreviewOpen,
  previewFields, previewSlots, previewModelTypes, previewSkinOptions,
  filteredPreviewCards, openPreview, selectPreviewSlot, skinLabel
} = usePartPreview(copy)
</script>
