/**
 * Máy chủ trận đấu: phục vụ bản build trong `dist/` và giữ trạng thái phiên cho
 * mọi thiết bị trong cùng mạng LAN. Chạy trên đúng cái máy đang nối máy chiếu.
 *
 * Không dùng express hay socket.io — chỉ `node:http`, nên không thêm một
 * dependency nào vào dự án.
 *
 * Chạy:  npm run start        (build rồi chạy)
 *        PORT=8080 npm run serve
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
    // index.html không được cache: build lại rồi mà điện thoại vẫn giữ bản cũ
    // thì nó nạp file JS đã bị xoá và trắng màn hình.
    ...(ext === '.html' ? { 'Cache-Control': 'no-cache' } : {}),
  })
  res.end(body)
}

async function serveStatic(req, res) {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0])
  const file = join(DIST, normalize(path === '/' ? '/index.html' : path))

  // normalize() đã gộp `..`, nhưng vẫn chặn lần nữa: đây là máy chủ mở ra LAN.
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end('Không được phép')
    return
  }

  try {
    await sendFile(res, file)
  } catch {
    // App định tuyến bằng hash nên mọi link thật đều là `/`. Đường dẫn không có
    // đuôi file thì trả index.html để mã QR không bao giờ ra 404.
    if (extname(file) === '') return sendFile(res, join(DIST, 'index.html'))
    res.writeHead(404).end('Không có file này')
  }
}

/** IPv4 nội bộ đầu tiên — chính là địa chỉ để in vào mã QR cho điện thoại. */
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
    console.log('Chưa có dist/ — chạy `npm run build` trước.\n')
  }

  console.log('Máy chủ trận đấu đang chạy.\n')
  console.log(`  Bàn điều khiển   ${base}/#/admin`)
  console.log(`  Màn hình lớn     ${base}/#/display`)
  console.log(`  Người chơi       ${base}/#/play\n`)
  console.log('Điện thoại phải vào cùng wifi với máy này. Ctrl+C để dừng.')
})
