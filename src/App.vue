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
    </div>
  </el-config-provider>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SideNav from './components/layout/SideNav.vue'
import { useLibraryStore } from './stores/library'
import { usePreferencesStore } from './stores/preferences'

const route = useRoute()
const library = useLibraryStore()
const preferences = usePreferencesStore()
const mainPanelRef = ref(null)
const routeName = computed(() => route.name || 'overview')

watch(routeName, async (name) => {
  if (name !== 'library') {
    library.clearActiveRecord()
  }
  await nextTick()
  if (mainPanelRef.value) {
    mainPanelRef.value.scrollTop = 0
  }
})
</script>
