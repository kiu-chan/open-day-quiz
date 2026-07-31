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
 * The animals are handed out first come, first served, so the form works from
 * what is still free rather than from what this phone picked last time.
 *
 * Within a session there is one more way out: while the game has not started, a
 * player may hand the seat back and join again as somebody else — by pressing
 * Back or simply by reloading. Once the first question is out, both stop
 * working and a reload restores the seat instead.
 *
 * Public API: usePlayerController()
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { newId } from '@common/ids.js'
import {
  DEFAULT_AVATAR_ID,
  firstFreeAvatarId,
} from '@common/session/models/Avatars.js'
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
   * Did this page load do the joining, or did it inherit a seat from the load
   * before it? A ref, because it must start false on every fresh page load —
   * that is exactly what tells a reload apart from an ordinary re-render.
   */
  const joinedHere = useRef(false)

  /**
   * The stored identity, but only while it belongs to the session on screen.
   * Checked on every render rather than once at mount: the phone is sitting on
   * the lobby screen when the admin opens the next round, and it has to notice
   * the switch as it happens.
   */
  const identity =
    stored && session.id && stored.sessionId === session.id ? stored : null

  const me = identity ? session.findPlayer(identity.id) : null

  /**
   * Reopening the page before the game starts means "let me do that again".
   * Someone who mistyped their name or regrets their animal reaches for reload
   * long before they look for a button, and in the lobby there is nothing to
   * lose by honouring it — no score exists yet.
   *
   * After the first question this is deliberately dead: there a reload is a
   * dropped connection, not a change of mind, and it has to restore the seat.
   */
  const isRestarting =
    identity !== null && !joinedHere.current && session.isLobby

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
      joinedHere.current = true
      send({ type: 'join', ...next })
    },
    [session.id, send],
  )

  /**
   * Hand the seat back: the name and the animal return to the pool and the join
   * form comes up blank. Used both by the Back button and by a reload in the
   * lobby, so the two routes cannot drift apart.
   */
  const leave = useCallback(() => {
    if (!identity) return
    send({ type: 'leave', playerId: identity.id })
    localStorage.removeItem(IDENTITY_KEY)
    setStored(null)
  }, [identity, send])

  /**
   * We asked for an animal and somebody else got there first. Only possible in
   * a genuine race — the picker hides the taken ones — but the phone has to be
   * told, because the server simply refused the join and nothing else on screen
   * would explain why it is still looking at the form.
   */
  const avatarTaken =
    identity !== null && me === null && session.isAvatarTaken(identity.avatarId)

  /**
   * Rejoin automatically when the session cannot see us but our identity is
   * still valid for it — a screen lock, a refresh, a wifi drop. This never fires
   * across sessions: a new lobby changes the id, which makes `identity` null, so
   * the join form appears instead.
   * The model's `join` ignores players who already exist, so calling it
   * repeatedly is harmless.
   */
  useEffect(() => {
    if (!identity || me || session.isIdle || avatarTaken || isRestarting) return
    send({ type: 'join', ...identity })
  }, [identity, me, session.isIdle, avatarTaken, isRestarting, send])

  /**
   * Carry out the restart once the first snapshot has told us we really are in
   * the lobby. It cannot happen at mount: the session is still empty then, and
   * a phone that reloaded mid-question would be thrown out of its own game.
   */
  useEffect(() => {
    if (isRestarting) leave()
  }, [isRestarting, leave])

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
    const takenAvatarIds = session.takenAvatarIds

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
       * Once joined this is our animal and nothing moves it. Before joining it
       * is only a *suggestion* — the first one still free — because the animal
       * we held last round, or a moment ago, may well belong to somebody else
       * by now.
       *
       * `||`, not `??`: a player record can carry an **empty string** avatar,
       * which `??` would happily pass on — and an empty avatar id used to blank
       * the whole screen.
       */
      avatarId:
        me?.avatarId || firstFreeAvatarId(takenAvatarIds) || DEFAULT_AVATAR_ID,
      takenAvatarIds,
      /** Every animal is spoken for: the round is full and nobody else can join. */
      isFull: firstFreeAvatarId(takenAvatarIds) === null,
      avatarTaken,
      /** Offer the way back only while there is nothing to lose by taking it. */
      canLeave: me !== null && session.isLobby,
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
  }, [session, identity, me, now, isOffline, avatarTaken])

  return { ...state, join, leave, answer, pickBox }
}
