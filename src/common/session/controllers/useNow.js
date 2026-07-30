/**
 * Helper controller: returns "now" and ticks by itself while `active`.
 *
 * Views must not call `Date.now()` themselves, and models must not own timers —
 * so everything that counts down takes `now` from here and then asks the model
 * `session.remainingSeconds(now)`.
 *
 * Uses `serverNow()` rather than `Date.now()`: the deadline is set by the
 * server, so a phone with a skewed clock has to compensate to count correctly.
 *
 * Public API: useNow(active) → current timestamp (ms)
 */
import { useEffect, useState } from 'react'
import { serverNow } from '../models/SessionRepository.js'

/** 200ms: the seconds clock still looks smooth without rendering too often. */
const TICK_MS = 200

export function useNow(active) {
  const [now, setNow] = useState(() => serverNow())

  useEffect(() => {
    if (!active) return

    setNow(serverNow())
    const id = setInterval(() => setNow(serverNow()), TICK_MS)
    return () => clearInterval(id)
  }, [active])

  return now
}
