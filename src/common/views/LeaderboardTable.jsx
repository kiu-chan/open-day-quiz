import { Trophy } from 'lucide-react'

const SIZES = {
  compact: { row: 'gap-3 px-3 py-2 text-sm', rank: 'w-6 text-xs', icon: 'size-4' },
  display: {
    row: 'gap-6 px-6 py-4 text-2xl lg:text-3xl',
    rank: 'w-10 text-xl',
    icon: 'size-8',
  },
}

/**
 * Bảng xếp hạng. Hạng nhất viền dày và có cúp; dòng của chính mình được đánh
 * dấu bằng viền liền đậm — không dùng màu để phân biệt.
 * Hai cỡ: `compact` cho điện thoại và admin, `display` cho máy chiếu.
 */
function LeaderboardTable({ rows, variant = 'compact', highlightId }) {
  const size = SIZES[variant]

  if (rows.length === 0) {
    return <p className="text-sm opacity-60">Chưa có ai ghi điểm.</p>
  }

  return (
    <ol className="flex w-full flex-col gap-2">
      {rows.map((row) => {
        const isWinner = row.rank === 1
        const isMine = row.playerId === highlightId
        const tone = isWinner
          ? 'border-text-h border-2 font-medium'
          : isMine
            ? 'border-text-h border'
            : 'border-border border'

        return (
          <li
            key={row.playerId}
            className={`text-text-h flex items-center rounded-xl ${size.row} ${tone}`}
          >
            <span className={`font-mono shrink-0 tabular-nums ${size.rank}`}>
              {row.rank}
            </span>
            {isWinner && (
              <Trophy
                className={`${size.icon} shrink-0`}
                strokeWidth={2}
                aria-label="Hạng nhất"
              />
            )}
            <span className="flex-1 truncate">{row.name}</span>
            <span className="font-mono shrink-0 tabular-nums">{row.score}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default LeaderboardTable
