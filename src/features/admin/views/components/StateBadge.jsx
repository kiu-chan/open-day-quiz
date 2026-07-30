import { SESSION_STATES } from '@common/session/models/SessionModel.js'

const LABELS = {
  [SESSION_STATES.IDLE]: 'No session open',
  [SESSION_STATES.LOBBY]: 'Waiting for players',
  [SESSION_STATES.QUESTION]: 'Answering',
  [SESSION_STATES.REVEAL]: 'Answer revealed',
  [SESSION_STATES.PODIUM]: 'Results',
  [SESSION_STATES.PRIZE]: 'Choosing a prize box',
  [SESSION_STATES.PRIZE_REVEALED]: 'Prize opened',
}

/**
 * A closed session gets a dashed border; a running one gets a solid, heavier
 * border plus a pulsing dot — the familiar "on air" cue, without needing colour.
 */
function StateBadge({ state }) {
  const isIdle = state === SESSION_STATES.IDLE
  const tone = isIdle
    ? 'border-border border-dashed'
    : 'border-accent-border text-text-h font-medium'

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-xs tracking-wide uppercase ${tone}`}
    >
      {!isIdle && (
        <span
          className="bg-accent size-2 shrink-0 animate-pulse rounded-full"
          aria-hidden="true"
        />
      )}
      {LABELS[state]}
    </span>
  )
}

export default StateBadge
