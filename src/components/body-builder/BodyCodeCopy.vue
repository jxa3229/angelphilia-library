<template>
  <section class="builder-panel code-panel">
    <div class="code-panel-row">
      <div class="code-panel-main">
        <span>{{ copy.bodyCode }}</span>
        <strong class="body-code-value">{{ code }}</strong>
      </div>
      <div v-if="matchingBodyExhibits.length" class="code-panel-exhibits">
        <span class="code-panel-exhibits-label">{{ copy.currentBodyExhibitsHeading }}</span>
        <div class="code-panel-exhibit-tags">
          <el-tag
            v-for="item in matchingBodyExhibits"
            :key="item.id"
            size="small"
            effect="plain"
            class="code-panel-exhibit-tag"
          >
            #{{ item.id }} {{ item.bodyTypes.join(' / ') }}
          </el-tag>
        </div>
      </div>
    </div>
    <div class="code-panel-summary-row">
      <p class="copy-preview">{{ summary }}</p>
      <div v-if="matchingBodyExhibits.length" class="code-panel-preview-list">
        <article
          v-for="item in matchingBodyExhibits"
          :key="item.id"
          class="code-panel-preview-card"
        >
          <el-image
            v-if="imagePreviewList(item).length"
            :src="imagePreviewList(item)[0]"
            :preview-src-list="imagePreviewList(item)"
            fit="contain"
            preview-teleported
            class="code-panel-preview-image"
          />
          <div class="code-panel-preview-meta">
            <span>#{{ item.id }} {{ item.displayKindLabel }}</span>
            <p v-if="bodyCodeLabel(item)" class="code-panel-preview-model">
              {{ copy.partModel }}: {{ bodyCodeLabel(item) }}
            </p>
            <p v-if="item.model" class="code-panel-preview-source-model">{{ item.model }}</p>
            <a
              v-if="item.sourceUrl"
              class="code-panel-preview-title code-panel-preview-link"
              :href="item.sourceUrl"
              target="_blank"
              rel="noreferrer"
            >
              {{ item.title }}
            </a>
            <strong v-else class="code-panel-preview-title">{{ item.title }}</strong>
            <a
              v-if="item.sourceUrl"
              class="code-panel-source-link"
              :href="item.sourceUrl"
              target="_blank"
              rel="noreferrer"
            >
              {{ copy.sourcePage }}
            </a>
          </div>
        </article>
      </div>
    </div>
    <el-button type="primary" :icon="CopyDocument" @click="copySummary">{{ copy.copyData }}</el-button>
  </section>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import { assetUrl } from '../../utils/assetUrl'

const props = defineProps({
  code: { type: String, required: true },
  summary: { type: String, required: true },
  copy: { type: Object, required: true },
  matchingBodyExhibits: { type: Array, default: () => [] }
})

function imagePreviewList(item) {
  const images = Array.isArray(item.images) && item.images.length ? item.images : [item.imageUrl]
  return images.filter(Boolean).map((image) => assetUrl(image))
}

function bodyCodeLabel(item) {
  const composition = item.bodyComposition || {}
  const code = item.bodyCode || ''
  const parts = ['upperTorso', 'lowerTorso', 'thigh']
    .map((slot) => composition[slot]?.type)
    .filter(Boolean)

  if (!code && !parts.length) return ''
  if (!parts.length) return code
  return `${code} / ${parts.map((part) => `Type-${part}`).join(' + ')}`
}

async function copySummary() {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(props.summary)
  } else {
    const textarea = document.createElement('textarea')
    textarea.value = props.summary
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
  ElMessage.success(props.copy.copied)
}
</script>
