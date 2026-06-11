<template>
  <div class="theme-row" aria-label="Theme">
    <el-tooltip :content="copy.light">
      <button type="button" :class="{ active: preferences.theme === 'light' }" @click="preferences.setTheme('light')">
        <el-icon><Sunny /></el-icon>
      </button>
    </el-tooltip>
    <el-tooltip :content="copy.dark">
      <button type="button" :class="{ active: preferences.theme === 'dark' }" @click="preferences.setTheme('dark')">
        <el-icon><Moon /></el-icon>
      </button>
    </el-tooltip>
    <el-tooltip :content="copy.system">
      <button type="button" :class="{ active: preferences.theme === 'system' }" @click="preferences.setTheme('system')">
        <el-icon><Monitor /></el-icon>
      </button>
    </el-tooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Monitor, Moon, Sunny } from '@element-plus/icons-vue'
import { usePreferencesStore } from '../../stores/preferences'

const preferences = usePreferencesStore()
const copy = computed(() => preferences.copy)
</script>
