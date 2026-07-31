import { Gift } from 'lucide-react'

const BOXES = [
  { key: 'a', label: 'Box 1', delay: '0s' },
  { key: 'b', label: 'Box 2', delay: '0.45s' },
  { key: 'c', label: 'Box 3', delay: '0.9s' },
]

/**
 * Three gently wobbling prize boxes, each slightly out of phase so it does not
 * look mechanical. This is purely an illustration on the home page — the real
 * boxes are shuffled by `PrizeBoxes` at prize time.
 */
function PrizeTeaser() {
  return (
    <ul className="reveal flex list-none flex-wrap justify-center gap-6 p-0">
      {BOXES.map(({ key, label, delay }) => (
        <li
          key={key}
          className="animate-wobble border-accent-border hover:shadow-card group flex size-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-shadow duration-300 sm:size-32"
          style={{ animationDelay: delay }}
        >
          <Gift
            className="text-text-h size-10 shrink-0 transition duration-300 group-hover:-translate-y-1 group-hover:scale-110"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="text-text-h text-sm font-medium">{label}</span>
        </li>
      ))}
    </ul>
  )
}

export default PrizeTeaser
