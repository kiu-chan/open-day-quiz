import { Trophy } from 'lucide-react'
import PlayerAvatar from './PlayerAvatar.jsx'

const SIZES = {
  compact: {
    row: 'gap-3 px-3 py-2 text-sm',
    rank: 'w-6 text-xs',
    icon: 'size-4',
    avatar: 'size-7',
  },
  display: {
    row: 'gap-6 px-6 py-4 text-2xl lg:text-3xl',
    rank: 'w-10 text-xl',
    icon: 'size-8',
    avatar: 'size-14',
  },
}

/**
 * The leaderboard. First place gets a thick border and a trophy; your own row is
 * marked with a solid darker border — no colour used to tell them apart.
 * Two sizes: `compact` for phones and the admin, `display` for the projector.
 */
function LeaderboardTable({ rows, variant = 'compact', highlightId }) {
  const size = SIZES[variant]

  if (rows.length === 0) {
    return <p className="text-sm opacity-60">Nobody has scored yet.</p>
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
                aria-label="First place"
              />
            )}
            <PlayerAvatar avatarId={row.avatarId} className={size.avatar} />
            <span className="flex-1 truncate">{row.name}</span>
            <span className="font-mono shrink-0 tabular-nums">{row.score}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default LeaderboardTable
