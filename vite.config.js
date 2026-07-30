import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleApi } from './server/sessionApi.js'

const srcPath = (segment) =>
  fileURLToPath(new URL(`./src/${segment}`, import.meta.url))

/**
 * Cắm API phiên chơi vào dev server và preview server. Nhờ vậy `npm run dev:lan`
 * chạy được một mình: vẫn có HMR mà trạng thái trận đấu đã là trạng thái máy chủ
 * thật, đúng cái handler mà server/index.js dùng khi chạy trận.
 */
const sessionApi = () => {
  const attach = (server) => {
    server.middlewares.use((req, res, next) => {
      handleApi(req, res, next).catch(next)
    })
  }

  return {
    name: 'open-day-quiz:session-api',
    configureServer: attach,
    configurePreviewServer: attach,
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), sessionApi()],
  resolve: {
    // Import xuyên feature dùng alias; trong cùng một feature thì dùng đường dẫn tương đối.
    alias: {
      '@': srcPath(''),
      '@features': srcPath('features'),
      '@common': srcPath('common'),
    },
  },
})
