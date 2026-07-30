import { useCallback, useMemo, useState } from 'react'
import { QuizModel } from '../models/QuizModel.js'
import { questionRepository } from '../models/QuestionRepository.js'

/**
 * Controller: nhận sự kiện từ view, gọi model, đẩy state mới xuống view.
 * Không chứa luật chơi (nằm ở QuizModel) và không chứa JSX (nằm ở views).
 */
export function useQuizController() {
  const [quiz, setQuiz] = useState(() =>
    QuizModel.create(questionRepository.findAll()),
  )

  const selectAnswer = useCallback((optionIndex) => {
    setQuiz((current) => current.answer(optionIndex))
  }, [])

  const goNext = useCallback(() => {
    setQuiz((current) => current.next())
  }, [])

  const restart = useCallback(() => {
    setQuiz((current) => current.restart())
  }, [])

  // View chỉ đọc những gì nó cần, không tự tính toán.
  const state = useMemo(
    () => ({
      question: quiz.currentQuestion,
      questionNumber: quiz.index + 1,
      total: quiz.total,
      pickedIndex: quiz.pickedIndex,
      isRevealed: quiz.isRevealed,
      isFinished: quiz.isFinished,
      isLastQuestion: quiz.isLastQuestion,
      isPerfect: quiz.isPerfect,
      score: quiz.score,
      progress: quiz.isFinished ? 100 : quiz.progress,
    }),
    [quiz],
  )

  return { ...state, selectAnswer, goNext, restart }
}
