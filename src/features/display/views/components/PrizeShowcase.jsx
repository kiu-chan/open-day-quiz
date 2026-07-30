import { Gift, PackageOpen } from 'lucide-react'

/** The three prize boxes on the projector. The audience only watches, never clicks. */
function PrizeShowcase({ boxes }) {
  return (
    <ul className="grid w-full grid-cols-3 gap-6">
      {boxes.prizes.map((prize, i) => {
        const isPicked = boxes.pickedIndex === i
        const tone = !boxes.isPicked
          ? 'border-border'
          : isPicked
            ? 'border-text-h bg-code-bg scale-105'
            : 'border-border opacity-30'

        const Icon = isPicked ? PackageOpen : Gift

        return (
          <li
            key={i}
            className={`text-text-h flex flex-col items-center gap-4 rounded-3xl border-4 px-4 py-10 transition duration-500 ${tone}`}
          >
            <Icon className="size-20" strokeWidth={1.5} aria-hidden="true" />
            <span className="font-mono text-2xl">Box {i + 1}</span>
            {isPicked && (
              <span className="text-center text-3xl font-semibold">{prize}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default PrizeShowcase
