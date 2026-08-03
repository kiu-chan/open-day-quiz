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
import { MIN_PLAYERS } from '@common/session/models/SessionModel.js'

/** The link players scan to join — also the URL printed into the QR code in Phase 6. */
function joinUrl() {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#${ROUTES.PLAY}`
}

export function useLiveController() {
  const { session, isOffline, send } = useSession()
  // Two things count down here: the question, and whichever step auto mode is
  // holding on screen (the revealed answer, then the standings).
  const now = useNow(session.isCounting || session.autoStepEndsAt !== null)

  const start = useCallback(() => send({ type: 'start' }), [send])
  const reveal = useCallback(() => send({ type: 'reveal' }), [send])
  const goNext = useCallback(() => send({ type: 'next' }), [send])
  const announceWinners = useCallback(
    (winnerIds) => send({ type: 'announceWinners', winnerIds }),
    [send],
  )
  const cancel = useCallback(() => send({ type: 'cancel' }), [send])
  const reset = useCallback(() => send({ type: 'reset' }), [send])
  const setAuto = useCallback(
    (enabled) => send({ type: 'setAutoAdvance', enabled }),
    [send],
  )

  const state = useMemo(() => {
    const leaderboard = session.leaderboard
    const winnerCount = session.winnerCount

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
      isAuto: session.autoAdvance,
      autoSecondsLeft: session.autoRemainingSeconds(now),
      players: session.players,
      playerCount: session.playerCount,
      canStart: session.canStart,
      minPlayers: MIN_PLAYERS,
      answeredCount: session.answeredCount,
      distribution: session.currentDistribution,
      joinUrl: joinUrl(),
      leaderboardRows: leaderboard.rows,
      standings: session.standings,
      /** How many people this round hands a prize to — the quiz decides. */
      winnerCount,
      /** The winners as the leaderboard sees them, before anyone is announced. */
      winnerRows: leaderboard.winnerRows(winnerCount),
      /**
       * A tie the round cannot settle: the winning line falls between people on
       * the same score *and* the same time, so the admin fills the last slots by
       * hand from `tiedRows`, on top of the `settledRows` that are safe anyway.
       */
      hasTie: leaderboard.hasTieAt(winnerCount),
      tiedRows: leaderboard.tiedRowsAt(winnerCount),
      settledRows: leaderboard.settledRows(winnerCount),
      /** One row per announced winner: their boxes, and whose turn it is. */
      prizeRows: session.prizeRows,
      pickingName: session.findPlayer(session.pickingPlayerId)?.name ?? null,
    }
  }, [session, now, isOffline])

  return {
    ...state,
    start,
    reveal,
    goNext,
    announceWinners,
    cancel,
    reset,
    setAuto,
  }
}
