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
    alias: [
      { find: '@features', replacement: srcPath('features') },
      { find: '@common', replacement: srcPath('common') },
      { find: '@', replacement: srcPath('') },
      // The avatar animations use no expressions and no effects (checked: no
      // `"x"` expression strings, no `ef` blocks), so the light player renders
      // them identically while dropping the expression evaluator — which is both
      // ~150KB of the bundle and the only `eval` in the whole build. Adding an
      // animation that *does* use expressions means dropping this entry.
      // The `$` anchor matters: a plain prefix alias would also rewrite the
      // replacement itself and resolve to a path that does not exist.
      {
        find: /^lottie-web$/,
        replacement: fileURLToPath(
          new URL('./node_modules/lottie-web/build/player/lottie_light.js', import.meta.url),
        ),
      },
    ],
  },
})
