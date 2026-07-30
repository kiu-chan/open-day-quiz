import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const srcPath = (segment) =>
  fileURLToPath(new URL(`./src/${segment}`, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Import xuyên feature dùng alias; trong cùng một feature thì dùng đường dẫn tương đối.
    alias: {
      '@': srcPath(''),
      '@features': srcPath('features'),
      '@common': srcPath('common'),
    },
  },
})
