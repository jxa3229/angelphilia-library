import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: process.env.BASE_PATH || '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue'],
          elementPlus: ['element-plus', '@element-plus/icons-vue']
        }
      }
    }
  }
})
