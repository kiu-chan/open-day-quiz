/**
 * Controller của trang danh sách quiz (A1): đọc danh sách từ repository và mở
 * phiên chơi từ một bộ quiz.
 *
 * Public API: useQuizListController()
 */
import { useCallback, useState } from 'react'
import { navigate, ROUTES } from '@common/routing/useHashRoute.js'
import { useSession } from '@common/session/controllers/useSession.js'
import { quizRepository } from '../models/QuizRepository.js'

export function useQuizListController() {
  const { session, update } = useSession()
  const [quizzes, setQuizzes] = useState(() => quizRepository.findAll())

  const reload = useCallback(() => setQuizzes(quizRepository.findAll()), [])

  /**
   * Mở phiên: `reset()` trước để về idle, vì máy trạng thái chỉ cho mở lobby từ
   * idle — mở phiên mới đồng nghĩa huỷ phiên đang chạy.
   */
  const openSession = useCallback(
    (quiz) => {
      update((current) => current.reset().openLobby(quiz))
      navigate(ROUTES.ADMIN_LIVE)
    },
    [update],
  )

  const editQuiz = useCallback((id) => navigate(`/admin/quiz/${id}`), [])

  const createQuiz = useCallback(() => {
    const quiz = quizRepository.save(quizRepository.createEmpty())
    navigate(`/admin/quiz/${quiz.id}`)
  }, [])

  const duplicateQuiz = useCallback(
    (id) => {
      quizRepository.duplicate(id)
      reload()
    },
    [reload],
  )

  const removeQuiz = useCallback(
    (id) => {
      quizRepository.remove(id)
      reload()
    },
    [reload],
  )

  return {
    quizzes,
    isLive: !session.isIdle,
    openSession,
    editQuiz,
    createQuiz,
    duplicateQuiz,
    removeQuiz,
  }
}
