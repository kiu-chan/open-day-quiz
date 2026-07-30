import { Gift, PackageOpen } from 'lucide-react'

/**
 * Ba hộp quà cho người thắng bấm.
 * Hộp đã mở đổi icon, viền dày và hiện tên quà; hai hộp còn lại mờ đi và không
 * bấm được nữa — đã chọn là không đổi ý.
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
              <span className="font-mono text-xs">Hộp {i + 1}</span>
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
