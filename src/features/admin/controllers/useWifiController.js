/**
 * Controller of the Wi-Fi page (A5): reads the configured network, holds the
 * edits, writes them back, and fetches the list of networks to pick from.
 *
 * Same shape as the other two editors — **nothing is written until Save is
 * pressed**, and `saveState` is what the page turns into a badge.
 *
 * The list is a **second, independent request** and deliberately not part of
 * loading the page: asking the operating system for it can take seconds, it can
 * fail on a machine with no wireless card, and none of that should stop somebody
 * typing a network name in by hand. So the picker carries its own
 * loading/error state and the form works without it.
 *
 * Choosing from the list only fills the name in. It cannot fill the password —
 * the operating system will not hand out a stored one, and asking for it would
 * be a different program entirely.
 *
 * Public API: useWifiController()
 */
import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_WIFI, wifiSettingsFromJSON } from '@common/wifi/models/WifiSettings.js'
import { wifiRepository } from '@common/wifi/models/WifiRepository.js'

export function useWifiController() {
  const [settings, setSettings] = useState(DEFAULT_WIFI)
  /** What the server confirmed last, to compare the form against. */
  const [saved, setSaved] = useState(DEFAULT_WIFI)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [saveState, setSaveState] = useState('saved')

  const [networks, setNetworks] = useState([])
  const [current, setCurrent] = useState(null)
  const [source, setSource] = useState('none')
  const [isScanning, setIsScanning] = useState(true)
  const [scanError, setScanError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const stored = await wifiRepository.load()
        if (cancelled) return
        setSettings(stored)
        setSaved(stored)
      } catch (cause) {
        if (!cancelled) setLoadError(cause.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const scan = useCallback(async () => {
    setIsScanning(true)
    setScanError(null)
    try {
      const list = await wifiRepository.scan()
      setNetworks(list.networks)
      setCurrent(list.current)
      setSource(list.source)
    } catch (cause) {
      setScanError(cause.message)
    } finally {
      setIsScanning(false)
    }
  }, [])

  useEffect(() => {
    scan()
  }, [scan])

  const setField = useCallback((key, value) => {
    setSaveState('unsaved')
    setSettings((state) => ({ ...state, [key]: value }))
  }, [])

  const save = useCallback(async () => {
    setSaveState('saving')
    try {
      const stored = await wifiRepository.save(settings)
      setSettings(stored)
      setSaved(stored)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [settings])

  /** Turning the code off everywhere, without hunting for two empty boxes. */
  const clear = useCallback(() => {
    setSaveState('unsaved')
    setSettings(DEFAULT_WIFI)
  }, [])

  // Compared through the model, so trailing spaces the server would trim off do
  // not read as an unsaved change.
  const pending = wifiSettingsFromJSON(settings)
  const hasUnsavedChanges =
    pending.ssid !== saved.ssid || pending.password !== saved.password

  return {
    settings,
    saved,
    isLoading,
    loadError,
    saveState,
    hasUnsavedChanges,
    networks,
    current,
    source,
    isScanning,
    scanError,
    setField,
    save,
    clear,
    scan,
  }
}
