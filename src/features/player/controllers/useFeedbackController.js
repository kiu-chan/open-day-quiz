/**
 * Controller of the feedback card the phone shows once the round is over (P7).
 *
 * Kept out of `usePlayerController` because it is a different conversation:
 * everything there is the live session, redrawn from a snapshot several times a
 * second, while this is one request sent by hand after the game has finished.
 * Mixing them would put a half-typed sentence in the path of every frame.
 *
 * What was actually sent is remembered, so the thank-you survives the reload a
 * phone gets when somebody locks the screen and comes back. It is stamped with
 * the session **and** the player, exactly like the identity in
 * `usePlayerController`: the next visitor holding this phone plays a new round
 * and must be asked in their own right, not shown a stranger's thank-you.
 *
 * Sending again is allowed and overwrites — the server keys feedback by player,
 * not by request. That is what makes *Change my answer* a button rather than a
 * problem.
 *
 * Public API: useFeedbackController({ sessionId, playerId, name, avatarId })
 */
import { useCallback, useState } from 'react'
import { feedbackRepository } from '@common/feedback/models/FeedbackRepository.js'

const STORAGE_KEY = 'open-day-quiz:feedback'

/** Which session and player the stored thank-you belongs to, or null. */
function loadSentFor() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useFeedbackController({ sessionId, playerId, name, avatarId }) {
  const [sentFor, setSentFor] = useState(loadSentFor)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Checked against the session on screen on every render rather than once at
   * mount — the phone is still sitting on the podium when the admin opens the
   * next round, and it has to start asking again as that happens.
   */
  const isSent =
    sentFor !== null &&
    sentFor.sessionId === sessionId &&
    sentFor.playerId === playerId

  const submit = useCallback(
    async (rating, comment) => {
      if (!sessionId || !playerId) return

      setIsSending(true)
      setError(null)
      try {
        await feedbackRepository.submit({
          sessionId,
          playerId,
          name,
          avatarId,
          rating,
          comment,
        })
        const stamp = { sessionId, playerId }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stamp))
        setSentFor(stamp)
      } catch (cause) {
        // The form stays as it was typed: somebody who has already written a
        // sentence must not lose it to a wifi hiccup.
        setError(cause.message)
      } finally {
        setIsSending(false)
      }
    },
    [sessionId, playerId, name, avatarId],
  )

  /** Back to the form. What they send next simply replaces what is stored. */
  const reopen = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSentFor(null)
    setError(null)
  }, [])

  return { isSent, isSending, error, submit, reopen }
}
