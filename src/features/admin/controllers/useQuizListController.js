/**
 * Controller of the quiz list page (A1): reads the list from the repository and
 * opens a game session from one quiz.
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
   * Open a session. The quiz lives in the admin machine's localStorage, so its
   * whole content has to be sent to the server — the server has no way to read
   * it on its own.
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
