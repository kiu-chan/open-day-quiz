/**
 * The access layer for the admin password. A repository, so it is allowed to
 * touch I/O: it talks to `/api/admin/*` on the game server and keeps the token
 * the server hands back in `localStorage`.
 *
 * The password itself is never stored anywhere on this side — it is typed,
 * posted once, and forgotten. What survives a reload is only the token, which
 * the server can revoke by restarting and which expires on its own.
 *
 * `authHeaders()` is what every admin-only request elsewhere in the feature
 * (writing a quiz, uploading an image) puts on the wire, and `forget()` is what
 * they call when the server answers 401 — a token the server no longer knows is
 * worth nothing, so holding on to it would only make the next request fail too.
 *
 * Public API: status(), setPassword(), login(), authHeaders(), forget()
 */
const STATUS_URL = '/api/admin/session'
const PASSWORD_URL = '/api/admin/password'
const LOGIN_URL = '/api/admin/login'

const STORAGE_KEY = 'open-day-quiz:admin-token'

function remember(token) {
  localStorage.setItem(STORAGE_KEY, token)
}

/** Throws with the server's own message, which the gate shows as it is. */
async function post(url, password) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error ?? 'the server did not answer')

  remember(body.token)
}

export const adminAuthRepository = {
  authHeaders() {
    const token = localStorage.getItem(STORAGE_KEY)
    return token ? { 'x-admin-token': token } : {}
  },

  forget() {
    localStorage.removeItem(STORAGE_KEY)
  },

  /** → { configured, authenticated, minPasswordLength } */
  async status() {
    const response = await fetch(STATUS_URL, {
      headers: adminAuthRepository.authHeaders(),
    })
    if (!response.ok) throw new Error('the server did not answer')

    const status = await response.json()
    if (!status.authenticated) adminAuthRepository.forget()
    return status
  },

  /** First run only: the server refuses this once a password exists. */
  async setPassword(password) {
    await post(PASSWORD_URL, password)
  },

  async login(password) {
    await post(LOGIN_URL, password)
  },
}
