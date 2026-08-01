import { useCountUp } from '@common/session/controllers/useCountUp.js'

/**
 * A score that climbs from its previous value to the new one.
 *
 * Both numbers come from the model; the only thing decided here is how long the
 * climb takes. The label carries the final figure, so a screen reader is told
 * the score rather than whichever frame it happened to catch.
 */
function ScoreCounter({ from, to, delayMs = 0, className = '' }) {
  const value = useCountUp(from, to, { delayMs })

  return (
    <span
      className={`font-mono tabular-nums ${className}`}
      aria-label={`${to} points`}
    >
      {value}
    </span>
  )
}

export default ScoreCounter
