/**
 * The access layer for the Wi-Fi settings — the I/O boundary, and therefore
 * allowed to talk to the network.
 *
 * It sits in `common/` because three surfaces touch it: the home page and the
 * big screen read it to draw the code, the admin page writes it. Reading is open
 * to anybody (a phone about to join has to be able to fetch the code), writing
 * and scanning carry the admin token, so those two reach into the admin feature
 * for the header — the one direction of dependency in this file.
 *
 * Public API: load(), save(settings), scan()
 */
import { adminAuthRepository } from '@features/admin/models/AdminAuthRepository.js'
import { wifiSettingsFromJSON } from './WifiSettings.js'

const BASE_URL = '/api/wifi'

/** A token the server has forgotten is dead weight: drop it, so the next page
 *  load asks for the password instead of failing the same way again. */
async function failed(response) {
  if (response.status === 401) {
    adminAuthRepository.forget()
    return new Error('the admin session expired — reload the page and sign in again')
  }

  const { error } = await response.json().catch(() => ({}))
  return new Error(error ?? 'the server did not answer')
}

export const wifiRepository = {
  async load() {
    const response = await fetch(BASE_URL)
    if (!response.ok) throw new Error('the server did not answer')

    const { wifi } = await response.json()
    return wifiSettingsFromJSON(wifi)
  },

  async save(settings) {
    const response = await fetch(BASE_URL, {
      method: 'PUT',
      headers: {
        ...adminAuthRepository.authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    })

    if (!response.ok) throw await failed(response)

    const { wifi } = await response.json()
    return wifiSettingsFromJSON(wifi)
  },

  /**
   * The networks the **server machine** knows about — not the admin's laptop,
   * which may be somewhere else entirely. See `server/wifiScanner.js` for why
   * the answer is a remembered list on macOS and a live scan elsewhere.
   */
  async scan() {
    const response = await fetch(`${BASE_URL}/networks`, {
      headers: adminAuthRepository.authHeaders(),
    })

    if (!response.ok) throw await failed(response)

    return await response.json()
  },
}
