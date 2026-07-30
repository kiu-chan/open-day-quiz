import { Timer } from 'lucide-react'

/**
 * Đồng hồ đếm ngược. Sắp hết giờ thì viền dày lên và chữ đậm hơn — không đổi
 * màu, để máy chiếu bạc màu và người mù màu vẫn thấy.
 * Cỡ chữ do nơi dùng quyết định (`className`); icon scale theo bằng `size-[1em]`.
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
