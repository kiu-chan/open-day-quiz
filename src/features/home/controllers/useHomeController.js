/**
 * Controller of the home page.
 *
 * The home page only *reads* the session, it sends no intents: it needs to know
 * whether a round is open so it can show the right invitation ("Join the lobby"
 * is a very different message from "No round is running"). So this hook wraps
 * `useSession` and flattens it into a handful of flags the view uses directly,
 * instead of letting the view read `session.state` itself.
 *
 * Public API: useHomeController() → { isOpen, isPlaying, playerCount, quizTitle,
 * statusLabel, isOffline }
 */
import { useMemo } from 'react'
import { useSession } from '@common/session/controllers/useSession.js'
import { SESSION_STATES } from '@common/session/models/SessionModel.js'

const STATUS_LABELS = {
  [SESSION_STATES.IDLE]: 'No round is running',
  [SESSION_STATES.LOBBY]: 'The lobby is open',
  [SESSION_STATES.QUESTION]: 'A round is in progress',
  [SESSION_STATES.REVEAL]: 'A round is in progress',
  [SESSION_STATES.STANDINGS]: 'A round is in progress',
  [SESSION_STATES.PODIUM]: 'Announcing the results',
  [SESSION_STATES.PRIZE]: 'Handing out the prize',
  [SESSION_STATES.PRIZE_REVEALED]: 'The prize has been awarded',
}

export function useHomeController() {
  const { session, isOffline } = useSession()

  return useMemo(
    () => ({
      /** There is a session to join — someone scanning the QR now gets in. */
      isOpen: !session.isIdle,
      isPlaying: session.state === SESSION_STATES.QUESTION,
      playerCount: session.playerCount,
      quizTitle: session.quiz?.title ?? null,
      statusLabel: STATUS_LABELS[session.state],
      isOffline,
    }),
    [session, isOffline],
  )
}
