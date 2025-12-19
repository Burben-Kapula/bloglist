import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './playwright-tests',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
