/**
 * Controller of the home page. Two things at once, both read-only — the page
 * sends no intents.
 *
 * The session: it needs to know whether a round is open so it can show the right
 * invitation ("Join the lobby" is a very different message from "No round is
 * running"). So this hook wraps `useSession` and flattens it into a handful of
 * flags the view uses directly, instead of letting the view read `session.state`
 * itself.
 *
 * The text: every word on the page is content the admin edits (see
 * `HomeContent.js`), read once on mount. A server that cannot be reached is
 * swallowed on purpose — the defaults are a complete home page, and a visitor
 * standing at the stand is better served by the original copy than by an error
 * where the headline should be. `LiveStatus` already says the server is down.
 *
 * The Wi-Fi step of the join band comes from `useWifiSettings` instead: it is
 * configuration, edited on its own page, not a word anybody writes.
 *
 * Public API: useHomeController() → { content, homeUrl, wifi, isOpen, isPlaying,
 * playerCount, quizTitle, statusLabel, isOffline }
 */
import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_HOME_CONTENT } from '@common/home/models/HomeContent.js'
import { homeContentRepository } from '@common/home/models/HomeContentRepository.js'
import { homeUrl } from '@common/routing/useHashRoute.js'
import { useWifiSettings } from '@common/wifi/controllers/useWifiSettings.js'
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
  const [content, setContent] = useState(DEFAULT_HOME_CONTENT)
  const wifi = useWifiSettings()

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const stored = await homeContentRepository.load()
        if (!cancelled) setContent(stored)
      } catch {
        // Keep the defaults — see the block comment above.
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(
    () => ({
      content,
      /**
       * What the QR code on this page encodes: this page itself, on this very
       * host. Scanning it off the projector hands the visitor the page they were
       * reading, and they start the game from the button on it.
       */
      homeUrl: homeUrl(),
      /** `{ ssid, password }`; an empty ssid means the band shows one code. */
      wifi,
      /** There is a session to join — someone scanning the QR now gets in. */
      isOpen: !session.isIdle,
      isPlaying: session.state === SESSION_STATES.QUESTION,
      playerCount: session.playerCount,
      quizTitle: session.quiz?.title ?? null,
      statusLabel: STATUS_LABELS[session.state],
      isOffline,
    }),
    [content, wifi, session, isOffline],
  )
}
