import { useState } from 'react'
import { Check, Gift, Trophy } from 'lucide-react'
import Button from '@common/views/Button.jsx'
import Panel from './Panel.jsx'

/**
 * Fills the last winning slots when the round cannot decide them itself: several
 * people sit on the very same score *and* the very same answering time across
 * the line between winning and not, so there are more candidates than prizes
 * left. The names that are safe whatever the host chooses are listed as already
 * won; the rest are tapped until the open slots are full.
 *
 * The selection is marked by a tick and a filled button, never by colour.
 */
function WinnerPicker({ settled, candidates, winnerCount, isAuto, onAnnounce }) {
  const [picked, setPicked] = useState([])

  const slots = winnerCount - settled.length
  const isPicked = (playerId) => picked.includes(playerId)

  const toggle = (playerId) =>
    setPicked((current) => {
      if (current.includes(playerId)) {
        return current.filter((id) => id !== playerId)
      }
      // Full is full: the last tap is ignored rather than pushing somebody out,
      // which would be a silent change the host never asked for.
      return current.length >= slots ? current : [...current, playerId]
    })

  // Announced in leaderboard order, not in the order the host happened to tap.
  const announce = () =>
    onAnnounce([
      ...settled.map((row) => row.playerId),
      ...candidates.filter((row) => isPicked(row.playerId)).map((row) => row.playerId),
    ])

  return (
    <Panel title="Choose who gets the last prizes" Icon={Gift} dashed>
      <p className="text-sm">
        {candidates.length} people are tied on both score and time, and there
        {slots === 1 ? ' is 1 prize' : ` are ${slots} prizes`} left to give —
        please pick {slots === 1 ? 'one' : slots}
        {isAuto && ' (auto mode will not choose for you)'}:
      </p>

      {settled.length > 0 && (
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <Trophy className="size-4 shrink-0" aria-hidden="true" />
          Already won:{' '}
          <span className="text-text-h font-semibold">
            {settled.map((row) => row.name).join(', ')}
          </span>
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {candidates.map((row) => (
          <Button
            key={row.playerId}
            variant={isPicked(row.playerId) ? 'primary' : 'secondary'}
            onClick={() => toggle(row.playerId)}
          >
            {isPicked(row.playerId) ? (
              <Check className="size-4" strokeWidth={2.5} aria-label="Picked" />
            ) : (
              <Trophy className="size-4" aria-hidden="true" />
            )}
            {row.name}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          disabled={picked.length !== slots}
          onClick={announce}
        >
          <Gift className="size-4" aria-hidden="true" />
          Announce the {winnerCount === 1 ? 'winner' : `${winnerCount} winners`}
        </Button>
        <span className="text-sm opacity-70">
          {picked.length} of {slots} picked.
        </span>
      </div>
    </Panel>
  )
}

export default WinnerPicker
