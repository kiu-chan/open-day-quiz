/**
 * The HTTP face of the session. Shared by two places: the Vite plugin during
 * development and the real game server (server/index.js) — so there is only one
 * copy of the protocol.
 *
 * The protocol, deliberately minimal:
 *  - `GET  /api/events` — SSE, pushes a **full snapshot** of the session on every
 *    change.
 *  - `POST /api/intent` — the client sends one intent, the server applies it and
 *    broadcasts to everyone.
 *  - `POST /api/images` — the admin uploads an illustration and gets a path back.
 *  - `GET  /api/images/<name>` — serves images to phones and the projector.
 *  - `GET /api/quizzes`, `PUT|DELETE /api/quizzes/<id>` — the quizzes the admin
 *    writes. Plain REST rather than intents: these are content edited by one
 *    person, not shared match state the whole room has to watch.
 *
 * Why SSE rather than WebSocket / Socket.IO:
 *  - `EventSource` reconnects by itself when the network hiccups — a phone that
 *    locks and unlocks its screen rejoins on its own, with no retry loop to write.
 *  - No client library needed, and no server-side dependency either.
 *  - The data flow here is exactly SSE-shaped: one broadcaster, many readers; the
 *    reverse direction is only a handful of taps, so POST is plenty.
 *
 * Full snapshots instead of diffs: a phone rejoining mid-round is correct from
 * its very first frame, with no history to replay. With a few dozen people the
 * payload stays small anyway.
 *
 * Public API: handleApi(req, res, next)
 */
import { imageStore, MAX_IMAGE_BYTES } from './imageStore.js'
import { quizStore } from './quizStore.js'
import { sessionStore } from './sessionStore.js'

/** Wifi and proxies like to drop connections silently when no bytes flow. */
const HEARTBEAT_MS = 15_000
/** Room for a quiz travelling with an openLobby intent, while blocking oversized junk. */
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
 * Every frame carries the server clock along with it. Needed because
 * `questionEndsAt` is a timestamp on the server clock while a phone subtracts
 * against its own: a device with the wrong time would see a completely wrong
 * countdown (usually stuck at 0 for the whole question). The client uses this
 * number to correct the offset.
 */
function snapshotFrame(session) {
  return `data: ${JSON.stringify({ session: session.toJSON(), serverNow: Date.now() })}\n\n`
}

function openStream(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    // Disable buffering in case a proxy sits in between, otherwise SSE gets held
    // back in chunks.
    'X-Accel-Buffering': 'no',
  })

  // Send the current snapshot immediately: a device that just connected should
  // not have to wait for the next change.
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

/** Collect the body, returning null when it exceeds the limit — bail out early instead of reading it all and then discarding. */
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
 * The `(req, res, next)` signature lets this plug into both Vite's middleware and
 * the static server: `next()` means "not the API's business, someone else take
 * it from here".
 */
export async function handleApi(req, res, next) {
  const path = (req.url ?? '').split('?')[0]
  if (!path.startsWith('/api/')) return next()

  if (req.method === 'GET' && path === '/api/events') {
    return openStream(req, res)
  }

  if (req.method === 'POST' && path === '/api/intent') {
    const intent = await readJson(req)
    if (!intent) return sendJson(res, 400, { error: 'unreadable payload' })

    sessionStore.apply(intent)
    // The new state is not returned here: every client receives it over SSE,
    // including the one that just posted. One data path means no two paths can
    // drift apart.
    return sendJson(res, 202, { ok: true })
  }

  if (req.method === 'POST' && path === '/api/images') {
    const contentType = (req.headers['content-type'] ?? '').split(';')[0].trim()
    const body = await readBody(req, MAX_IMAGE_BYTES)
    if (!body) return sendJson(res, 413, { error: 'image too large' })

    const name = await imageStore.save(body, contentType)
    if (!name) {
      return sendJson(res, 415, { error: 'only jpg, png, webp and gif accepted' })
    }
    return sendJson(res, 201, { url: `/api/images/${name}` })
  }

  if (req.method === 'GET' && path === '/api/quizzes') {
    return sendJson(res, 200, { quizzes: await quizStore.list() })
  }

  if (path.startsWith('/api/quizzes/')) {
    const id = decodeURIComponent(path.slice('/api/quizzes/'.length))

    if (req.method === 'PUT') {
      const raw = await readJson(req)
      if (!raw) return sendJson(res, 400, { error: 'unreadable payload' })
      // The id in the URL wins over the one in the body: no request can rename a
      // quiz onto another one and quietly overwrite it.
      const quiz = await quizStore.save({ ...raw, id })
      if (!quiz) return sendJson(res, 400, { error: 'a quiz needs an id' })

      return sendJson(res, 200, { quiz })
    }

    if (req.method === 'DELETE') {
      await quizStore.remove(id)
      return sendJson(res, 200, { ok: true })
    }
  }

  if (req.method === 'GET' && path.startsWith('/api/images/')) {
    const image = await imageStore.read(path.slice('/api/images/'.length))
    if (!image) return sendJson(res, 404, { error: 'no such image' })

    res.writeHead(200, {
      'Content-Type': image.type,
      'Content-Length': image.body.length,
      // The filename is a content hash, so the content behind a given name never
      // changes: a phone downloads it once and never again for the whole round.
      'Cache-Control': 'public, max-age=31536000, immutable',
    })
    return res.end(image.body)
  }

  sendJson(res, 404, { error: `no such route: ${req.method} ${path}` })
}
