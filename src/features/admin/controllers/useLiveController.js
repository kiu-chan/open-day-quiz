/**
 * Controller of the control desk (A3) — where every game-control intent comes
 * from.
 *
 * Closing a question when time is up is **not** here any more: the server does
 * it, because there must be exactly one clock and the game must not hang when
 * the admin locks their screen.
 *
 * Public API: useLiveController()
 */
import { useCallback, useMemo } from 'react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { useNow } from '@common/session/controllers/useNow.js'
import { useSession } from '@common/session/controllers/useSession.js'

/** The link players scan to join — also the URL printed into the QR code in Phase 6. */
function joinUrl() {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#${ROUTES.PLAY}`
}

export function useLiveController() {
  const { session, isOffline, send } = useSession()
  const now = useNow(session.isCounting)

  const start = useCallback(() => send({ type: 'start' }), [send])
  const reveal = useCallback(() => send({ type: 'reveal' }), [send])
  const goNext = useCallback(() => send({ type: 'next' }), [send])
  const announceWinner = useCallback(
    (winnerId) => send({ type: 'announceWinner', winnerId }),
    [send],
  )
  const cancel = useCallback(() => send({ type: 'cancel' }), [send])
  const reset = useCallback(() => send({ type: 'reset' }), [send])

  const state = useMemo(() => {
    const leaderboard = session.leaderboard

    return {
      state: session.state,
      isOffline,
      quiz: session.quiz,
      question: session.currentQuestion,
      questionNumber: session.questionNumber,
      total: session.total,
      isLastQuestion: session.isLastQuestion,
      progress: session.progress,
      secondsLeft: session.remainingSeconds(now),
      players: session.players,
      playerCount: session.playerCount,
      answeredCount: session.answeredCount,
      distribution: session.currentDistribution,
      joinUrl: joinUrl(),
      leaderboardRows: leaderboard.rows,
      /** Several people sharing first place means the admin picks who gets the prize. */
      topRows: leaderboard.topRows,
      hasTieAtTop: leaderboard.hasTieAtTop,
      winnerName: session.winner?.name ?? null,
      pickedPrize: session.prizeBoxes?.pickedPrize ?? null,
    }
  }, [session, now, isOffline])

  return { ...state, start, reveal, goNext, announceWinner, cancel, reset }
}
