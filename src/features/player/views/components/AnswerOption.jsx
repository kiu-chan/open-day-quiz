import { Check, CircleDot, X } from 'lucide-react'

/**
 * Một ô đáp án trên điện thoại. Vùng bấm cao để vừa ngón tay.
 *
 * Bốn trạng thái phân biệt bằng icon, độ đậm và kiểu viền — không dùng màu:
 * chưa chọn (viền mảnh), đã chọn nhưng chưa lộ (viền đen + icon tròn),
 * đáp án đúng (viền đen + dấu ✓), chọn sai (viền nét đứt + gạch ngang).
 * Viền luôn `border-2` để lúc lộ đáp án không bị giật layout.
 */
function toneFor({ isRevealed, isAnswer, isPicked, isLocked }) {
  if (isRevealed) {
    if (isAnswer) return 'border-text-h bg-code-bg text-text-h font-medium'
    if (isPicked) return 'border-border border-dashed line-through'
    return 'border-border opacity-40'
  }
  if (isPicked) return 'border-text-h bg-code-bg text-text-h font-medium'
  if (isLocked) return 'border-border opacity-40'
  return 'border-border hover:border-accent-border hover:bg-accent-bg'
}

function AnswerOption({
  label,
  text,
  isPicked,
  isLocked,
  isRevealed,
  isAnswer,
  onPick,
}) {
  const tone = toneFor({ isRevealed, isAnswer, isPicked, isLocked })
  const isDisabled = isLocked || isRevealed

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={isDisabled}
      className={`flex w-full items-center gap-3 rounded-xl border-2 bg-transparent px-4 py-4 text-left text-base transition-colors duration-200 ${tone} ${
        isDisabled ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      <span className="border-border font-mono flex size-7 shrink-0 items-center justify-center rounded-md border text-xs">
        {label}
      </span>
      <span className="flex-1">{text}</span>

      {isRevealed && isAnswer && (
        <Check className="size-5 shrink-0" strokeWidth={2.5} aria-label="Đáp án đúng" />
      )}
      {isRevealed && isPicked && !isAnswer && (
        <X className="size-5 shrink-0" strokeWidth={2.5} aria-label="Bạn chọn sai" />
      )}
      {!isRevealed && isPicked && (
        <CircleDot
          className="size-5 shrink-0"
          strokeWidth={2.5}
          aria-label="Bạn đã chọn ô này"
        />
      )}
    </button>
  )
}

export default AnswerOption
