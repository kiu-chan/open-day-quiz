/**
 * The game server: serves the build in `dist/` and holds the session state for
 * every device on the same LAN. Runs on the very machine plugged into the
 * projector.
 *
 * No express, no socket.io — just `node:http`, so it adds not a single
 * dependency to the project.
 *
 * Run:  npm run start        (build, then run)
 *       PORT=8080 npm run serve
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { networkInterfaces } from 'node:os'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleApi } from './sessionApi.js'

const PORT = Number(process.env.PORT ?? 3000)
const DIST = fileURLToPath(new URL('../dist', import.meta.url))

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

async function sendFile(res, file) {
  const body = await readFile(file)
  const ext = extname(file)
  res.writeHead(200, {
    'Content-Type': MIME[ext] ?? 'application/octet-stream',
    'Content-Length': body.length,
    // index.html must not be cached: after a rebuild, a phone holding the old
    // copy would load a JS file that no longer exists and show a blank screen.
    ...(ext === '.html' ? { 'Cache-Control': 'no-cache' } : {}),
  })
  res.end(body)
}

async function serveStatic(req, res) {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0])
  const file = join(DIST, normalize(path === '/' ? '/index.html' : path))

  // normalize() already collapsed any `..`, but check once more: this server is
  // open to the whole LAN.
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end('Forbidden')
    return
  }

  try {
    await sendFile(res, file)
  } catch {
    // The app routes on the hash, so every real link is `/`. A path with no file
    // extension gets index.html back, so scanning the QR never lands on a 404.
    if (extname(file) === '') return sendFile(res, join(DIST, 'index.html'))
    res.writeHead(404).end('Not found')
  }
}

/** The first non-internal IPv4 — the address to print into the QR code for phones. */
function lanAddress() {
  for (const nets of Object.values(networkInterfaces())) {
    for (const net of nets ?? []) {
      if (net.family === 'IPv4' && !net.internal) return net.address
    }
  }
  return 'localhost'
}

const server = createServer((req, res) => {
  handleApi(req, res, () => serveStatic(req, res)).catch((error) => {
    console.error(error)
    if (!res.headersSent) res.writeHead(500)
    res.end()
  })
})

server.listen(PORT, '0.0.0.0', () => {
  const base = `http://${lanAddress()}:${PORT}`

  if (!existsSync(join(DIST, 'index.html'))) {
    console.log('No dist/ yet — run `npm run build` first.\n')
  }

  console.log('Game server running.\n')
  // No `#/` on the home line: an empty hash already routes home, and the shorter
  // the address the easier it is to read out loud at the stand.
  console.log(`  Home           ${base}/`)
  console.log(`  Control desk   ${base}/#/admin`)
  console.log(`  Big screen     ${base}/#/display`)
  console.log(`  Player         ${base}/#/play\n`)
  console.log('Phones must be on the same wifi as this machine. Ctrl+C to stop.')
})
