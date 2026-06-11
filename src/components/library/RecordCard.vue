<template>
  <article class="record-card">
    <button type="button" class="image-button" @click="$emit('open', record)">
      <img
        v-if="cover"
        :src="assetUrl(cover)"
        :alt="record.name"
        loading="lazy"
      />
      <span v-else>{{ copy.noImage }}</span>
    </button>

    <div class="record-body">
      <div class="record-meta">
        <span>{{ record.year }}</span>
        <span>{{ record.group }}</span>
      </div>
      <h3>
        <button type="button" @click="$emit('open', record)">{{ record.name }}</button>
      </h3>
      <p>{{ record.title }}</p>

      <div class="tags">
        <el-tag size="small" effect="plain">{{ record.series || copy.unknown }}</el-tag>
        <el-tag size="small" type="info" effect="plain">{{ record.skin || copy.unknown }}</el-tag>
      </div>

      <dl class="compact-fields">
        <div><dt>{{ copy.tableNumber }}</dt><dd>{{ record.number || copy.unknown }}</dd></div>
        <div><dt>{{ copy.tableHead }}</dt><dd>{{ record.head || copy.unknown }}</dd></div>
        <div><dt>{{ copy.tableBody }}</dt><dd>{{ record.body || copy.unknown }}</dd></div>
      </dl>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { assetUrl } from '../../utils/assetUrl'
import { usePreferencesStore } from '../../stores/preferences'

defineEmits(['open'])

const props = defineProps({
  record: {
    type: Object,
    required: true
  }
})

const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
const cover = computed(() => {
  const images = Array.isArray(props.record.safeImages) && props.record.safeImages.length
    ? props.record.safeImages
    : [props.record.safeImageUrl || props.record.imageUrl].filter(Boolean)
  return images[0] || ''
})
</script>
