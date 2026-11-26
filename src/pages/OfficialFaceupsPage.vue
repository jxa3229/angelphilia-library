<template>
  <section class="faceups" aria-labelledby="faceups-title">
    <header class="faceups-heading">
      <h1 id="faceups-title">{{ preferences.copy.navOfficialFaceups }}</h1>
      <p>{{ copy.intro }}</p>
    </header>

    <ul class="faceups-grid">
      <li v-for="photo in photos" :key="photo.file">
        <button class="faceup-card" type="button" @click="selected = photo">
          <span ref="photoSlots" class="faceup-photo" :data-file="photo.file">
            <img
              v-if="requestedThumbnails.has(photo.file)"
              :src="assetUrl(`${folder}/thumbnails/${photo.file}.webp`)"
              :width="photo.width"
              :height="photo.height"
              alt=""
              decoding="async"
            />
          </span>
          <span class="faceup-caption">
            <span class="faceup-name">{{ photo.name }}</span>
            <span class="faceup-credit">{{ copy.credit }}{{ photographer }}</span>
          </span>
        </button>
      </li>
    </ul>

    <ElImageViewer
      v-if="selected"
      :url-list="[assetUrl(`${folder}/${selected.file}`)]"
      teleported
      @close="selected = null"
    >
      <div class="faceup-download">
        <button type="button" :disabled="downloading" @click="downloadPhoto(selected)">
          {{ downloading ? copy.preparing : copy.download }}
        </button>
        <p v-if="downloadFailed" role="alert">{{ copy.downloadFailed }}</p>
      </div>
    </ElImageViewer>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { ElImageViewer } from 'element-plus/es/components/image-viewer/index.mjs'
import photos from '../data/officialFaceups.json'
import { usePreferencesStore } from '../stores/preferences'
import { assetUrl } from '../utils/assetUrl'

const folder = 'images/official-faceups'
const photographer = '神秘的花开花落'
const photoSlots = useTemplateRef('photoSlots')
const requestedThumbnails = ref(new Set())
let thumbnailObserver
const preferences = usePreferencesStore()
const selected = ref(null)
const downloading = ref(false)
const downloadFailed = ref(false)
const instructions = {
  zh: {
    intro: '点选照片查看高清原图。', credit: '图源：',
    download: '下载带水印图片', preparing: '正在生成…', downloadFailed: '下载失败，请重试。'
  },
  en: {
    intro: 'Select a photo to view it at full resolution.', credit: 'Photo source: ',
    download: 'Download with watermark', preparing: 'Preparing…', downloadFailed: 'Download failed. Please try again.'
  },
  ja: {
    intro: '写真を選ぶと高解像度の画像を表示します。', credit: '写真提供：',
    download: '透かし入りで保存', preparing: '生成中…', downloadFailed: '保存できませんでした。もう一度お試しください。'
  }
}
const copy = computed(() => instructions[preferences.lang] || instructions.zh)

onMounted(() => {
  if (!window.IntersectionObserver) {
    requestedThumbnails.value = new Set(photos.map(photo => photo.file))
    return
  }

  thumbnailObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      requestedThumbnails.value.add(entry.target.dataset.file)
      observer.unobserve(entry.target)
    }
  }, { rootMargin: '200px 0px' })

  for (const slot of photoSlots.value) thumbnailObserver.observe(slot)
})

onBeforeUnmount(() => thumbnailObserver?.disconnect())

async function downloadPhoto(photo) {
  downloading.value = true
  downloadFailed.value = false
  try {
    const image = new Image()
    image.src = assetUrl(`${folder}/${photo.file}`)
    await image.decode()

    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)

    const shortEdge = Math.min(canvas.width, canvas.height)
    const inset = Math.round(shortEdge * 0.025)
    context.font = `500 ${Math.max(12, Math.round(shortEdge * 0.032))}px system-ui, sans-serif`
    context.textAlign = 'right'
    context.textBaseline = 'bottom'
    context.lineJoin = 'round'
    context.lineWidth = Math.max(1, shortEdge * 0.0025)
    context.strokeStyle = 'rgba(0, 0, 0, 0.45)'
    context.fillStyle = 'rgba(255, 255, 255, 0.7)'
    const watermark = `图源：${photographer}`
    const x = canvas.width - inset
    const y = canvas.height - inset
    const maxWidth = canvas.width - 2 * inset
    context.strokeText(watermark, x, y, maxWidth)
    context.fillText(watermark, x, y, maxWidth)

    const format = photo.file.endsWith('.png') ? 'image/png' : 'image/jpeg'
    const blob = await new Promise(resolve => canvas.toBlob(resolve, format, 0.95))
    if (!blob) throw new Error('Image export failed')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = photo.file
    link.click()
    const url = link.href
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch {
    downloadFailed.value = true
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.faceups {
  max-width: 1400px;
  margin-inline: auto;
}

.faceups-heading {
  margin-bottom: 24px;
  padding: 12px 0 18px;
  border-bottom: 1px solid var(--line);
}

.faceups-heading h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 48px);
}

.faceups-heading p {
  margin: 8px 0 0;
  color: var(--muted);
}

.faceups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 168px), 1fr));
  gap: clamp(10px, 2vw, 20px);
  padding: 0;
  margin: 0;
  list-style: none;
}

.faceup-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  font: inherit;
  text-align: start;
  cursor: zoom-in;
}

.faceup-card:hover,
.faceup-card:focus-visible {
  border-color: var(--primary);
}

.faceup-card:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

.faceup-photo {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #171514;
}

.faceup-photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.faceup-caption {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  overflow-wrap: anywhere;
}

.faceup-name {
  font-weight: 600;
}

.faceup-credit {
  color: var(--muted);
  font-size: 0.75rem;
}

.faceup-download {
  position: absolute;
  top: 24px;
  left: 24px;
  padding: 4px;
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
}

.faceup-download button {
  min-height: 36px;
  padding: 6px 10px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.faceup-download button:hover {
  background: var(--primary-soft);
}

.faceup-download p {
  margin: 4px 10px;
  font-size: 0.875rem;
}

@media (max-width: 520px) {
  .faceups-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
