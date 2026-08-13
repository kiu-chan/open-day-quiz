import { useState } from 'react'
import {
  LoaderCircle,
  MessageSquare,
  MessagesSquare,
  RefreshCw,
  Star,
  Trash2,
  TriangleAlert,
  Users,
} from 'lucide-react'
import {
  feedbackKey,
  MAX_RATING,
  MIN_RATING,
  RATING_LABELS,
} from '@common/feedback/models/Feedback.js'
import Button from '@common/views/Button.jsx'
import PlayerAvatar from '@common/views/PlayerAvatar.jsx'
import { useFeedbackListController } from '../controllers/useFeedbackListController.js'
import AdminShell from './components/AdminShell.jsx'
import Panel from './components/Panel.jsx'
import StatTile from './components/StatTile.jsx'

const RATINGS = Array.from(
  { length: MAX_RATING - MIN_RATING + 1 },
  (_, i) => MIN_RATING + i,
)

/** A rating, read-only: filled stars against outlines, plus the words beside it. */
function Stars({ rating }) {
  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`${rating} of ${MAX_RATING}`}
    >
      {RATINGS.map((value) => (
        <Star
          key={value}
          className={`size-4 ${value <= rating ? 'text-text-h fill-current' : 'opacity-30'}`}
          strokeWidth={value <= rating ? 2 : 1.5}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

/** Nothing is stamped before the server has stamped it, so 0 prints as nothing. */
function submittedText(submittedAt) {
  return submittedAt > 0 ? new Date(submittedAt).toLocaleString() : ''
}

/**
 * A6 — what the visitors thought.
 *
 * The only admin page with nothing to edit. It is read in the quiet moments and
 * after the event, which is why it refreshes on a button rather than live: the
 * answers trickle in from phones long after the round has ended and there is
 * nothing to react to as they land.
 *
 * Emptying the book is deliberately awkward — two clicks — because it throws
 * away words people took the trouble to type, and nothing on the server keeps a
 * copy.
 */
function AdminFeedbackPage() {
  const { entries, summary, isLoading, error, load, clear } =
    useFeedbackListController()

  const [isConfirmingClear, setIsConfirmingClear] = useState(false)

  return (
    <AdminShell
      current="feedback"
      title="Feedback"
      subtitle={
        isLoading
          ? 'Reading the answers from the server…'
          : `${summary.count} visitor(s) answered after playing`
      }
      actions={
        <>
          <Button onClick={load} disabled={isLoading}>
            <RefreshCw
              className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Refresh
          </Button>

          {isConfirmingClear ? (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  setIsConfirmingClear(false)
                  clear()
                }}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete everything
              </Button>
              <Button variant="quiet" onClick={() => setIsConfirmingClear(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="quiet"
              onClick={() => setIsConfirmingClear(true)}
              disabled={summary.count === 0}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Clear
            </Button>
          )}
        </>
      }
    >
      {error && (
        <p className="border-accent-border text-text-h flex flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed px-5 py-4 text-sm">
          <TriangleAlert className="size-4 shrink-0" aria-label="Error" />
          <span className="font-medium">The server did not answer: {error}</span>
          <span className="opacity-70">
            — check that it is running, then press Refresh.
          </span>
        </p>
      )}

      {isLoading ? (
        <Panel dashed className="items-center py-14 text-center">
          <LoaderCircle
            className="text-text-h size-10 animate-spin"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-base">Loading…</p>
        </Panel>
      ) : summary.count === 0 ? (
        <Panel dashed className="items-center py-14 text-center">
          <MessagesSquare
            className="text-text-h size-10"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-base">Nobody has answered yet.</p>
          <p className="max-w-md text-sm opacity-70">
            The card appears on a player's phone as soon as the round reaches the
            final leaderboard, so the first answers arrive while the prizes are
            being handed out.
          </p>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile label="Answers" value={summary.count} Icon={Users} />
            <StatTile
              label="Average"
              value={summary.average.toFixed(1)}
              hint={`out of ${MAX_RATING}`}
              Icon={Star}
            />
            <StatTile
              label="With a comment"
              value={summary.commentCount}
              Icon={MessageSquare}
            />
          </div>

          <Panel title="How they rated it" Icon={Star}>
            <ul className="flex list-none flex-col gap-3 p-0">
              {summary.distribution.map((row) => (
                <li key={row.rating} className="flex items-center gap-3 text-sm">
                  <span className="flex w-36 shrink-0 items-center gap-2">
                    <Stars rating={row.rating} />
                  </span>
                  <span className="hidden w-40 shrink-0 truncate sm:block">
                    {row.label}
                  </span>

                  <span className="bg-code-bg h-2.5 flex-1 overflow-hidden rounded-full">
                    <span
                      className="bg-accent block h-full rounded-full transition-all duration-500"
                      style={{ width: `${row.percent}%` }}
                    />
                  </span>

                  <span className="text-text-h w-8 shrink-0 text-right font-mono tabular-nums">
                    {row.count}
                  </span>
                  <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums opacity-60">
                    {Math.round(row.percent)}%
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="What they said" Icon={MessageSquare}>
            <ul className="flex list-none flex-col gap-3 p-0">
              {entries.map((entry) => (
                <li
                  key={feedbackKey(entry)}
                  className="border-border flex flex-col gap-2 rounded-xl border-2 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <PlayerAvatar avatarId={entry.avatarId} className="size-7" />
                    <span className="text-text-h text-sm font-medium">
                      {entry.name || 'Anonymous'}
                    </span>
                    <Stars rating={entry.rating} />
                    <span className="text-xs opacity-70">
                      {RATING_LABELS[entry.rating]}
                    </span>
                    <span className="ml-auto font-mono text-xs opacity-60">
                      {submittedText(entry.submittedAt)}
                    </span>
                  </div>

                  {entry.comment ? (
                    <p className="text-text-h text-sm whitespace-pre-wrap">
                      {entry.comment}
                    </p>
                  ) : (
                    <p className="text-xs opacity-60">
                      Rating only — they did not write anything.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </AdminShell>
  )
}

export default AdminFeedbackPage
