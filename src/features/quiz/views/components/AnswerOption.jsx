import { Check, X } from 'lucide-react'

/**
 * Một ô đáp án.
 * Đúng/sai phân biệt bằng icon, độ đậm chữ và kiểu viền — không dùng màu.
 * Viền luôn `border-2` ở mọi trạng thái để lúc lộ đáp án không bị giật layout.
 */
function toneFor({ isRevealed, isAnswer, isPicked }) {
  if (!isRevealed)
    return 'border-border hover:border-accent-border hover:bg-accent-bg'
  if (isAnswer) return 'border-text-h bg-code-bg text-text-h font-medium'
  if (isPicked) return 'border-border border-dashed line-through'
  return 'border-border opacity-40'
}

function AnswerOption({ label, text, isRevealed, isAnswer, isPicked, onPick }) {
  const tone = toneFor({ isRevealed, isAnswer, isPicked })

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={isRevealed}
      className={`flex w-full items-center gap-3 rounded-xl border-2 bg-transparent px-4 py-3 text-left text-[15px] transition-colors duration-200 ${tone} ${
        isRevealed ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      <span className="border-border font-mono flex size-6 shrink-0 items-center justify-center rounded-md border text-xs">
        {label}
      </span>
      <span className="flex-1">{text}</span>
      {isRevealed && isAnswer && (
        <Check
          className="size-5 shrink-0"
          strokeWidth={2.5}
          aria-label="Đáp án đúng"
        />
      )}
      {isRevealed && isPicked && !isAnswer && (
        <X
          className="size-5 shrink-0"
          strokeWidth={2.5}
          aria-label="Bạn chọn sai"
        />
      )}
    </button>
  )
}

export default AnswerOption
