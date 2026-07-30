import { Gift, PackageOpen } from 'lucide-react'

/**
 * The three prize boxes for the winner to tap.
 * The opened box swaps its icon, thickens its border and shows the prize name;
 * the other two fade back and stop being clickable — once picked, no changing
 * your mind.
 */
function PrizeBoxPicker({ boxes, onPick }) {
  return (
    <ul className="grid grid-cols-3 gap-3">
      {boxes.prizes.map((prize, i) => {
        const isPicked = boxes.pickedIndex === i
        const tone = !boxes.isPicked
          ? 'border-border hover:border-accent-border hover:bg-accent-bg cursor-pointer'
          : isPicked
            ? 'border-text-h bg-code-bg scale-105'
            : 'border-border opacity-40'

        const Icon = isPicked ? PackageOpen : Gift

        return (
          <li key={i}>
            <button
              type="button"
              disabled={boxes.isPicked}
              onClick={() => onPick(i)}
              className={`text-text-h flex w-full flex-col items-center gap-2 rounded-2xl border-2 bg-transparent px-2 py-5 transition duration-300 ${tone}`}
            >
              <Icon className="size-9" strokeWidth={1.5} aria-hidden="true" />
              <span className="font-mono text-xs">Box {i + 1}</span>
              {isPicked && (
                <span className="text-center text-xs font-medium">{prize}</span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default PrizeBoxPicker
