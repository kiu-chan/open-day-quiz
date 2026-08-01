import { Check, LoaderCircle, Save, TriangleAlert, X } from 'lucide-react'
import Button from '@common/views/Button.jsx'

/**
 * The confirmation asked before a quiz is written to the server, and the receipt
 * shown afterwards. Saving overwrites the copy every session is opened from, so
 * it states what is about to be written and then whether it landed — the icon
 * carries the outcome, never a colour.
 */
function SaveDialog({ quiz, state, onConfirm, onClose }) {
  const isSaving = state === 'saving'
  const isDone = state === 'saved'
  const isError = state === 'error'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Save this quiz"
      onClick={isSaving ? undefined : onClose}
      className="bg-bg/90 fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur"
    >
      {/* The card swallows the click so only the backdrop closes the dialog. */}
      <div
        onClick={(event) => event.stopPropagation()}
        className="border-border bg-bg animate-rise flex w-full max-w-md flex-col gap-5 rounded-2xl border-2 p-6"
      >
        <h2 className="text-text-h flex items-center gap-2.5 text-xl font-semibold tracking-tight">
          {isDone ? (
            <Check className="size-5 shrink-0" strokeWidth={2.5} aria-label="Saved" />
          ) : isError ? (
            <TriangleAlert className="size-5 shrink-0" aria-label="Not saved" />
          ) : (
            <Save className="size-5 shrink-0" aria-hidden="true" />
          )}
          {isDone ? 'Saved' : isError ? 'Not saved' : 'Save this quiz?'}
        </h2>

        <div className="border-border flex flex-col gap-1 rounded-xl border border-dashed p-3">
          <p className="text-text-h text-base font-medium">
            {quiz.title.trim() || 'Untitled quiz'}
          </p>
          <p className="font-mono text-xs">
            {quiz.total} questions · {quiz.totalSeconds}s
          </p>
        </div>

        <p className="text-sm">
          {isDone
            ? 'The server now has this version. Sessions opened from now on play it.'
            : isError
              ? 'The server did not answer, so nothing was written. Your changes are still here — check that the game server is running and try again.'
              : 'This replaces the copy on the server. A round already in progress keeps playing the questions it started with.'}
        </p>

        <div className="flex flex-wrap justify-end gap-2">
          {isDone ? (
            <Button variant="primary" onClick={onClose}>
              <Check className="size-4" aria-hidden="true" />
              Close
            </Button>
          ) : (
            <>
              <Button variant="quiet" disabled={isSaving} onClick={onClose}>
                <X className="size-4" aria-hidden="true" />
                Cancel
              </Button>
              <Button variant="primary" disabled={isSaving} onClick={onConfirm}>
                {isSaving ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                {isSaving ? 'Saving…' : isError ? 'Try again' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SaveDialog
