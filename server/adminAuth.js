/**
 * The admin password: one password for the whole event, stored **hashed** in the
 * project's `.env` file under `ADMIN_PASSWORD_HASH`.
 *
 * There is no user account here — the control desk is one machine run by one
 * host — so the whole thing is a single secret plus a set of tokens handed out
 * to the browsers that typed it correctly.
 *
 * Why a hash and not the password itself: `.env` is a plain file sitting next to
 * the code on a laptop that gets carried around the venue. A hash means reading
 * the file gives an attacker nothing to type into the login form.
 *
 * scrypt rather than sha256: sha256 is fast, which is exactly what makes it a bad
 * password hash — a wordlist runs through it at millions of guesses per second.
 * scrypt is deliberately slow and memory-hungry, ships with node (no dependency
 * to add) and is the standard choice when bcrypt/argon2 are not available.
 *
 * First run: no `ADMIN_PASSWORD_HASH` anywhere, so `isConfigured()` is false and
 * the admin page asks for a password to set. It is hashed here and written into
 * `.env`, which is gitignored — the password never reaches the repository, and
 * `.env` is also never read by the client bundle (Vite only exposes `VITE_*`).
 *
 * Tokens live in RAM only, exactly like the session state: restarting the server
 * signs every admin browser out, which is the behaviour you want at the end of a
 * day rather than a bug. (Under `npm run dev` that bites once: writing `.env`
 * makes Vite restart, so the password just chosen has to be typed in.)
 *
 * Public API: adminAuth.isConfigured() / setPassword(p) / login(p) /
 * isSignedIn(token) / MIN_PASSWORD_LENGTH
 */
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)

const ENV_FILE = fileURLToPath(new URL('../.env', import.meta.url))
const ENV_KEY = 'ADMIN_PASSWORD_HASH'

const SALT_BYTES = 16
const KEY_BYTES = 64
/** Short, because it is typed on a laptop at a stand, not chosen by a security team. */
export const MIN_PASSWORD_LENGTH = 6

/** A day at the stand is over long before this. */
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000
/** Slows a wordlist down to a crawl without the host ever noticing the pause. */
const WRONG_PASSWORD_DELAY_MS = 400

/**
 * `scrypt:<salt>:<key>`, both hex. The separator is a colon and not the usual `$`
 * so the line stays safe to `source` from a shell, where `$` would expand.
 */
function encode(salt, key) {
  return `scrypt:${salt.toString('hex')}:${key.toString('hex')}`
}

async function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES)
  const key = await scrypt(password, salt, KEY_BYTES)
  return encode(salt, key)
}

/** Constant-time, so the answer takes the same time however wrong the guess is. */
async function matches(password, stored) {
  const [scheme, saltHex, keyHex] = String(stored).split(':')
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false

  const expected = Buffer.from(keyHex, 'hex')
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length)
  return timingSafeEqual(expected, actual)
}

/** One `KEY=value` line, ignoring comments and surrounding quotes. */
function readEnvValue(text, key) {
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const at = trimmed.indexOf('=')
    if (at === -1 || trimmed.slice(0, at).trim() !== key) continue

    return trimmed
      .slice(at + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
  }
  return null
}

/**
 * Rewrites one line and leaves every other line — comments included — exactly as
 * it found them: `.env` belongs to whoever runs the event, not to this file.
 */
async function writeEnvValue(key, value) {
  let text = ''
  try {
    text = await readFile(ENV_FILE, 'utf8')
  } catch {
    // No `.env` yet, which is the normal case on a fresh clone.
  }

  const line = `${key}=${value}`
  const lines = text ? text.split('\n') : []
  const index = lines.findIndex((entry) => entry.trim().startsWith(`${key}=`))

  if (index === -1) lines.push(line)
  else lines[index] = line

  await writeFile(ENV_FILE, `${lines.filter(Boolean).join('\n')}\n`)
}

/** `undefined` while unread, `null` once read and found to be missing. */
let hash

async function storedHash() {
  if (hash !== undefined) return hash

  // The environment wins over the file, so a deployment can inject the hash
  // without a writable `.env` next to the code.
  if (process.env[ENV_KEY]) {
    hash = process.env[ENV_KEY]
    return hash
  }

  try {
    hash = readEnvValue(await readFile(ENV_FILE, 'utf8'), ENV_KEY)
  } catch {
    hash = null
  }
  return hash
}

/** token → the moment it stops being valid. */
const tokens = new Map()

function issueToken() {
  const token = randomBytes(32).toString('hex')
  tokens.set(token, Date.now() + TOKEN_TTL_MS)
  return token
}

export const adminAuth = {
  MIN_PASSWORD_LENGTH,

  async isConfigured() {
    return (await storedHash()) !== null
  },

  /**
   * Sets the password of an installation that has none, and signs the caller in.
   * Refused once a password exists — otherwise the first-run screen would be a
   * way for anybody to take the control desk over. Changing a forgotten password
   * means deleting the line from `.env` and restarting the server.
   *
   * Returns `{ token }`, or `{ error }` for a password that is too short.
   */
  async setPassword(password) {
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return { error: `the password needs at least ${MIN_PASSWORD_LENGTH} characters` }
    }
    if (await adminAuth.isConfigured()) {
      return { error: 'this installation already has a password' }
    }

    hash = await hashPassword(password)
    await writeEnvValue(ENV_KEY, hash)
    return { token: issueToken() }
  },

  /** Returns a token for the right password, null for a wrong one. */
  async login(password) {
    const stored = await storedHash()
    if (!stored || typeof password !== 'string' || !(await matches(password, stored))) {
      await new Promise((resolve) => setTimeout(resolve, WRONG_PASSWORD_DELAY_MS))
      return null
    }
    return issueToken()
  },

  isSignedIn(token) {
    const expiresAt = tokens.get(token)
    if (!expiresAt) return false

    if (expiresAt < Date.now()) {
      tokens.delete(token)
      return false
    }
    return true
  },
}
