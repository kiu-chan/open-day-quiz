/**
 * Shared controller: reads the current session, listens for every change coming
 * from the server, and sends intents up. All three surfaces start from this
 * hook; each surface's own controller wraps it with the extra actions and state
 * that surface needs.
 *
 * `send` takes an intent (`{ type: 'start' }`, `{ type: 'answer', ... }`) rather
 * than a model transform: only the server applies the rules, the client merely
 * says what it wants.
 *
 * Public API: useSession() → { session, isOffline, send }
 */
import { useCallback, useEffect, useState } from 'react'
import { CONNECTION, sessionRepository } from '../models/SessionRepository.js'

export function useSession() {
  const [snapshot, setSnapshot] = useState(() => ({
    session: sessionRepository.read(),
    connection: sessionRepository.connection,
  }))

  useEffect(() => sessionRepository.subscribe(setSnapshot), [])

  const send = useCallback((intent) => sessionRepository.send(intent), [])

  return {
    session: snapshot.session,
    /**
     * Only "disconnected" or not matters here: right after the page opens the
     * `connecting` state lasts a few dozen ms on a LAN, and flashing an error
     * banner for that long just startles people.
     */
    isOffline: snapshot.connection === CONNECTION.OFFLINE,
    send,
  }
}
