/**
 * Mặt HTTP của phiên chơi. Dùng chung cho hai nơi: plugin Vite lúc dev và
 * máy chủ thật lúc chạy trận (server/index.js) — nên chỉ có một bản giao thức.
 *
 * Giao thức, cố ý tối giản:
 *  - `GET  /api/events` — SSE, đẩy **ảnh chụp đầy đủ** của phiên mỗi khi nó đổi.
 *  - `POST /api/intent` — client gửi một ý định, máy chủ áp rồi phát cho mọi máy.
 *  - `POST /api/images` — admin tải ảnh minh hoạ lên, nhận về đường dẫn.
 *  - `GET  /api/images/<tên>` — trả ảnh cho điện thoại và máy chiếu.
 *
 * Vì sao SSE chứ không WebSocket / Socket.IO:
 *  - `EventSource` tự kết nối lại khi mạng chập — điện thoại khoá màn hình rồi mở
 *    lại là tự vào tiếp, không phải viết vòng thử lại nào.
 *  - Không cần thư viện phía client, cũng không thêm dependency phía server.
 *  - Luồng dữ liệu ở đây đúng hình dạng SSE: một máy phát, nhiều máy đọc; chiều
 *    ngược lại chỉ là vài cú bấm nên POST là đủ.
 *
 * Gửi ảnh chụp đầy đủ thay vì diff: điện thoại vào lại giữa trận là đúng ngay ở
 * frame đầu, không cần phát lại lịch sử. Vài chục người thì payload vẫn nhỏ.
 *
 * Public API: handleApi(req, res, next)
 */
import { imageStore, MAX_IMAGE_BYTES } from './imageStore.js'
import { sessionStore } from './sessionStore.js'

/** Wifi và proxy hay cắt kết nối im lặng khi không có byte nào chạy qua. */
const HEARTBEAT_MS = 15_000
/** Đủ chỗ cho một bộ quiz đi kèm intent openLobby, chặn payload rác quá khổ. */
const MAX_BODY_BYTES = 64 * 1024

function sendJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  })
  res.end(payload)
}

/**
 * Mỗi frame kèm luôn đồng hồ máy chủ. Cần vì `questionEndsAt` là mốc theo đồng hồ
 * máy chủ, mà điện thoại lại trừ theo đồng hồ của nó: máy nào đặt sai giờ sẽ thấy
 * đếm ngược sai bét (thường là đứng ở 0 suốt câu). Client lấy số này để bù lệch.
 */
function snapshotFrame(session) {
  return `data: ${JSON.stringify({ session: session.toJSON(), serverNow: Date.now() })}\n\n`
}

function openStream(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    // Tắt buffering nếu có proxy đứng giữa, không thì SSE bị giữ lại từng khối.
    'X-Accel-Buffering': 'no',
  })

  // Ảnh chụp hiện tại gửi ngay: máy mới vào không phải chờ thay đổi kế tiếp.
  res.write(snapshotFrame(sessionStore.read()))

  const unsubscribe = sessionStore.subscribe((session) => {
    res.write(snapshotFrame(session))
  })
  const heartbeat = setInterval(() => res.write(': beat\n\n'), HEARTBEAT_MS)

  req.on('close', () => {
    clearInterval(heartbeat)
    unsubscribe()
  })
}

/** Gom body, trả null nếu vượt hạn mức — dừng luôn thay vì đọc hết rồi mới bỏ. */
async function readBody(req, limit) {
  const chunks = []
  let size = 0

  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) return null
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

async function readJson(req) {
  const body = await readBody(req, MAX_BODY_BYTES)
  if (!body) return null

  try {
    return JSON.parse(body.toString('utf8'))
  } catch {
    return null
  }
}

/**
 * Chữ ký `(req, res, next)` để cắm được vào cả middleware của Vite và máy chủ
 * tĩnh: `next()` nghĩa là "không phải việc của API, ai đó xử lý tiếp đi".
 */
export async function handleApi(req, res, next) {
  const path = (req.url ?? '').split('?')[0]
  if (!path.startsWith('/api/')) return next()

  if (req.method === 'GET' && path === '/api/events') {
    return openStream(req, res)
  }

  if (req.method === 'POST' && path === '/api/intent') {
    const intent = await readJson(req)
    if (!intent) return sendJson(res, 400, { error: 'payload không đọc được' })

    sessionStore.apply(intent)
    // Không trả trạng thái mới ở đây: client nào cũng nhận nó qua SSE, kể cả
    // chính máy vừa gửi. Một đường dữ liệu thì không có chuyện hai đường lệch nhau.
    return sendJson(res, 202, { ok: true })
  }

  if (req.method === 'POST' && path === '/api/images') {
    const contentType = (req.headers['content-type'] ?? '').split(';')[0].trim()
    const body = await readBody(req, MAX_IMAGE_BYTES)
    if (!body) return sendJson(res, 413, { error: 'ảnh quá nặng' })

    const name = await imageStore.save(body, contentType)
    if (!name) {
      return sendJson(res, 415, { error: 'chỉ nhận jpg, png, webp, gif' })
    }
    return sendJson(res, 201, { url: `/api/images/${name}` })
  }

  if (req.method === 'GET' && path.startsWith('/api/images/')) {
    const image = await imageStore.read(path.slice('/api/images/'.length))
    if (!image) return sendJson(res, 404, { error: 'không có ảnh này' })

    res.writeHead(200, {
      'Content-Type': image.type,
      'Content-Length': image.body.length,
      // Tên file là hash nội dung nên nội dung không bao giờ đổi dưới cùng một
      // tên: điện thoại tải một lần rồi thôi, cả trận không phải tải lại.
      'Cache-Control': 'public, max-age=31536000, immutable',
    })
    return res.end(image.body)
  }

  sendJson(res, 404, { error: `không có ${req.method} ${path}` })
}
