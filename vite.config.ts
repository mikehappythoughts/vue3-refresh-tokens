/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.tsx', '.ts', '.js', '.vue']
  },
  // added to unit test our application components etc
  test: {
    coverage: {
      reporter: ['text', 'json', 'html']
    },
    globals: true,
    environment: 'happy-dom'
  }
})
