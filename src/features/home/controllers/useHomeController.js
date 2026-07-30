/**
 * Controller của trang chủ.
 *
 * Trang chủ chỉ *đọc* phiên chơi, không gửi intent nào: nó cần biết có trận nào
 * đang mở không để hiện đúng lời mời ("Vào phòng chờ" khác hẳn "Chưa có trận
 * nào"). Vì vậy hook này bọc `useSession` rồi làm phẳng thành vài cờ mà view
 * dùng trực tiếp, không để view tự đọc `session.state`.
 *
 * Public API: useHomeController() → { isOpen, isPlaying, playerCount, quizTitle,
 * statusLabel, isOffline }
 */
import { useMemo } from 'react'
import { useSession } from '@common/session/controllers/useSession.js'
import { SESSION_STATES } from '@common/session/models/SessionModel.js'

const STATUS_LABELS = {
  [SESSION_STATES.IDLE]: 'Chưa có trận nào đang mở',
  [SESSION_STATES.LOBBY]: 'Phòng chờ đang mở',
  [SESSION_STATES.QUESTION]: 'Trận đang diễn ra',
  [SESSION_STATES.REVEAL]: 'Trận đang diễn ra',
  [SESSION_STATES.PODIUM]: 'Đang vinh danh',
  [SESSION_STATES.PRIZE]: 'Đang trao quà',
  [SESSION_STATES.PRIZE_REVEALED]: 'Đã trao quà xong',
}

export function useHomeController() {
  const { session, isOffline } = useSession()

  return useMemo(
    () => ({
      /** Có phiên để vào — người mới quét QR lúc này là vào được. */
      isOpen: !session.isIdle,
      isPlaying: session.state === SESSION_STATES.QUESTION,
      playerCount: session.playerCount,
      quizTitle: session.quiz?.title ?? null,
      statusLabel: STATUS_LABELS[session.state],
      isOffline,
    }),
    [session, isOffline],
  )
}
