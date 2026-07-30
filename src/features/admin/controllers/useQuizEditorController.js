/**
 * Controller của trang soạn quiz (A2).
 *
 * Lưu ngay sau mỗi thay đổi thay vì có nút "Lưu": prototype không có hoàn tác,
 * và mất công gõ lại một bộ câu hỏi vì lỡ đóng tab thì rất phiền.
 *
 * Mọi luật sửa (bỏ đáp án thì correctIndex đi đâu, thời lượng tối thiểu, đổi
 * chỗ câu hỏi) nằm trong Quiz/Question — ở đây chỉ gọi lại.
 *
 * Public API: useQuizEditorController(quizId)
 */
import { useCallback, useState } from 'react'
import { newId } from '@common/ids.js'
import { Question } from '@common/session/models/Question.js'
import { quizRepository } from '../models/QuizRepository.js'

/** Câu hỏi mới: hai ô trống là mức tối thiểu cho một câu hợp lệ. */
function emptyQuestion() {
  return new Question({ id: newId('cau'), prompt: '', options: ['', ''] })
}

export function useQuizEditorController(quizId) {
  const [quiz, setQuiz] = useState(() => quizRepository.findById(quizId))

  const apply = useCallback(
    (mutate) => {
      if (!quiz) return
      const next = mutate(quiz)
      if (next === quiz) return

      quizRepository.save(next)
      setQuiz(next)
    },
    [quiz],
  )

  /** Sửa một câu hỏi tại chỗ: nhận câu cũ, trả về câu mới. */
  const editQuestion = useCallback(
    (index, mutate) =>
      apply((current) =>
        current.withQuestionAt(index, mutate(current.questions[index])),
      ),
    [apply],
  )

  const setTitle = useCallback(
    (title) => apply((current) => current.withTitle(title)),
    [apply],
  )

  const addQuestion = useCallback(() => {
    // Sinh id ngoài hàm mutate để không tạo hai id khác nhau khi React chạy lại.
    const question = emptyQuestion()
    apply((current) => current.withQuestionAdded(question))
  }, [apply])

  const duplicateQuestion = useCallback(
    (index) =>
      apply((current) => {
        const source = current.questions[index]
        return current.withQuestionAdded(source.with({ id: newId('cau') }))
      }),
    [apply],
  )

  const removeQuestion = useCallback(
    (index) => apply((current) => current.withQuestionRemoved(index)),
    [apply],
  )

  const moveQuestion = useCallback(
    (index, delta) => apply((current) => current.withQuestionMoved(index, delta)),
    [apply],
  )

  const setPrompt = useCallback(
    (index, prompt) => editQuestion(index, (question) => question.withPrompt(prompt)),
    [editQuestion],
  )

  const setOption = useCallback(
    (index, optionIndex, text) =>
      editQuestion(index, (question) => question.withOptionAt(optionIndex, text)),
    [editQuestion],
  )

  const setCorrect = useCallback(
    (index, optionIndex) =>
      editQuestion(index, (question) => question.withCorrect(optionIndex)),
    [editQuestion],
  )

  const setDuration = useCallback(
    (index, seconds) =>
      editQuestion(index, (question) => question.withDuration(seconds)),
    [editQuestion],
  )

  const addOption = useCallback(
    (index) => editQuestion(index, (question) => question.withOptionAdded()),
    [editQuestion],
  )

  const removeOption = useCallback(
    (index, optionIndex) =>
      editQuestion(index, (question) => question.withOptionRemoved(optionIndex)),
    [editQuestion],
  )

  return {
    quiz,
    notFound: quiz === null,
    errors: quiz?.errors ?? [],
    setTitle,
    addQuestion,
    duplicateQuestion,
    removeQuestion,
    moveQuestion,
    setPrompt,
    setOption,
    setCorrect,
    setDuration,
    addOption,
    removeOption,
  }
}
