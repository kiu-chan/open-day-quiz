/**
 * Controller of the big screen (D1–D5). It reads the session and draws it; the
 * one thing it can change is **starting the round** from the lobby, so whoever
 * stands at the screen can kick off without walking back to the laptop. Every
 * other step still comes from the control desk.
 *
 * `start` is the same intent the admin sends — the server applies the same
 * SessionModel rule, so a stray second click starts nothing twice.
 *
 * Public API: useDisplayController()
 */
import { useCallback, useMemo } from 'react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { useNow } from '@common/session/controllers/useNow.js'
import { useSession } from '@common/session/controllers/useSession.js'

export function useDisplayController() {
  const { session, isOffline, send } = useSession()
  const now = useNow(session.isCounting)

  const start = useCallback(() => send({ type: 'start' }), [send])

  const state = useMemo(() => {
    const leaderboard = session.leaderboard

    return {
      state: session.state,
      isOffline,
      quiz: session.quiz,
      question: session.currentQuestion,
      questionNumber: session.questionNumber,
      total: session.total,
      progress: session.progress,
      secondsLeft: session.remainingSeconds(now),
      playerCount: session.playerCount,
      players: session.players,
      answeredCount: session.answeredCount,
      distribution: session.currentDistribution,
      joinUrl: `${window.location.origin}${window.location.pathname}#${ROUTES.PLAY}`,
      leaderboardRows: leaderboard.rows,
      topRows: leaderboard.top,
      /** The top ten with the move each player just made — drawn at the reveal. */
      standings: session.standings,
      winnerName: session.winner?.name ?? null,
      winnerAvatarId: session.winner?.avatarId ?? null,
      prizeBoxes: session.prizeBoxes,
    }
  }, [session, now, isOffline])

  return { ...state, start }
}
