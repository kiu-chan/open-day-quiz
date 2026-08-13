import { useState } from 'react'
import { Check, LoaderCircle, Send, SquarePen, Star, TriangleAlert } from 'lucide-react'
import {
  MAX_COMMENT_LENGTH,
  MAX_RATING,
  MIN_RATING,
  RATING_LABELS,
} from '@common/feedback/models/Feedback.js'
import Button from '@common/views/Button.jsx'

/** 1 … 5, so the row of stars is written once and read left to right. */
const RATINGS = Array.from(
  { length: MAX_RATING - MIN_RATING + 1 },
  (_, i) => MIN_RATING + i,
)

/**
 * P7 — what did you think of it? Shown on the phone once the round is over.
 *
 * The rating is stars, filled up to the one tapped: a **filled** shape against
 * an outline, never a colour, and the chosen one is spelled out in words
 * underneath as well, because "four stars" means different things to different
 * people and the university reads the words on the other end.
 *
 * The rating is required and the sentence is not. Most people at a stand will
 * tap a star and walk off, and a form that refuses to be sent without a comment
 * simply collects nothing at all.
 */
function FeedbackPanel({ isSent, isSending, error, onSubmit, onReopen }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  if (isSent) {
    return (
      <section className="border-border flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-5 py-6 text-center">
        <Check className="text-text-h size-8" strokeWidth={1.5} aria-label="Sent" />
        <h2 className="text-text-h text-lg">Thank you</h2>
        <p className="text-sm opacity-70">
          Your answer is with the organisers. It helps them make the next Open
          Day better.
        </p>
        <Button variant="quiet" onClick={onReopen} className="text-sm">
          <SquarePen className="size-4" aria-hidden="true" />
          Change my answer
        </Button>
      </section>
    )
  }

  return (
    <form
      className="border-border flex flex-col gap-4 rounded-2xl border-2 px-5 py-5"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(rating, comment)
      }}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-text-h text-lg">How was it?</h2>
        <p className="text-sm opacity-70">
          Tell the university what you thought of the stand. Your name and animal
          go with it.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          {RATINGS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={value === rating}
              aria-label={`${value} of ${MAX_RATING} — ${RATING_LABELS[value]}`}
              onClick={() => setRating(value)}
              className="cursor-pointer rounded-lg border-2 border-transparent p-1.5 transition active:scale-90"
            >
              <Star
                className={`size-9 ${
                  value <= rating ? 'text-text-h fill-current' : 'opacity-40'
                }`}
                strokeWidth={value <= rating ? 2 : 1.5}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>

        {/* The words carry the meaning; the stars are only how you pick them.
            Kept at a fixed height so the form does not jump on the first tap. */}
        <p className="text-text-h flex h-6 items-center text-sm font-medium">
          {rating > 0 ? RATING_LABELS[rating] : 'Tap a star'}
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm" htmlFor="feedback-comment">
        Anything you want to add? (optional)
        <textarea
          id="feedback-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={MAX_COMMENT_LENGTH}
          rows={3}
          placeholder="What you liked, what you would change…"
          className="border-border focus:border-accent-border text-text-h resize-none rounded-xl border-2 px-4 py-3 text-base outline-none"
        />
      </label>

      {error && (
        <p className="border-accent-border text-text-h flex items-start gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-label="Error" />
          <span>It did not go through: {error}. Try again.</span>
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={rating === 0 || isSending}
        className="py-3 text-base"
      >
        {isSending ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-5" aria-hidden="true" />
        )}
        {isSending ? 'Sending…' : 'Send feedback'}
      </Button>
    </form>
  )
}

export default FeedbackPanel
