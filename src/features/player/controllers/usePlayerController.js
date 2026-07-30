/**
 * Controller of the player screen (P1–P6).
 *
 * The player identity is kept in localStorage: phones get their screen locked or
 * refreshed mid-game all the time, and coming back has to recognise the same
 * person rather than create a new one — otherwise their score disappears and the
 * leaderboard fills up with duplicate names.
 *
 * Public API: usePlayerController()
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { newId } from '@common/ids.js'
import { DEFAULT_AVATAR_ID } from '@common/session/models/Avatars.js'
import { useNow } from '@common/session/controllers/useNow.js'
import { useSession } from '@common/session/controllers/useSession.js'

const IDENTITY_KEY = 'open-day-quiz:player'

function loadIdentity() {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function usePlayerController() {
  const { session, isOffline, send } = useSession()
  const [identity, setIdentity] = useState(loadIdentity)
  const now = useNow(session.isCounting)

  const me = identity ? session.findPlayer(identity.id) : null

  const join = useCallback(
    (name, avatarId) => {
      const trimmed = name.trim()
      if (trimmed.length === 0) return

      // The avatar is part of the stored identity, not just of this one join:
      // the automatic rejoin below has to send it again, otherwise a phone that
      // locked its screen comes back as a different animal.
      const next = { id: identity?.id ?? newId('player'), name: trimmed, avatarId }
      localStorage.setItem(IDENTITY_KEY, JSON.stringify(next))
      setIdentity(next)
      send({ type: 'join', ...next })
    },
    [identity, send],
  )

  /**
   * If a name is already stored but the session cannot see us, rejoin
   * automatically. Needed now that the state lives on the server: a server
   * restart, or the admin opening a new round, wipes the player list — and we
   * are not about to make the whole room retype their names.
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
      /** The name entered last time, so the next session needs no retyping. */
      name: me?.name ?? identity?.name ?? '',
      avatarId: me?.avatarId ?? identity?.avatarId ?? DEFAULT_AVATAR_ID,
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
