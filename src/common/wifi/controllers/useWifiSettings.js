/**
 * Reads the configured network once on mount, for the two surfaces that draw its
 * QR code: the home page and the big screen.
 *
 * **A failed load is swallowed on purpose.** No network configured is a valid
 * state that simply draws no code, so a server that cannot be reached lands on
 * the same screen as a stand that never filled the form in — and both of those
 * surfaces already say elsewhere when the server is down.
 *
 * Fetched once rather than watched over SSE: this is configuration one person
 * saves between rounds, not match state the room watches change. A projector
 * left open while the admin edits it keeps the old code until it is reloaded.
 *
 * Public API: useWifiSettings() → { ssid, password }
 */
import { useEffect, useState } from 'react'
import { DEFAULT_WIFI } from '../models/WifiSettings.js'
import { wifiRepository } from '../models/WifiRepository.js'

export function useWifiSettings() {
  const [settings, setSettings] = useState(DEFAULT_WIFI)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const stored = await wifiRepository.load()
        if (!cancelled) setSettings(stored)
      } catch {
        // No code is drawn — see the block comment above.
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return settings
}
