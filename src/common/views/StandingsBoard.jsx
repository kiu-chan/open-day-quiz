import { ChevronDown, ChevronUp, Minus, Trophy } from 'lucide-react'
import PlayerAvatar from './PlayerAvatar.jsx'
import ScoreCounter from './ScoreCounter.jsx'

/**
 * The top ten shown after each question, with the move each player just made.
 *
 * It is a separate component from `LeaderboardTable` and not a variant of it,
 * because it draws something the table cannot: the rows are **positioned by
 * hand** so each one can travel from the place it held before this question to
 * the place it holds now. That needs a fixed row height and absolute
 * positioning, which the plain table has no use for.
 *
 * The sequence is three beats, and it reads as a change only in that order: the
 * board appears in its **old** order, the scores tick up, and then the rows
 * slide past each other. The waiting is done by CSS delays (`animate-rank-slide`
 * in index.css, `COUNT_DELAY_MS` here), not by timers in a controller, so every
 * surface plays it identically the moment the reveal snapshot arrives.
 *
 * Never colour: a move is written as a chevron plus the number of places, with
 * the old rank spelled out underneath.
 */

/** Rows are placed by hand, so their height has to be a number, not a class. */
const VARIANTS = {
  compact: {
    rowHeight: 52,
    gap: 8,
    row: 'gap-2 px-2 text-sm',
    rank: 'w-5 text-sm',
    trophy: 'size-4',
    move: 'w-11 text-xs',
    moveIcon: 'size-4',
    was: 'text-[0.625rem]',
    avatar: 'size-8',
    score: 'text-sm',
  },
  display: {
    // Ten rows plus a heading have to fit a projector without scrolling, which
    // is what caps the height rather than how big the type could be.
    rowHeight: 56,
    gap: 8,
    row: 'gap-4 px-5 text-2xl',
    rank: 'w-9 text-2xl',
    trophy: 'size-7',
    move: 'w-20 text-xl',
    moveIcon: 'size-6',
    was: 'text-sm',
    avatar: 'size-10',
    score: 'text-2xl',
  },
}

/** The scores start climbing well before the rows move — see the block comment. */
const COUNT_DELAY_MS = 150

/** How many places this player gained or lost, and where they came from. */
function Move({ delta, previousRank, size }) {
  // Nobody to compare against: a latecomer, or the first scored question.
  if (delta === null) return <span className={`shrink-0 ${size.move}`} />

  const Icon = delta > 0 ? ChevronUp : delta < 0 ? ChevronDown : Minus
  const label =
    delta > 0
      ? `Up ${delta}, was ${previousRank}`
      : delta < 0
        ? `Down ${-delta}, was ${previousRank}`
        : `Unchanged, still ${previousRank}`

  return (
    <span
      className={`flex shrink-0 flex-col items-center leading-tight ${size.move}`}
    >
      <span className="flex items-center">
        <Icon className={size.moveIcon} strokeWidth={2.5} aria-label={label} />
        {delta !== 0 && (
          <span className="font-mono tabular-nums">{Math.abs(delta)}</span>
        )}
      </span>
      <span className={`font-mono opacity-60 ${size.was}`} aria-hidden="true">
        was {previousRank}
      </span>
    </span>
  )
}

function StandingsRow({ row, index, fromIndex, size, isMine }) {
  const step = size.rowHeight + size.gap
  const isFirst = row.rank === 1
  const tone = isFirst
    ? 'border-text-h border-2 font-medium'
    : isMine
      ? 'border-text-h border'
      : 'border-border border'

  return (
    <li
      className="animate-rank-slide absolute inset-x-0 top-0"
      style={{
        height: `${size.rowHeight}px`,
        '--rank-from': `${fromIndex * step}px`,
        '--rank-to': `${index * step}px`,
      }}
    >
      {/* Opaque on purpose: two rows swapping places pass over each other. */}
      <div
        className={`text-text-h bg-bg animate-rise flex h-full items-center rounded-xl ${size.row} ${tone}`}
        style={{ animationDelay: `${index * 0.04}s` }}
      >
        <span className={`shrink-0 font-mono tabular-nums ${size.rank}`}>
          {row.rank}
        </span>
        <Move
          delta={row.rankDelta}
          previousRank={row.previousRank}
          size={size}
        />
        {isFirst && (
          <Trophy
            className={`${size.trophy} shrink-0`}
            strokeWidth={2}
            aria-label="First place"
          />
        )}
        <PlayerAvatar avatarId={row.avatarId} className={size.avatar} />
        <span className="flex-1 truncate">{row.name}</span>
        <ScoreCounter
          from={row.previousScore}
          to={row.score}
          delayMs={COUNT_DELAY_MS}
          className={`shrink-0 ${size.score}`}
        />
      </div>
    </li>
  )
}

function StandingsBoard({ rows, variant = 'compact', highlightId }) {
  const size = VARIANTS[variant]

  if (rows.length === 0) {
    return <p className="text-sm opacity-60">Nobody has scored yet.</p>
  }

  return (
    <ol
      className="relative w-full"
      style={{ height: `${rows.length * (size.rowHeight + size.gap) - size.gap}px` }}
    >
      {rows.map((row, index) => (
        <StandingsRow
          key={row.playerId}
          row={row}
          index={index}
          // Somebody arriving from outside the ten starts one row below the
          // last visible one, so they climb in from the edge of the board.
          fromIndex={Math.min(row.previousIndex ?? rows.length, rows.length)}
          size={size}
          isMine={row.playerId === highlightId}
        />
      ))}
    </ol>
  )
}

export default StandingsBoard
