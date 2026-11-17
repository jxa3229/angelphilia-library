<template>
  <el-config-provider>
    <div class="app-shell" :data-theme="preferences.theme">
      <SideNav />

      <main ref="mainPanelRef" class="main-panel" :class="`route-${routeName}`">
        <p v-if="navigationLoading" class="navigation-status" role="status">{{ preferences.copy.pageLoading }}</p>
        <div v-if="navigationFailure" class="navigation-status" role="alert">
          <p>{{ preferences.copy.pageLoadFailed }}</p>
          <el-button @click="retryNavigation">{{ preferences.copy.retryPage }}</el-button>
        </div>
        <RouterView v-slot="{ Component }">
          <component :is="Component" :main-panel="mainPanelRef" />
        </RouterView>
        <footer>
          <span>{{ preferences.copy.footer }}</span>
          <span>
            {{ preferences.copy.footerContact }}
            <a class="contact-link" href="mailto:talon3229@163.com">talon3229@163.com</a>
          </span>
        </footer>
      </main>

      <PurchaseLinksDialog v-model="showPurchaseLinks" />
      <ChangelogDialog />
    </div>
  </el-config-provider>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { navigationLoading, navigationFailure, retryNavigation } from './router'
import SideNav from './components/layout/SideNav.vue'
import PurchaseLinksDialog from './components/shared/PurchaseLinksDialog.vue'
import ChangelogDialog from './components/shared/ChangelogDialog.vue'
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

<style scoped>
.navigation-status { padding: 14px 18px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); overflow-wrap: anywhere; }
</style>
