import { Check } from 'lucide-react'

/**
 * Một ô đáp án trên máy chiếu. Viền `border-4` và chữ rất to để đọc được từ
 * hàng ghế cuối; lúc lộ đáp án thì ô đúng đổ nền và có dấu ✓, các ô còn lại mờ đi.
 */
function BigOption({ label, text, isRevealed, isAnswer, count }) {
  const tone = !isRevealed
    ? 'border-border'
    : isAnswer
      ? 'border-text-h bg-code-bg text-text-h font-semibold'
      : 'border-border opacity-30'

  return (
    <li
      className={`flex items-center gap-5 rounded-2xl border-4 px-6 py-5 text-2xl lg:text-3xl ${tone}`}
    >
      <span className="font-mono text-xl opacity-70">{label}</span>
      <span className="flex-1">{text}</span>

      {isRevealed && (
        <span className="font-mono tabular-nums">{count}</span>
      )}
      {isRevealed && isAnswer && (
        <Check className="size-9 shrink-0" strokeWidth={2.5} aria-label="Đáp án đúng" />
      )}
    </li>
  )
}

export default BigOption
