/**
 * Controller của bàn điều khiển (A3) — nơi **duy nhất** được đổi trạng thái phiên.
 *
 * Nó cũng là nơi tự chốt câu khi hết giờ: chỉ một máy được làm việc này, nếu để
 * player và display cũng tự chốt thì mỗi máy sẽ chốt ở một thời điểm khác nhau.
 *
 * Public API: useLiveController()
 */
import { useCallback, useEffect, useMemo } from 'react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { useNow } from '@common/session/controllers/useNow.js'
import { useSession } from '@common/session/controllers/useSession.js'

/** Link người chơi quét QR để vào — cũng là URL đem in ra mã QR ở Phase 6. */
function joinUrl() {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#${ROUTES.PLAY}`
}

export function useLiveController() {
  const { session, update } = useSession()
  const now = useNow(session.isCounting)

  useEffect(() => {
    if (session.isCounting && session.isTimeUp(now)) {
      update((current) => current.reveal())
    }
  }, [session, now, update])

  const start = useCallback(
    () => update((current) => current.start(Date.now())),
    [update],
  )
  const reveal = useCallback(() => update((current) => current.reveal()), [update])
  const goNext = useCallback(
    () => update((current) => current.next(Date.now())),
    [update],
  )
  const announceWinner = useCallback(
    (winnerId) => update((current) => current.announceWinner(winnerId)),
    [update],
  )
  const cancel = useCallback(() => update((current) => current.cancel()), [update])
  const reset = useCallback(() => update((current) => current.reset()), [update])

  const state = useMemo(() => {
    const leaderboard = session.leaderboard

    return {
      state: session.state,
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
  }, [session, now])

  return { ...state, start, reveal, goNext, announceWinner, cancel, reset }
}
