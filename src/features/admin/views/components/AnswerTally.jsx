import { Check } from 'lucide-react'

/**
 * Phân bố lựa chọn của câu hiện tại.
 * Cột của đáp án đúng đổ đen, các cột khác đổ xám, và có thêm icon để không
 * phải dựa vào độ đậm mới đọc được.
 */
function AnswerTally({ question, distribution, playerCount }) {
  return (
    <ul className="flex flex-col gap-3">
      {question.options.map((option, i) => {
        const count = distribution[i] ?? 0
        const percent = playerCount > 0 ? (count / playerCount) * 100 : 0
        const isAnswer = question.isCorrect(i)

        return (
          <li key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono text-xs">{question.labelOf(i)}</span>
              <span className={`flex-1 ${isAnswer ? 'text-text-h font-medium' : ''}`}>
                {option}
              </span>
              {isAnswer && (
                <Check
                  className="size-4 shrink-0"
                  strokeWidth={2.5}
                  aria-label="Đáp án đúng"
                />
              )}
              <span className="font-mono tabular-nums">{count}</span>
            </div>

            <div className="bg-code-bg h-2 w-full overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isAnswer ? 'bg-accent' : 'bg-neutral-400'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default AnswerTally
