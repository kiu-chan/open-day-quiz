import { Gift } from 'lucide-react'

const BOXES = [
  { key: 'a', label: 'Hộp 1', delay: '0s' },
  { key: 'b', label: 'Hộp 2', delay: '0.45s' },
  { key: 'c', label: 'Hộp 3', delay: '0.9s' },
]

/**
 * Ba hộp quà lắc nhẹ, mỗi hộp lệch pha một chút cho đỡ đều như máy. Đây chỉ là
 * hình minh hoạ ở trang chủ — hộp thật do `PrizeBoxes` xáo lúc trao quà.
 */
function PrizeTeaser() {
  return (
    <ul className="flex list-none flex-wrap justify-center gap-6 p-0">
      {BOXES.map(({ key, label, delay }) => (
        <li
          key={key}
          className="animate-wobble border-accent-border flex size-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed sm:size-32"
          style={{ animationDelay: delay }}
        >
          <Gift
            className="text-text-h size-10 shrink-0"
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
