import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleApi } from './server/sessionApi.js'

const srcPath = (segment) =>
  fileURLToPath(new URL(`./src/${segment}`, import.meta.url))

/**
 * Plugs the session API into the dev server and the preview server. That is what
 * lets `npm run dev:lan` run on its own: HMR still works while the game state is
 * already real server state, handled by the very same handler server/index.js
 * uses during a live round.
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
    // Cross-feature imports use aliases; inside one feature, use relative paths.
    alias: {
      '@': srcPath(''),
      '@features': srcPath('features'),
      '@common': srcPath('common'),
    },
  },
})
