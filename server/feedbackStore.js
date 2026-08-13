/**
 * The store for the feedback visitors leave after a round.
 *
 * Written to `server/feedback.json` for the same reason the quizzes are: this is
 * not match state. The session in RAM is deliberately thrown away on a restart —
 * resuming yesterday's half-played round is worse than losing it — but what a
 * visitor took the trouble to type about the stand has to still be there in the
 * morning, when somebody at the university sits down to read it.
 *
 * Everything goes through `feedbackFromJSON` on the way in, so the file only
 * ever holds the canonical shape and the "what counts as a rating" rule exists
 * in a single copy, shared with the browser.
 *
 * The list is kept **newest first**, which is the order the admin page reads it
 * in, and a phone that sends again replaces its own entry rather than adding a
 * second one — see `feedbackKey`.
 *
 * Public API: feedbackStore.list() / save(raw, submittedAt) / clear()
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import {
  feedbackFromJSON,
  feedbackKey,
} from '../src/common/feedback/models/Feedback.js'

const FILE = fileURLToPath(new URL('./feedback.json', import.meta.url))

let entries = null

/** Writes are chained so two phones answering at once cannot interleave into a half file. */
let pending = Promise.resolve()

function persist() {
  const payload = JSON.stringify(entries, null, 2)
  pending = pending.then(() => writeFile(FILE, payload))
  return pending
}

async function loaded() {
  if (entries) return entries

  try {
    entries = JSON.parse(await readFile(FILE, 'utf8'))
      .map(feedbackFromJSON)
      .filter(Boolean)
  } catch {
    // No file yet (the usual case — nobody has played), or one that got
    // mangled. Nothing is written until the first visitor answers.
    entries = []
  }
  return entries
}

export const feedbackStore = {
  async list() {
    return await loaded()
  },

  /** Returns the stored entry, or null when the payload is not feedback at all. */
  async save(raw, submittedAt) {
    const entry = feedbackFromJSON({ ...raw, submittedAt })
    if (!entry) return null

    const list = await loaded()
    // Dropped and re-added at the front rather than edited in place: a rewritten
    // answer is the newest thing in the book, and that is where it is read.
    entries = [entry, ...list.filter((item) => feedbackKey(item) !== feedbackKey(entry))]

    await persist()
    return entry
  },

  async clear() {
    entries = []
    await persist()
  },
}
