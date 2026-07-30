/**
 * Controller của bàn điều khiển (A3) — nơi phát ra mọi ý định điều khiển trận đấu.
 *
 * Chốt câu khi hết giờ **không** nằm ở đây nữa: máy chủ làm, vì chỉ được có một
 * đồng hồ và trận đấu không được treo khi admin khoá màn hình.
 *
 * Public API: useLiveController()
 */
import { useCallback, useMemo } from 'react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { useNow } from '@common/session/controllers/useNow.js'
import { useSession } from '@common/session/controllers/useSession.js'

/** Link người chơi quét QR để vào — cũng là URL đem in ra mã QR ở Phase 6. */
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
      /** Nhiều người cùng hạng nhất thì admin phải tự chọn ai nhận quà. */
      topRows: leaderboard.topRows,
      hasTieAtTop: leaderboard.hasTieAtTop,
      winnerName: session.winner?.name ?? null,
      pickedPrize: session.prizeBoxes?.pickedPrize ?? null,
    }
  }, [session, now, isOffline])

  return { ...state, start, reveal, goNext, announceWinner, cancel, reset }
}
