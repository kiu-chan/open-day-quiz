import { Check } from 'lucide-react'
import QuizImage from '@common/views/QuizImage.jsx'

/**
 * One option tile on the projector. `border-4` and very large text so it reads
 * from the back row; at reveal the correct tile gets a fill and a check mark
 * while the rest fade back.
 */
function BigOption({ label, text, image, isRevealed, isAnswer, count }) {
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

      {image && (
        <QuizImage
          src={image}
          alt={text || `Option ${label}`}
          className={text ? 'h-24 w-28 shrink-0' : 'h-40 flex-1'}
        />
      )}
      {text && <span className="flex-1">{text}</span>}

      {isRevealed && (
        <span className="font-mono tabular-nums">{count}</span>
      )}
      {isRevealed && isAnswer && (
        <Check className="size-9 shrink-0" strokeWidth={2.5} aria-label="Correct answer" />
      )}
    </li>
  )
}

export default BigOption
