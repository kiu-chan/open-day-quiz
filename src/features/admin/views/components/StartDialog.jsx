import { Play, Users, X } from 'lucide-react'
import Button from '@common/views/Button.jsx'

/**
 * The confirmation asked before the round starts. Starting closes the lobby for
 * good — anyone still on the join form is left out and nobody can change their
 * name or animal afterwards — so the host gets one look at who is in before the
 * first question goes up on the big screen.
 */
function StartDialog({ quiz, playerCount, isAuto, onConfirm, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Start the round"
      onClick={onClose}
      className="bg-bg/90 fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur"
    >
      {/* The card swallows the click so only the backdrop closes the dialog. */}
      <div
        onClick={(event) => event.stopPropagation()}
        className="border-border bg-bg animate-rise flex w-full max-w-md flex-col gap-5 rounded-2xl border-2 p-6"
      >
        <h2 className="text-text-h flex items-center gap-2.5 text-xl font-semibold tracking-tight">
          <Play className="size-5 shrink-0" aria-hidden="true" />
          Start the round?
        </h2>

        <div className="border-border flex flex-col gap-1 rounded-xl border border-dashed p-3">
          <p className="text-text-h text-base font-medium">
            {quiz.title.trim() || 'Untitled quiz'}
          </p>
          <p className="flex items-center gap-1.5 font-mono text-xs">
            <Users className="size-3.5 shrink-0" aria-hidden="true" />
            {playerCount} players · {quiz.total} questions ·{' '}
            {quiz.winnerCount === 1 ? '1 winner' : `${quiz.winnerCount} winners`}
          </p>
        </div>

        <p className="text-sm">
          The first question goes up on the big screen straight away. Latecomers
          can no longer join, and nobody can change their name or animal.
          {isAuto && ' Auto is on — the round then runs itself to the results.'}
        </p>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="quiet" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            <Play className="size-4" aria-hidden="true" />
            Start
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StartDialog
