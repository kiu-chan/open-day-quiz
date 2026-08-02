/**
 * The access layer for the home page text — the I/O boundary between the two
 * features that touch it, and therefore allowed to talk to the network.
 *
 * It sits in `common/` because two features genuinely need it: the home page
 * reads the text, the admin page writes it. Reading is open to anybody (the home
 * page is the first thing a visitor opens), writing carries the admin token, so
 * `save()` reaches into the admin feature for the header that token buys — the
 * one direction of dependency in this file, and the reason it is only in
 * `save()`.
 *
 * Everything comes back through `homeContentFromJSON`, so a server that is one
 * version behind — a stored file written before a field existed — still answers
 * with a complete record instead of leaving holes on the page.
 *
 * Public API: load(), save(content)
 */
import { adminAuthRepository } from '@features/admin/models/AdminAuthRepository.js'
import { homeContentFromJSON } from './HomeContent.js'

const BASE_URL = '/api/home'

export const homeContentRepository = {
  async load() {
    const response = await fetch(BASE_URL)
    if (!response.ok) throw new Error('the server did not answer')

    const { content } = await response.json()
    return homeContentFromJSON(content)
  },

  async save(content) {
    const response = await fetch(BASE_URL, {
      method: 'PUT',
      headers: {
        ...adminAuthRepository.authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    })

    if (!response.ok) {
      // A token the server has forgotten is dead weight: drop it so the next
      // page load asks for the password instead of failing the same way again.
      if (response.status === 401) {
        adminAuthRepository.forget()
        throw new Error('the admin session expired — reload the page and sign in again')
      }

      const { error } = await response.json().catch(() => ({}))
      throw new Error(error ?? 'the server did not answer')
    }

    const { content: saved } = await response.json()
    return homeContentFromJSON(saved)
  },
}
