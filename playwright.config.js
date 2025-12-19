import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './playwright-tests',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
