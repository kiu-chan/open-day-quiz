/**
 * Model: one piece of feedback a visitor leaves once the round is over — a
 * rating from 1 to 5 and, if they feel like typing, a sentence about the stand.
 *
 * It sits in `common/` because two features read it: the phone writes it (P7)
 * and the admin page reads it back (A6). Nothing about it belongs to the live
 * session — feedback is written *after* the game, arrives one phone at a time
 * and nobody in the room is watching for it — so it never travels through the
 * intent path and no snapshot carries it.
 *
 * **A player has one piece of feedback per session, and `feedbackKey` is it.**
 * There is no id: a phone that sends twice (changed their mind, tapped the
 * button twice, reloaded) overwrites its own entry rather than adding a second
 * voice to the average. The key holds the session id as well as the player id
 * because a player id is only unique within a session — see the identity rules
 * in `usePlayerController`.
 *
 * The name and animal are copied in rather than looked up later, on purpose:
 * the session they belong to is gone from memory the moment the server restarts
 * or the next lobby opens, and feedback with no idea who left it is worth much
 * less to the people reading it in the morning.
 *
 * `submittedAt` is passed in by the caller like every other timestamp in the
 * models — the server stamps it, so a phone with the wrong clock cannot file
 * its answer under next Tuesday.
 *
 * Public API: RATING_LABELS, MAX_COMMENT_LENGTH, feedbackFromJSON(raw),
 * feedbackKey(entry), summarise(entries)
 */

export const MIN_RATING = 1
export const MAX_RATING = 5

/** Long enough for a real remark, short enough that the admin list stays readable. */
export const MAX_COMMENT_LENGTH = 400
const MAX_NAME_LENGTH = 24
const MAX_ID_LENGTH = 64

/**
 * What each rating means, spelled out. The stars alone are a shape people read
 * differently — four out of five is "great" to one visitor and "something was
 * wrong" to the next — and the same words label the picker on the phone and the
 * bars on the admin page, so both ends are counting the same thing.
 */
export const RATING_LABELS = {
  1: 'Not for me',
  2: 'It was okay',
  3: 'Good fun',
  4: 'Really enjoyed it',
  5: 'Loved it',
}

const clean = (value, limit) =>
  typeof value === 'string' ? value.trim().slice(0, limit) : ''

/** One entry per player per session — the reason a resend overwrites. */
export function feedbackKey(entry) {
  return `${entry.sessionId}:${entry.playerId}`
}

/**
 * Normalises one entry, or returns **null** when it is not feedback at all: no
 * rating, a rating outside 1–5, or no player to attribute it to. The server
 * turns that null into a 400 and stores nothing, so a stray POST cannot drag
 * the average around.
 */
export function feedbackFromJSON(raw) {
  const rating = Number(raw?.rating)
  const sessionId = clean(raw?.sessionId, MAX_ID_LENGTH)
  const playerId = clean(raw?.playerId, MAX_ID_LENGTH)

  if (!Number.isInteger(rating) || rating < MIN_RATING || rating > MAX_RATING) {
    return null
  }
  if (!sessionId || !playerId) return null

  return {
    sessionId,
    playerId,
    name: clean(raw?.name, MAX_NAME_LENGTH),
    avatarId: clean(raw?.avatarId, MAX_ID_LENGTH),
    rating,
    comment: clean(raw?.comment, MAX_COMMENT_LENGTH),
    submittedAt: Number.isFinite(raw?.submittedAt) ? raw.submittedAt : 0,
  }
}

/**
 * The whole picture of a pile of feedback in one pass: how many people answered,
 * what they averaged, and how the ratings split.
 *
 * The distribution runs 5 → 1 because that is the order the bars are drawn in,
 * and each row carries its percentage already worked out — the admin page draws
 * a bar from it and a view is not the place to divide.
 */
export function summarise(entries) {
  const count = entries.length
  const total = entries.reduce((sum, entry) => sum + entry.rating, 0)

  const distribution = []
  for (let rating = MAX_RATING; rating >= MIN_RATING; rating -= 1) {
    const ratingCount = entries.filter((entry) => entry.rating === rating).length
    distribution.push({
      rating,
      label: RATING_LABELS[rating],
      count: ratingCount,
      percent: count > 0 ? (ratingCount / count) * 100 : 0,
    })
  }

  return {
    count,
    /** 0 with nothing in, which the page prints as a dash rather than as "0.0". */
    average: count > 0 ? total / count : 0,
    commentCount: entries.filter((entry) => entry.comment).length,
    distribution,
  }
}
