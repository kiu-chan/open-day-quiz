import AnswerOption from './AnswerOption.jsx'

function QuestionCard({
  question,
  questionNumber,
  total,
  pickedIndex,
  isRevealed,
  isLastQuestion,
  onPick,
  onNext,
}) {
  return (
    <section className="border-border bg-bg shadow-card flex flex-col gap-5 rounded-2xl border p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs">
          Câu {questionNumber} / {total}
        </p>
        <h2 className="text-text-h text-2xl leading-snug">{question.prompt}</h2>
      </div>

      <ul className="flex flex-col gap-2.5">
        {question.options.map((option, i) => (
          <li key={option}>
            <AnswerOption
              label={question.labelOf(i)}
              text={option}
              isRevealed={isRevealed}
              isAnswer={question.isCorrect(i)}
              isPicked={i === pickedIndex}
              onPick={() => onPick(i)}
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onNext}
        disabled={!isRevealed}
        className="bg-accent self-end rounded-lg px-5 py-2.5 text-sm font-medium text-white transition enabled:cursor-pointer enabled:hover:opacity-85 enabled:active:scale-95 disabled:opacity-30"
      >
        {isLastQuestion ? 'Xem kết quả' : 'Câu tiếp'}
      </button>
    </section>
  )
}

export default QuestionCard
