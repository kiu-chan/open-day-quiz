/**
 * Controller of the player screen (P1–P6).
 *
 * The player identity is kept in localStorage, but **only for the session it was
 * created in**. Two requirements pull against each other here:
 *
 *  - A phone that locks its screen or gets refreshed mid-round has to come back
 *    as the same person, or its score disappears and the leaderboard fills up
 *    with duplicate names.
 *  - A phone handed to the next visitor between rounds has to be a blank slate.
 *    At an Open Day one device is played by a stream of different people, and
 *    inheriting the previous visitor's name and animal is simply wrong.
 *
 * The session id settles it. Every `openLobby` mints a new one, and a stored
 * identity only counts while it matches the session on screen. Same id → your
 * seat back. Different id → a stranger, who types a name and picks an animal
 * again.
 *
 * Public API: usePlayerController()
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { newId } from '@common/ids.js'
import { DEFAULT_AVATAR_ID } from '@common/session/models/Avatars.js'
import { useNow } from '@common/session/controllers/useNow.js'
import { useSession } from '@common/session/controllers/useSession.js'

const IDENTITY_KEY = 'open-day-quiz:player'

/**
 * Identities written by older versions have no `sessionId` (and the oldest have
 * no `avatarId` either). They simply never match a live session, so they are
 * ignored exactly like a stale one — no migration needed.
 */
function loadIdentity() {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY)
    if (!raw) return null

    const identity = JSON.parse(raw)
    return { ...identity, avatarId: identity.avatarId || DEFAULT_AVATAR_ID }
  } catch {
    return null
  }
}

export function usePlayerController() {
  const { session, isOffline, send } = useSession()
  const [stored, setStored] = useState(loadIdentity)
  const now = useNow(session.isCounting)

  /**
   * The stored identity, but only while it belongs to the session on screen.
   * Checked on every render rather than once at mount: the phone is sitting on
   * the lobby screen when the admin opens the next round, and it has to notice
   * the switch as it happens.
   */
  const identity =
    stored && session.id && stored.sessionId === session.id ? stored : null

  const me = identity ? session.findPlayer(identity.id) : null

  const join = useCallback(
    (name, avatarId) => {
      const trimmed = name.trim()
      if (trimmed.length === 0 || !session.id) return

      // A brand-new player id every time, stamped with the session it belongs
      // to. Reusing the previous id would hand this round's seat to whoever
      // held the phone last.
      const next = {
        sessionId: session.id,
        id: newId('player'),
        name: trimmed,
        avatarId,
      }
      localStorage.setItem(IDENTITY_KEY, JSON.stringify(next))
      setStored(next)
      send({ type: 'join', ...next })
    },
    [session.id, send],
  )

  /**
   * Rejoin automatically when the session cannot see us but our identity is
   * still valid for it — a screen lock, a refresh, a wifi drop. This never fires
   * across sessions: a new lobby changes the id, which makes `identity` null, so
   * the join form appears instead.
   * The model's `join` ignores players who already exist, so calling it
   * repeatedly is harmless.
   */
  useEffect(() => {
    if (!identity || me || session.isIdle) return
    send({ type: 'join', ...identity })
  }, [identity, me, session.isIdle, send])

  const answer = useCallback(
    (optionIndex) => {
      if (!identity) return
      send({ type: 'answer', playerId: identity.id, optionIndex })
    },
    [identity, send],
  )

  const pickBox = useCallback(
    (index) => {
      if (!identity) return
      send({ type: 'pickBox', playerId: identity.id, index })
    },
    [identity, send],
  )

  const state = useMemo(() => {
    const leaderboard = session.leaderboard

    return {
      sessionState: session.state,
      isOffline,
      hasJoined: me !== null,
      /**
       * Empty for anyone this session does not know — which, deliberately,
       * includes a phone that played the previous round. Prefilled only while
       * the identity is still the current session's, so a refresh mid-round
       * does not make somebody retype.
       */
      name: me?.name ?? identity?.name ?? '',
      /**
       * `||`, not `??`: a player record can carry an **empty string** avatar,
       * which `??` would happily pass on — and an empty avatar id used to blank
       * the whole screen.
       */
      avatarId: me?.avatarId || identity?.avatarId || DEFAULT_AVATAR_ID,
      playerCount: session.playerCount,
      question: session.currentQuestion,
      questionNumber: session.questionNumber,
      total: session.total,
      progress: session.progress,
      secondsLeft: session.remainingSeconds(now),
      myAnswer: identity ? session.currentAnswerOf(identity.id) : null,
      isCorrect: identity ? session.isCorrectOf(identity.id) : null,
      pointsThisQuestion: identity ? session.currentPointsOf(identity.id) : 0,
      myRow: identity ? leaderboard.rowOf(identity.id) : null,
      topRows: leaderboard.top,
      isWinner: identity !== null && session.winnerId === identity.id,
      winnerName: session.winner?.name ?? null,
      prizeBoxes: session.prizeBoxes,
    }
  }, [session, identity, me, now, isOffline])

  return { ...state, join, answer, pickBox }
}
