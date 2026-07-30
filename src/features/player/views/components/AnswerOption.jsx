import { Check, CircleDot, X } from 'lucide-react'
import QuizImage from '@common/views/QuizImage.jsx'

/**
 * One answer tile on a phone. Tall tap target so it fits a finger.
 *
 * Four states told apart by icon, weight and border style — never colour:
 * unpicked (thin border), picked but not yet revealed (dark border + dot icon),
 * the correct answer (dark border + check mark), a wrong pick (dashed border +
 * strikethrough).
 * The border is always `border-2` so revealing the answer does not shift layout.
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
  image,
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

      {image && (
        <QuizImage
          src={image}
          alt={text || `Option ${label}`}
          // An image-only option needs a much bigger image — it is the entire
          // content of the answer.
          className={text ? 'size-16 shrink-0' : 'h-28 flex-1'}
        />
      )}
      {text && <span className="flex-1">{text}</span>}

      {isRevealed && isAnswer && (
        <Check className="size-5 shrink-0" strokeWidth={2.5} aria-label="Correct answer" />
      )}
      {isRevealed && isPicked && !isAnswer && (
        <X className="size-5 shrink-0" strokeWidth={2.5} aria-label="Your pick was wrong" />
      )}
      {!isRevealed && isPicked && (
        <CircleDot
          className="size-5 shrink-0"
          strokeWidth={2.5}
          aria-label="You picked this option"
        />
      )}
    </button>
  )
}

export default AnswerOption
