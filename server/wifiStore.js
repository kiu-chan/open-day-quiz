/**
 * The store for the network the stand hands out.
 *
 * Same reasoning as `homeStore.js`: this is configuration, not match state, so
 * it is written to `server/wifi.json` and read back on the next start — nobody
 * wants to retype a password because the server was restarted between rounds.
 * There is exactly one record, so there is no list and no id, only `read()` and
 * `write()`.
 *
 * It goes through `wifiSettingsFromJSON` on the way in and out, so the file on
 * disk only ever holds the canonical shape.
 *
 * Public API: wifiStore.read() / write(raw)
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { wifiSettingsFromJSON } from '../src/common/wifi/models/WifiSettings.js'

const FILE = fileURLToPath(new URL('./wifi.json', import.meta.url))

let settings = null

/** Writes are chained so two saves in flight cannot interleave into a half file. */
let pending = Promise.resolve()

function persist() {
  const payload = JSON.stringify(settings, null, 2)
  pending = pending.then(() => writeFile(FILE, payload))
  return pending
}

async function loaded() {
  if (settings) return settings

  try {
    settings = wifiSettingsFromJSON(JSON.parse(await readFile(FILE, 'utf8')))
  } catch {
    // No file yet (first run), or one that got mangled: no network configured
    // is a perfectly good state — no code is drawn — so nothing is written
    // until the admin fills the form in.
    settings = wifiSettingsFromJSON({})
  }
  return settings
}

export const wifiStore = {
  async read() {
    return await loaded()
  },

  async write(raw) {
    await loaded()
    settings = wifiSettingsFromJSON(raw)
    await persist()
    return settings
  },
}
