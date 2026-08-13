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
 *  - `GET|PUT /api/home` — the text of the home page, for the same reason.
 *  - `POST /api/feedback` — what a visitor thought of the stand, sent by their
 *    phone once the round is over. Open, like the intents: a phone has no
 *    password. `GET` and `DELETE` on the same path are admin only — the replies
 *    are for the organisers, not for the next visitor who guesses the address.
 *  - `GET|PUT /api/wifi` — the network visitors have to join. Readable by
 *    anybody, because the projector and the home page draw its QR code.
 *  - `GET /api/wifi/networks` — the networks this machine knows about, for the
 *    picker on the admin page. Admin only: it says something about the room the
 *    server is standing in, which no visitor needs.
 *  - `GET /api/admin/session`, `POST /api/admin/password`, `POST /api/admin/login`
 *    — the admin password (see `server/adminAuth.js`). Everything that only the
 *    admin does — writing a quiz, uploading an image — carries the token it
 *    returns in an `x-admin-token` header.
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
import { adminAuth, MIN_PASSWORD_LENGTH } from './adminAuth.js'
import { feedbackStore } from './feedbackStore.js'
import { homeStore } from './homeStore.js'
import { imageStore, MAX_IMAGE_BYTES } from './imageStore.js'
import { quizStore } from './quizStore.js'
import { sessionStore } from './sessionStore.js'
import { wifiScanner } from './wifiScanner.js'
import { wifiStore } from './wifiStore.js'

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

/** The browsers that typed the password send it back on every write. */
const isAdmin = (req) => adminAuth.isSignedIn(req.headers['x-admin-token'])

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

  // What the admin page asks on load: does this installation have a password
  // yet, and is this browser still signed in? Neither answer reveals anything a
  // visitor could use.
  if (req.method === 'GET' && path === '/api/admin/session') {
    return sendJson(res, 200, {
      configured: await adminAuth.isConfigured(),
      authenticated: isAdmin(req),
      minPasswordLength: MIN_PASSWORD_LENGTH,
    })
  }

  if (req.method === 'POST' && path === '/api/admin/password') {
    const body = await readJson(req)
    if (!body) return sendJson(res, 400, { error: 'unreadable payload' })

    const { token, error } = await adminAuth.setPassword(body.password)
    if (error) return sendJson(res, 400, { error })

    return sendJson(res, 201, { token })
  }

  if (req.method === 'POST' && path === '/api/admin/login') {
    const body = await readJson(req)
    if (!body) return sendJson(res, 400, { error: 'unreadable payload' })

    const token = await adminAuth.login(body.password)
    if (!token) return sendJson(res, 401, { error: 'wrong password' })

    return sendJson(res, 200, { token })
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
    if (!isAdmin(req)) return sendJson(res, 401, { error: 'sign in to the admin page first' })

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

    // Reading the quizzes stays open — the projector and the phones need them —
    // but writing one is the admin's alone.
    if (req.method !== 'GET' && !isAdmin(req)) {
      return sendJson(res, 401, { error: 'sign in to the admin page first' })
    }

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

  if (path === '/api/home') {
    if (req.method === 'GET') {
      return sendJson(res, 200, { content: await homeStore.read() })
    }

    if (req.method === 'PUT') {
      if (!isAdmin(req)) {
        return sendJson(res, 401, { error: 'sign in to the admin page first' })
      }

      const raw = await readJson(req)
      if (!raw) return sendJson(res, 400, { error: 'unreadable payload' })

      return sendJson(res, 200, { content: await homeStore.write(raw) })
    }
  }

  if (path === '/api/feedback') {
    // Writing is open — the phone that just played has no password, and asking
    // for one is a sure way to collect nothing.
    if (req.method === 'POST') {
      const raw = await readJson(req)
      if (!raw) return sendJson(res, 400, { error: 'unreadable payload' })

      // The server stamps the time: a phone with a wrong clock would otherwise
      // file its answer under next Tuesday and sort to the top of the list for
      // the rest of the event.
      const entry = await feedbackStore.save(raw, Date.now())
      if (!entry) return sendJson(res, 400, { error: 'a rating from 1 to 5 is required' })

      return sendJson(res, 201, { entry })
    }

    // Reading it back, and clearing it, are the organisers' business alone.
    if (!isAdmin(req)) {
      return sendJson(res, 401, { error: 'sign in to the admin page first' })
    }

    if (req.method === 'GET') {
      return sendJson(res, 200, { feedback: await feedbackStore.list() })
    }

    if (req.method === 'DELETE') {
      await feedbackStore.clear()
      return sendJson(res, 200, { ok: true })
    }
  }

  // Before `/api/wifi`, and an exact match, so a network never reads as a path.
  if (req.method === 'GET' && path === '/api/wifi/networks') {
    if (!isAdmin(req)) return sendJson(res, 401, { error: 'sign in to the admin page first' })

    return sendJson(res, 200, await wifiScanner.list())
  }

  if (path === '/api/wifi') {
    if (req.method === 'GET') {
      return sendJson(res, 200, { wifi: await wifiStore.read() })
    }

    if (req.method === 'PUT') {
      if (!isAdmin(req)) {
        return sendJson(res, 401, { error: 'sign in to the admin page first' })
      }

      const raw = await readJson(req)
      if (!raw) return sendJson(res, 400, { error: 'unreadable payload' })

      return sendJson(res, 200, { wifi: await wifiStore.write(raw) })
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
