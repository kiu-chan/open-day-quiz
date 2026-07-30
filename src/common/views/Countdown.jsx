import { Timer } from 'lucide-react'

/**
 * The countdown clock. As time runs out the border thickens and the text gets
 * bolder — no colour change, so washed-out projectors and colour-blind viewers
 * still see it.
 * The caller sets the font size (`className`); the icon scales with `size-[1em]`.
 */
const URGENT_SECONDS = 5

function Countdown({ seconds, className = '' }) {
  const isUrgent = seconds <= URGENT_SECONDS
  const tone = isUrgent
    ? 'border-text-h text-text-h font-bold'
    : 'border-border font-medium'

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-1 font-mono tabular-nums ${tone} ${className}`}
    >
      <Timer className="size-[1em] shrink-0" strokeWidth={2.5} aria-hidden="true" />
      {seconds}s
    </span>
  )
}

export default Countdown
