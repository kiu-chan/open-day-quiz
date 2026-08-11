/**
 * Controller of the big screen (D1–D5). It reads the session and draws it; the
 * one thing it can change is **starting the round** from the lobby, so whoever
 * stands at the screen can kick off without walking back to the laptop. Every
 * other step still comes from the control desk.
 *
 * `start` is the same intent the admin sends — the server applies the same
 * SessionModel rule, so a stray second click starts nothing twice.
 *
 * It also reads the Wi-Fi the admin configured. The lobby is the screen where
 * that code has to be — a phone on mobile data cannot load the page the join
 * code points at, so on this screen the network comes before the game.
 *
 * Public API: useDisplayController()
 */
import { useCallback, useMemo } from 'react'
import { joinUrl } from '@common/routing/useHashRoute.js'
import { useNow } from '@common/session/controllers/useNow.js'
import { useSession } from '@common/session/controllers/useSession.js'
import { MIN_PLAYERS } from '@common/session/models/SessionModel.js'
import { useWifiSettings } from '@common/wifi/controllers/useWifiSettings.js'

export function useDisplayController() {
  const { session, isOffline, send } = useSession()
  const now = useNow(session.isCounting)
  const wifi = useWifiSettings()

  const start = useCallback(() => send({ type: 'start' }), [send])

  const state = useMemo(() => {
    const leaderboard = session.leaderboard

    return {
      state: session.state,
      isOffline,
      quiz: session.quiz,
      question: session.currentQuestion,
      questionNumber: session.questionNumber,
      total: session.total,
      progress: session.progress,
      secondsLeft: session.remainingSeconds(now),
      playerCount: session.playerCount,
      canStart: session.canStart,
      minPlayers: MIN_PLAYERS,
      players: session.players,
      answeredCount: session.answeredCount,
      distribution: session.currentDistribution,
      joinUrl: joinUrl(),
      /** Empty when the stand has no Wi-Fi of its own: then no code is drawn. */
      wifiSsid: wifi.ssid,
      wifiPassword: wifi.password,
      /** The big screen shows the top ten and stops there, like the phones. */
      topTen: leaderboard.topTen,
      /** The top ten with the move each player just made — drawn at the reveal. */
      standings: session.standings,
      /** One row per winner — the big screen keeps every opened box on show. */
      prizeRows: session.prizeRows,
      winnerCount: session.winnerIds.length,
      /** Nobody left to open a box: the last prize is out. */
      isPrizeDone: session.pickingPlayerId === null,
    }
  }, [session, now, isOffline, wifi])

  return { ...state, start }
}
