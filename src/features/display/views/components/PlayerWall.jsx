import PlayerAvatar from '@common/views/PlayerAvatar.jsx'

/**
 * The people already in the lobby, on the projector: everyone's avatar with the
 * name under it. The point is that a visitor who has just joined can find
 * themselves on the big screen — so the newest arrivals come first and the
 * avatars move.
 *
 * Capped at 24. A hall can hold far more people than fit next to a QR code, and
 * a wall that wraps past the bottom of the screen would push the QR out of view;
 * the rest are counted in the "+N more" at the end.
 */
const MAX_SHOWN = 24

function PlayerWall({ players }) {
  if (players.length === 0) return null

  const shown = [...players].reverse().slice(0, MAX_SHOWN)
  const hidden = players.length - shown.length

  return (
    <ul className="flex max-w-5xl list-none flex-wrap items-start justify-center gap-4 p-0">
      {shown.map((player) => (
        <li
          key={player.id}
          className="animate-rise flex w-24 flex-col items-center gap-1"
        >
          <PlayerAvatar avatarId={player.avatarId} animate className="size-16" />
          <span className="text-text-h w-full truncate text-center text-base">
            {player.name}
          </span>
        </li>
      ))}

      {hidden > 0 && (
        <li className="border-border text-text-h flex size-16 items-center justify-center rounded-full border-2 border-dashed font-mono text-lg tabular-nums">
          +{hidden}
        </li>
      )}
    </ul>
  )
}

export default PlayerWall
