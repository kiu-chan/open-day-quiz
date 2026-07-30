import { useQuizController } from '../controllers/useQuizController.js'
import QuizHeader from './components/QuizHeader.jsx'
import ProgressBar from './components/ProgressBar.jsx'
import QuestionCard from './components/QuestionCard.jsx'
import ResultCard from './components/ResultCard.jsx'

/**
 * View cấp trang: lấy state + hành động từ controller rồi phân phối
 * cho các component con. Không tự tính toán luật chơi.
 */
function QuizPage() {
  const {
    question,
    questionNumber,
    total,
    pickedIndex,
    isRevealed,
    isFinished,
    isLastQuestion,
    isPerfect,
    score,
    progress,
    selectAnswer,
    goNext,
    restart,
  } = useQuizController()

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-12 text-left">
      <QuizHeader score={score} total={total} />
      <ProgressBar value={progress} />

      {isFinished ? (
        <ResultCard
          score={score}
          total={total}
          isPerfect={isPerfect}
          onRestart={restart}
        />
      ) : (
        <QuestionCard
          question={question}
          questionNumber={questionNumber}
          total={total}
          pickedIndex={pickedIndex}
          isRevealed={isRevealed}
          isLastQuestion={isLastQuestion}
          onPick={selectAnswer}
          onNext={goNext}
        />
      )}

      <p className="text-center text-xs opacity-60">
        Token từ <span className="font-mono">@theme</span> · giao diện đen trắng
      </p>
    </main>
  )
}

export default QuizPage
