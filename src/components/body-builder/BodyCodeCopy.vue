<template>
  <section class="builder-panel code-panel">
    <div>
      <span>{{ copy.bodyCode }}</span>
      <strong>{{ code }}</strong>
    </div>
    <p class="copy-preview">{{ summary }}</p>
    <el-button type="primary" :icon="CopyDocument" @click="copySummary">{{ copy.copyData }}</el-button>
  </section>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'

const props = defineProps({
  code: { type: String, required: true },
  summary: { type: String, required: true },
  copy: { type: Object, required: true }
})

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
