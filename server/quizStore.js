/**
 * The store for the quizzes the admin writes.
 *
 * They used to live in the admin browser's localStorage, which meant a quiz only
 * existed on the one machine that typed it: opening the admin page on another
 * laptop showed an empty list, and clearing site data threw the evening's work
 * away. Now the server owns them and every machine reads the same list.
 *
 * Unlike the session state — which is deliberately RAM-only, because resuming
 * yesterday's half-played round is worse than losing it — quizzes are written to
 * `server/quizzes.json`. They are content, not the state of a match: losing them
 * on restart would be plainly wrong.
 *
 * Everything goes through `Quiz` on the way in, so the file only ever holds the
 * canonical shape and the validation rules exist in a single copy, exactly as
 * with SessionModel.
 *
 * Public API: quizStore.list() / save(raw) / remove(id)
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Quiz } from '../src/common/session/models/Quiz.js'
import { QUIZ_DATA } from '../src/features/admin/models/data/quizzes.js'

const FILE = fileURLToPath(new URL('./quizzes.json', import.meta.url))

/** Round-trip through the model: unknown fields are dropped, missing ones defaulted. */
const normalise = (raw) => Quiz.fromJSON(raw).toJSON()

let quizzes = null

/**
 * Writes are chained rather than fired in parallel. The editor saves on every
 * keystroke, so several requests are easily in flight at once; without the chain
 * two `writeFile` calls could interleave and leave a half-written file behind.
 * Each link writes its own snapshot, so the last one to start is the last one on
 * disk.
 */
let pending = Promise.resolve()

function persist() {
  const payload = JSON.stringify(quizzes, null, 2)
  pending = pending.then(() => writeFile(FILE, payload))
  return pending
}

async function loaded() {
  if (quizzes) return quizzes

  try {
    quizzes = JSON.parse(await readFile(FILE, 'utf8')).map(normalise)
  } catch {
    // No file yet (first run), or one that got mangled: start from the sample
    // set rather than leaving the admin with an empty screen and no explanation.
    quizzes = QUIZ_DATA.map(normalise)
    await persist()
  }
  return quizzes
}

export const quizStore = {
  async list() {
    return await loaded()
  },

  /** Insert, or overwrite by id. Returns the stored quiz, or null when the payload has no id. */
  async save(raw) {
    if (!raw?.id || typeof raw.id !== 'string') return null

    const quiz = normalise(raw)
    const list = await loaded()
    const index = list.findIndex((item) => item.id === quiz.id)

    if (index === -1) list.push(quiz)
    else list[index] = quiz

    await persist()
    return quiz
  },

  async remove(id) {
    quizzes = (await loaded()).filter((quiz) => quiz.id !== id)
    await persist()
  },
}
