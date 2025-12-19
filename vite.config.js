import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './testSetup.js',
    include: ['src/**/*.test.{js,jsx,ts,tsx}'], // ось цей рядок головний
  },
})
