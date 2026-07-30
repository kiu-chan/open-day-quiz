/**
 * Controller của màn hình lớn (D1–D5). Chỉ đọc: máy chiếu không bấm gì cả,
 * mọi thay đổi trạng thái đến từ bàn điều khiển của admin.
 *
 * Public API: useDisplayController()
 */
import { useMemo } from 'react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { useNow } from '@common/session/controllers/useNow.js'
import { useSession } from '@common/session/controllers/useSession.js'

export function useDisplayController() {
  const { session } = useSession()
  const now = useNow(session.isCounting)

  return useMemo(() => {
    const leaderboard = session.leaderboard

    return {
      state: session.state,
      quiz: session.quiz,
      question: session.currentQuestion,
      questionNumber: session.questionNumber,
      total: session.total,
      progress: session.progress,
      secondsLeft: session.remainingSeconds(now),
      playerCount: session.playerCount,
      answeredCount: session.answeredCount,
      distribution: session.currentDistribution,
      joinUrl: `${window.location.origin}${window.location.pathname}#${ROUTES.PLAY}`,
      leaderboardRows: leaderboard.rows,
      topRows: leaderboard.top,
      winnerName: session.winner?.name ?? null,
      prizeBoxes: session.prizeBoxes,
    }
  }, [session, now])
}
