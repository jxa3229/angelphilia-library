<template>
  <el-config-provider>
    <div class="app-shell" :data-theme="preferences.theme">
      <SideNav />

      <main ref="mainPanelRef" class="main-panel" :class="`route-${routeName}`">
        <RouterView v-slot="{ Component }">
          <component :is="Component" :main-panel="mainPanelRef" />
        </RouterView>
        <footer>{{ preferences.copy.footer }}</footer>
      </main>

      <PurchaseLinksDialog v-model="showPurchaseLinks" />
    </div>
  </el-config-provider>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SideNav from './components/layout/SideNav.vue'
import PurchaseLinksDialog from './components/shared/PurchaseLinksDialog.vue'
import { useLibraryStore } from './stores/library'
import { usePreferencesStore } from './stores/preferences'

const route = useRoute()
const library = useLibraryStore()
const preferences = usePreferencesStore()
const mainPanelRef = ref(null)
const routeName = computed(() => route.name || 'overview')
const showPurchaseLinks = ref(false)
let zeroPressCount = 0
let zeroPressTimer = null

watch(routeName, async (name) => {
  if (name !== 'library') {
    library.clearActiveRecord()
  }
  await nextTick()
  if (mainPanelRef.value) {
    mainPanelRef.value.scrollTop = 0
  }
})

function resetZeroPressCount() {
  zeroPressCount = 0
  if (zeroPressTimer) {
    window.clearTimeout(zeroPressTimer)
    zeroPressTimer = null
  }
}

function handleHiddenPurchaseShortcut(event) {
  if (routeName.value !== 'overview') {
    resetZeroPressCount()
    return
  }

  const target = event.target
  const tagName = target?.tagName?.toLowerCase()
  const isTyping = tagName === 'input' || tagName === 'textarea' || target?.isContentEditable
  if (isTyping) return

  if (event.key !== '0') {
    resetZeroPressCount()
    return
  }

  zeroPressCount += 1
  if (zeroPressTimer) window.clearTimeout(zeroPressTimer)
  zeroPressTimer = window.setTimeout(resetZeroPressCount, 1200)

  if (zeroPressCount >= 3) {
    resetZeroPressCount()
    showPurchaseLinks.value = true
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleHiddenPurchaseShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleHiddenPurchaseShortcut)
  resetZeroPressCount()
})
</script>
