/**
 * The access layer for the feedback visitors leave — the I/O boundary between
 * the two features that touch it, and therefore allowed to talk to the network.
 *
 * Same arrangement as `HomeContentRepository`, mirrored: here it is **writing**
 * that is open to anybody and **reading** that carries the admin token. A phone
 * has to be able to post its rating without a password, but what the room wrote
 * about the stand is for the organisers, not for the next visitor who guesses
 * the address.
 *
 * Plain REST rather than an intent, because feedback is not match state: it
 * arrives after the round, one phone at a time, and no screen in the hall is
 * waiting to redraw itself when it lands.
 *
 * Public API: submit(entry), list(), clear()
 */
import { adminAuthRepository } from '@features/admin/models/AdminAuthRepository.js'
import { feedbackFromJSON } from './Feedback.js'

const BASE_URL = '/api/feedback'

/** The 401 handling every admin-only call needs: a forgotten token is dead weight. */
async function adminFetch(options) {
  const response = await fetch(BASE_URL, {
    ...options,
    headers: adminAuthRepository.authHeaders(),
  })

  if (!response.ok) {
    if (response.status === 401) {
      adminAuthRepository.forget()
      throw new Error('the admin session expired — reload the page and sign in again')
    }

    const { error } = await response.json().catch(() => ({}))
    throw new Error(error ?? 'the server did not answer')
  }

  return await response.json()
}

export const feedbackRepository = {
  /**
   * Posted by the phone. The server stamps the time and answers with what it
   * stored, so the sender never has to guess whether its own clock was right.
   */
  async submit(entry) {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })

    if (!response.ok) {
      const { error } = await response.json().catch(() => ({}))
      throw new Error(error ?? 'the server did not answer')
    }

    const { entry: stored } = await response.json()
    return feedbackFromJSON(stored)
  },

  /** Newest first, as the server keeps them. Admin only. */
  async list() {
    const { feedback } = await adminFetch({})
    // Through the model on the way in, so a file written by an older version
    // cannot leave the page reading fields that are not there.
    return feedback.map(feedbackFromJSON).filter(Boolean)
  },

  /** Empties the book — for starting a fresh event day. Admin only. */
  async clear() {
    await adminFetch({ method: 'DELETE' })
  },
}
