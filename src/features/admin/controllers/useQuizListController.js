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
  const { session, send } = useSession()
  const [quizzes, setQuizzes] = useState(() => quizRepository.findAll())

  const reload = useCallback(() => setQuizzes(quizRepository.findAll()), [])

  /**
   * Mở phiên. Bộ quiz nằm trong localStorage của máy admin nên phải gửi cả nội
   * dung nó lên máy chủ — máy chủ không có cách nào tự đọc được.
   */
  const openSession = useCallback(
    (quiz) => {
      send({ type: 'openLobby', quiz: quiz.toJSON() })
      navigate(ROUTES.ADMIN_LIVE)
    },
    [send],
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
