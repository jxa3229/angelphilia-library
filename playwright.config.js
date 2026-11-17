import { defineConfig, devices } from '@playwright/test'

const preview = process.env.PLAYWRIGHT_PREVIEW === '1'
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5107'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || 'test-results',
  timeout: 30_000,
  workers: 1,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_SERVER === '1' ? undefined : {
    command: preview ? 'npm run preview -- --port 5108 --strictPort' : 'npm run dev -- --port 5107 --strictPort',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
})
