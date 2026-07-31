/**
 * The session state lives here — the server is the **single source of truth**.
 *
 * Clients no longer change the state themselves: they send an *intent*, the
 * server applies it to the SessionModel and broadcasts the new snapshot to every
 * device. Two reasons:
 *  - The three surfaces now sit on three different devices but must see **one**
 *    state. If every client could write directly, two people clicking at once
 *    would leave two machines believing two different outcomes.
 *  - `msTaken` (how fast someone answered) has to be measured by a single clock.
 *    A phone a few seconds off from the laptop would mis-score by hundreds of
 *    points.
 *
 * This file imports the exact SessionModel the client uses, so the game rules
 * exist in one copy — there is no parallel "server-side rulebook" to drift.
 *
 * Public API: sessionStore.read() / apply(intent) / subscribe(fn)
 */
import { newId } from '../src/common/ids.js'
import { Quiz } from '../src/common/session/models/Quiz.js'
import { SessionModel } from '../src/common/session/models/SessionModel.js'

/** The time-up check interval. 250ms is smooth enough for viewers and costs nothing. */
const TICK_MS = 250

let current = SessionModel.empty()
const listeners = new Set()

function commit(next) {
  // An invalid action makes the model return the very same instance: broadcast
  // nothing.
  if (next === current) return current

  current = next
  for (const listener of listeners) listener(current)
  return current
}

/**
 * The table translating intents (what clients send) into model actions. This is
 * the only place that knows intent names — a new action means one new line here.
 *
 * `now` comes from the server and is never taken from the client: a player
 * fiddling with their device clock earns no extra points.
 */
function reduce(session, intent, now) {
  switch (intent.type) {
    case 'openLobby':
      // Opening a new session means cancelling the running one: the state
      // machine only enters the lobby from idle, so reset first.
      //
      // The fresh id is what makes every session a clean slate for the phones:
      // one handed to a different visitor between rounds sees an id it does not
      // recognise and asks for a name again, instead of playing on as whoever
      // held it last.
      return session.reset().openLobby(Quiz.fromJSON(intent.quiz), newId('session'))
    case 'cancel':
      return session.cancel()
    case 'start':
      return session.start(now)
    case 'reveal':
      return session.reveal()
    case 'next':
      return session.next(now)
    case 'announceWinner':
      return session.announceWinner(intent.winnerId)
    case 'reset':
      return session.reset()
    case 'join':
      return session.join({
        id: intent.id,
        name: intent.name,
        avatarId: intent.avatarId,
        joinedAt: now,
      })
    case 'answer':
      return session.submitAnswer({
        playerId: intent.playerId,
        optionIndex: intent.optionIndex,
        now,
      })
    case 'pickBox':
      return session.pickBox({ playerId: intent.playerId, index: intent.index })
    default:
      return session
  }
}

export const sessionStore = {
  read: () => current,

  /**
   * Apply one intent. Wrapped in try/catch because this is data from outside: a
   * phone sending a payload with a missing field must not be able to kill the
   * server mid-round.
   */
  apply(intent) {
    if (!intent || typeof intent.type !== 'string') return current
    try {
      return commit(reduce(current, intent, Date.now()))
    } catch (error) {
      console.error(`Ignoring intent "${intent.type}":`, error.message)
      return current
    }
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

/**
 * Close the question automatically when time is up. This belongs to the server
 * because there must be exactly one clock: the admin tab used to do it, but if
 * phones and the projector closed questions too, each would close at a slightly
 * different moment — and if the admin locked their screen, the game would hang
 * on the current question forever.
 */
const ticker = setInterval(() => {
  const now = Date.now()
  if (current.isCounting && current.isTimeUp(now)) commit(current.reveal())
}, TICK_MS)

// Only the HTTP server should keep the process alive; this ticker should not.
ticker.unref()
