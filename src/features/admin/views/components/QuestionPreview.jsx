import { Check } from 'lucide-react'

/** Câu hỏi nhìn từ phía admin: đáp án đúng luôn được đánh dấu sẵn. */
function QuestionPreview({ question, questionNumber, total }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-xs">
        Câu {questionNumber} / {total}
      </p>
      <h2 className="text-text-h text-xl leading-snug">{question.prompt}</h2>

      <ul className="flex flex-col gap-2">
        {question.options.map((option, i) => (
          <li
            key={i}
            className={`border-border flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
              question.isCorrect(i) ? 'border-text-h text-text-h font-medium' : ''
            }`}
          >
            <span className="font-mono text-xs">{question.labelOf(i)}</span>
            <span className="flex-1">{option}</span>
            {question.isCorrect(i) && (
              <Check
                className="size-4 shrink-0"
                strokeWidth={2.5}
                aria-label="Đáp án đúng"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default QuestionPreview
