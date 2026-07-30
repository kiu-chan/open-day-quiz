/**
 * The session state access layer — the **only I/O boundary** of the session.
 * That is the whole reason a repository exists, so this is the only file in
 * `models/` allowed to touch the network.
 *
 * The client **never** changes the state itself: it posts an intent to the
 * server (`POST /api/intent`) and receives session snapshots over SSE
 * (`GET /api/events`). The server is the source of truth — see
 * `server/sessionStore.js` for why.
 *
 * `read()` is still synchronous and still returns a SessionModel: it reads the
 * most recent snapshot received. Thanks to that, no view and no SessionModel had
 * to change when the app moved from localStorage to a server.
 *
 * Public API: read(), send(intent), subscribe(fn), connection, serverNow(), CONNECTION.
 */
import { SessionModel } from './SessionModel.js'

const EVENTS_URL = '/api/events'
const INTENT_URL = '/api/intent'

export const CONNECTION = {
  CONNECTING: 'connecting',
  ONLINE: 'online',
  OFFLINE: 'offline',
}

let current = SessionModel.empty()
let connection = CONNECTION.CONNECTING
let stream = null
let clockOffset = 0

const listeners = new Set()

function emit() {
  for (const listener of listeners) listener({ session: current, connection })
}

/**
 * "Now" according to the **server** clock, not this device's clock.
 *
 * `questionEndsAt` is a timestamp set by the server, so a device with a skewed
 * clock that subtracts against its own time sees a completely wrong countdown —
 * usually stuck at 0 for the whole question. Every SSE frame carries the server
 * clock, so the offset is corrected continuously. On a LAN the transport delay
 * is a few ms, which is negligible.
 */
export function serverNow() {
  return Date.now() + clockOffset
}

function connect() {
  stream = new EventSource(EVENTS_URL)

  stream.addEventListener('message', (event) => {
    const frame = JSON.parse(event.data)
    clockOffset = frame.serverNow - Date.now()
    current = SessionModel.fromJSON(frame.session)
    connection = CONNECTION.ONLINE
    emit()
  })

  // EventSource retries by itself after a few seconds, so all we do here is flip
  // a flag for the view to tell the user. No hand-written retry loop — that is
  // exactly why SSE was chosen over a raw WebSocket.
  stream.addEventListener('error', () => {
    if (connection === CONNECTION.OFFLINE) return
    connection = CONNECTION.OFFLINE
    emit()
  })
}

export const sessionRepository = {
  read: () => current,

  get connection() {
    return connection
  },

  /**
   * Send one intent. It does not wait for the new state in the response: that
   * arrives over SSE at the same moment as for every other device.
   *
   * A failed send only raises the offline flag instead of queueing a retry — the
   * game is live, and an answer resent 30 seconds later belongs to a question
   * that is long gone. Showing the disconnect banner so the player taps again is
   * the behaviour people expect.
   */
  async send(intent) {
    try {
      const response = await fetch(INTENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intent),
      })
      if (!response.ok) throw new Error(`server replied ${response.status}`)
    } catch {
      if (connection === CONNECTION.OFFLINE) return
      connection = CONNECTION.OFFLINE
      emit()
    }
  },

  /** Only the first listener opens the connection: SSR and test renders need no network. */
  subscribe(listener) {
    listeners.add(listener)
    if (!stream) connect()
    return () => listeners.delete(listener)
  },
}
