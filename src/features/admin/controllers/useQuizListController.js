/**
 * Controller of the quiz list page (A1): reads the list from the repository and
 * opens a game session from one quiz.
 *
 * The repository talks to the server, so every action here is async: the page
 * gets `isLoading` for the first read and `error` for a server that cannot be
 * reached. Each write is followed by a reload rather than by patching the local
 * array — the server is the one that knows what is stored.
 *
 * Public API: useQuizListController()
 */
import { useCallback, useEffect, useState } from 'react'
import { navigate, ROUTES } from '@common/routing/useHashRoute.js'
import { useSession } from '@common/session/controllers/useSession.js'
import { quizRepository } from '../models/QuizRepository.js'

export function useQuizListController() {
  const { session, send } = useSession()
  const [quizzes, setQuizzes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    try {
      setQuizzes(await quizRepository.findAll())
    } catch (cause) {
      setError(cause.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  /** A write plus the reload that follows it, with one place to catch failures. */
  const write = useCallback(
    async (action) => {
      setError(null)
      try {
        await action()
      } catch (cause) {
        setError(cause.message)
        return
      }
      await reload()
    },
    [reload],
  )

  /**
   * Open a session. The whole quiz travels to the server even though the server
   * already stores it: the session keeps its own copy, so editing a quiz while a
   * round is running cannot disturb the round.
   */
  const openSession = useCallback(
    (quiz) => {
      send({ type: 'openLobby', quiz: quiz.toJSON() })
      navigate(ROUTES.ADMIN_LIVE)
    },
    [send],
  )

  const editQuiz = useCallback((id) => navigate(`/admin/quiz/${id}`), [])

  const createQuiz = useCallback(async () => {
    setError(null)
    try {
      const quiz = await quizRepository.save(quizRepository.createEmpty())
      navigate(`/admin/quiz/${quiz.id}`)
    } catch (cause) {
      setError(cause.message)
    }
  }, [])

  const duplicateQuiz = useCallback(
    (id) => write(() => quizRepository.duplicate(id)),
    [write],
  )

  const removeQuiz = useCallback(
    (id) => write(() => quizRepository.remove(id)),
    [write],
  )

  return {
    quizzes,
    isLoading,
    error,
    isLive: !session.isIdle,
    openSession,
    editQuiz,
    createQuiz,
    duplicateQuiz,
    removeQuiz,
  }
}
