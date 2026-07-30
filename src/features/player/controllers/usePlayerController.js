/**
 * Controller của màn hình người chơi (P1–P6).
 *
 * Danh tính người chơi lưu ở localStorage: điện thoại rất dễ bị tắt màn hình
 * hoặc refresh giữa trận, vào lại phải nhận đúng người cũ chứ không tạo người
 * mới — nếu không, điểm của họ biến mất và leaderboard đầy tên trùng.
 *
 * Public API: usePlayerController()
 */
import { useCallback, useMemo, useState } from 'react'
import { newId } from '@common/ids.js'
import { useNow } from '@common/session/controllers/useNow.js'
import { useSession } from '@common/session/controllers/useSession.js'

const IDENTITY_KEY = 'open-day-quiz:player'

function loadIdentity() {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function usePlayerController() {
  const { session, update } = useSession()
  const [identity, setIdentity] = useState(loadIdentity)
  const now = useNow(session.isCounting)

  const me = identity ? session.findPlayer(identity.id) : null

  const join = useCallback(
    (name) => {
      const trimmed = name.trim()
      if (trimmed.length === 0) return

      const next = { id: identity?.id ?? newId('nguoi'), name: trimmed }
      localStorage.setItem(IDENTITY_KEY, JSON.stringify(next))
      setIdentity(next)
      update((current) => current.join({ ...next, joinedAt: Date.now() }))
    },
    [identity, update],
  )

  const answer = useCallback(
    (optionIndex) => {
      if (!identity) return
      update((current) =>
        current.submitAnswer({
          playerId: identity.id,
          optionIndex,
          now: Date.now(),
        }),
      )
    },
    [identity, update],
  )

  const pickBox = useCallback(
    (index) => {
      if (!identity) return
      update((current) => current.pickBox({ playerId: identity.id, index }))
    },
    [identity, update],
  )

  const state = useMemo(() => {
    const leaderboard = session.leaderboard

    return {
      sessionState: session.state,
      hasJoined: me !== null,
      /** Tên đã nhập lần trước, để phiên sau khỏi phải gõ lại. */
      name: me?.name ?? identity?.name ?? '',
      playerCount: session.playerCount,
      question: session.currentQuestion,
      questionNumber: session.questionNumber,
      total: session.total,
      progress: session.progress,
      secondsLeft: session.remainingSeconds(now),
      myAnswer: identity ? session.currentAnswerOf(identity.id) : null,
      isCorrect: identity ? session.isCorrectOf(identity.id) : null,
      pointsThisQuestion: identity ? session.currentPointsOf(identity.id) : 0,
      myRow: identity ? leaderboard.rowOf(identity.id) : null,
      topRows: leaderboard.top,
      isWinner: identity !== null && session.winnerId === identity.id,
      winnerName: session.winner?.name ?? null,
      prizeBoxes: session.prizeBoxes,
    }
  }, [session, identity, me, now])

  return { ...state, join, answer, pickBox }
}
