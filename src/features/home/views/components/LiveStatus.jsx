import { Users, WifiOff } from 'lucide-react'

/**
 * The live status strip in the hero. "A round is running" is shown with a solid
 * border plus a pulsing dot, "not open" with a dashed border — no colour used.
 */
function LiveStatus({ isOpen, statusLabel, playerCount, quizTitle, isOffline }) {
  if (isOffline) {
    return (
      <p className="border-border text-text inline-flex items-center gap-2 rounded-full border-2 border-dashed px-4 py-2 text-sm">
        <WifiOff className="size-4 shrink-0" aria-label="Disconnected" />
        Not connected to the game server yet
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p
        className={`inline-flex items-center gap-2.5 rounded-full border-2 px-4 py-2 text-sm ${
          isOpen
            ? 'border-accent-border text-text-h font-medium'
            : 'border-border border-dashed'
        }`}
      >
        <span
          className={`size-2.5 shrink-0 rounded-full ${
            isOpen ? 'bg-accent animate-pulse' : 'border-border border-2'
          }`}
          aria-hidden="true"
        />
        {statusLabel}
      </p>

      {isOpen && (
        <p className="text-text-h inline-flex items-center gap-2 text-sm">
          <Users className="size-4 shrink-0" aria-hidden="true" />
          {playerCount} joined
          {quizTitle && <span className="opacity-60">· {quizTitle}</span>}
        </p>
      )}
    </div>
  )
}

export default LiveStatus
