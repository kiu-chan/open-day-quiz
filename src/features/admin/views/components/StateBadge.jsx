import { SESSION_STATES } from '@common/session/models/SessionModel.js'

const LABELS = {
  [SESSION_STATES.IDLE]: 'Chưa mở phiên',
  [SESSION_STATES.LOBBY]: 'Đang chờ người chơi',
  [SESSION_STATES.QUESTION]: 'Đang trả lời',
  [SESSION_STATES.REVEAL]: 'Đã lộ đáp án',
  [SESSION_STATES.PODIUM]: 'Vinh danh',
  [SESSION_STATES.PRIZE]: 'Chọn hộp quà',
  [SESSION_STATES.PRIZE_REVEALED]: 'Đã mở quà',
}

/** Phiên chưa mở thì viền nét đứt; đang chạy thì viền liền, đậm. */
function StateBadge({ state }) {
  const isIdle = state === SESSION_STATES.IDLE
  const tone = isIdle
    ? 'border-border border-dashed'
    : 'border-text-h text-text-h font-medium'

  return (
    <span
      className={`rounded-full border-2 px-3 py-1 text-xs tracking-wide uppercase ${tone}`}
    >
      {LABELS[state]}
    </span>
  )
}

export default StateBadge
