/**
 * The store for the home page text the admin edits.
 *
 * Same reasoning as `quizStore.js`: this is content, not match state, so losing
 * it on a restart would be plainly wrong — it is written to `server/home.json`
 * and read back on the next start. There is exactly one record, so there is no
 * list and no id, only `read()` and `write()`.
 *
 * Everything goes through `homeContentFromJSON` on the way in and out, so the
 * file only ever holds the canonical shape and the rule that a blank field falls
 * back to the default exists in a single copy, shared with the browser.
 *
 * Public API: homeStore.read() / write(raw)
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { homeContentFromJSON } from '../src/common/home/models/HomeContent.js'

const FILE = fileURLToPath(new URL('./home.json', import.meta.url))

let content = null

/** Writes are chained so two saves in flight cannot interleave into a half file. */
let pending = Promise.resolve()

function persist() {
  const payload = JSON.stringify(content, null, 2)
  pending = pending.then(() => writeFile(FILE, payload))
  return pending
}

async function loaded() {
  if (content) return content

  try {
    content = homeContentFromJSON(JSON.parse(await readFile(FILE, 'utf8')))
  } catch {
    // No file yet (first run), or one that got mangled: the defaults are a
    // complete home page, so nothing is written until the admin edits something.
    content = homeContentFromJSON({})
  }
  return content
}

export const homeStore = {
  async read() {
    return await loaded()
  },

  async write(raw) {
    await loaded()
    content = homeContentFromJSON(raw)
    await persist()
    return content
  },
}
