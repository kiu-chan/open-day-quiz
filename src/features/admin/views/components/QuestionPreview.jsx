import { Check } from 'lucide-react'
import QuizImage from '@common/views/QuizImage.jsx'

/** Câu hỏi nhìn từ phía admin: đáp án đúng luôn được đánh dấu sẵn. */
function QuestionPreview({ question }) {
  return (
    <div className="flex flex-col gap-4">
      {question.prompt && (
        <h2 className="text-text-h text-2xl leading-snug font-semibold">
          {question.prompt}
        </h2>
      )}

      <QuizImage
        src={question.image}
        alt="Ảnh của câu hỏi"
        className="max-h-40 w-auto self-start"
      />

      <ul className="grid list-none gap-2 p-0 sm:grid-cols-2">
        {question.options.map((option, i) => (
          <li
            key={i}
            className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm ${
              question.isCorrect(i)
                ? 'border-accent-border text-text-h font-semibold'
                : 'border-border border-dashed'
            }`}
          >
            <span className="w-4 shrink-0 font-mono text-xs">
              {question.labelOf(i)}
            </span>
            <QuizImage
              src={question.imageOf(i)}
              alt={option || `Đáp án ${question.labelOf(i)}`}
              className="size-12 shrink-0"
            />
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
