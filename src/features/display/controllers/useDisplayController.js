/**
 * Controller of the big screen (D1–D5). Read-only: nobody clicks anything on the
 * projector, every state change comes from the admin's control desk.
 *
 * Public API: useDisplayController()
 */
import { useMemo } from 'react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { useNow } from '@common/session/controllers/useNow.js'
import { useSession } from '@common/session/controllers/useSession.js'

export function useDisplayController() {
  const { session, isOffline } = useSession()
  const now = useNow(session.isCounting)

  return useMemo(() => {
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
      winnerName: session.winner?.name ?? null,
      winnerAvatarId: session.winner?.avatarId ?? null,
      prizeBoxes: session.prizeBoxes,
    }
  }, [session, now, isOffline])
}
