/**
 * Helper controller: walks a number from `from` up to `to` and returns it.
 *
 * The standings between two questions have to show points being *earned*: a
 * score that simply appears as 2300 says nothing, while 1400 climbing to 2300
 * is the whole reason for showing the board at all.
 *
 * It lives in the controller layer rather than in the view because it owns a
 * timer, and that is where timers belong. It decides nothing about the game —
 * both numbers come from the model, this only fills in the frames between them.
 *
 * `prefers-reduced-motion` is honoured here by hand: the global CSS rule that
 * flattens every animation cannot reach a number counted in JavaScript.
 *
 * Public API: useCountUp(from, to, { durationMs, delayMs })
 */
import { useEffect, useState } from 'react'

const DEFAULT_DURATION_MS = 800

/** Quick off the mark, easing into the final number. */
function easeOut(t) {
  return 1 - (1 - t) ** 3
}

export function useCountUp(
  from,
  to,
  { durationMs = DEFAULT_DURATION_MS, delayMs = 0 } = {},
) {
  // Starts at `from` so the first paint is the old score, not a flash of the
  // new one — the effect below only runs after that paint.
  const [value, setValue] = useState(from)

  useEffect(() => {
    if (
      from === to ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setValue(to)
      return
    }

    setValue(from)
    const startAt = performance.now() + delayMs

    let frame = requestAnimationFrame(function tick(time) {
      const progress = Math.min(1, Math.max(0, (time - startAt) / durationMs))
      setValue(Math.round(from + (to - from) * easeOut(progress)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    })

    return () => cancelAnimationFrame(frame)
  }, [from, to, durationMs, delayMs])

  return value
}
