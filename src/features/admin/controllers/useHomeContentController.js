/**
 * Controller of the home page editor (A4): reads the text from the server, holds
 * the edits, writes them back.
 *
 * Same shape as the quiz editor: **nothing is written until Save is pressed.**
 * The home page is what every visitor reads, so an editor saving on each
 * keystroke would publish half-typed sentences to the hall. `saveState` is what
 * the page turns into a badge, and `hasUnsavedChanges` is a plain comparison
 * against the copy the server last confirmed — a field typed and typed back is
 * correctly not a change.
 *
 * `restoreDefaults` only fills the form; it is a save away from taking effect,
 * like every other edit here.
 *
 * Public API: useHomeContentController()
 */
import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_HOME_CONTENT,
  homeContentFromJSON,
} from '@common/home/models/HomeContent.js'
import { homeContentRepository } from '@common/home/models/HomeContentRepository.js'

export function useHomeContentController() {
  const [content, setContent] = useState(DEFAULT_HOME_CONTENT)
  /** What the server confirmed last, to compare the form against. */
  const [saved, setSaved] = useState(DEFAULT_HOME_CONTENT)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [saveState, setSaveState] = useState('saved')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const stored = await homeContentRepository.load()
        if (cancelled) return
        setContent(stored)
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

  const setField = useCallback((key, value) => {
    setSaveState('unsaved')
    setContent((current) => ({ ...current, [key]: value }))
  }, [])

  const restoreDefaults = useCallback(() => {
    setSaveState('unsaved')
    setContent(DEFAULT_HOME_CONTENT)
  }, [])

  const save = useCallback(async () => {
    setSaveState('saving')
    try {
      // What comes back is what the server stored, blanks resolved to defaults
      // and all — so an emptied field shows its default text straight away
      // rather than only after the next reload.
      const stored = await homeContentRepository.save(content)
      setContent(stored)
      setSaved(stored)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [content])

  // Compared through the model, so a field cleared back to blank counts as a
  // change only when its default differs from what is stored — the form and the
  // server then agree on what "empty" means.
  const pending = homeContentFromJSON(content)
  const hasUnsavedChanges = Object.keys(DEFAULT_HOME_CONTENT).some(
    (key) => pending[key] !== saved[key],
  )

  return {
    content,
    isLoading,
    loadError,
    saveState,
    hasUnsavedChanges,
    setField,
    restoreDefaults,
    save,
  }
}
