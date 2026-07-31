/**
 * The state of the admin lock: is this installation password-protected yet, and
 * has this browser typed it?
 *
 * Called by `AdminGate`, which is the one thing standing between a stranger and
 * the control desk, so the five states it returns are the five screens the gate
 * can show:
 *  - `checking`    — asking the server, nothing decided yet
 *  - `setup`       — first run, no password anywhere: pick one now
 *  - `locked`      — a password exists, this browser has not typed it
 *  - `unlocked`    — through; the admin pages render
 *  - `unreachable` — the server did not answer, so the answer is unknown
 *
 * `unreachable` is deliberately not the same as `locked`: telling a host their
 * password is wrong when the real problem is a dead server sends them hunting
 * for the wrong thing in the middle of an event.
 *
 * Public API: useAdminAuthController() → { status, minPasswordLength, error,
 * isSubmitting, submit, retry }
 */
import { useCallback, useEffect, useState } from 'react'
import { adminAuthRepository } from '../models/AdminAuthRepository.js'

export function useAdminAuthController() {
  const [status, setStatus] = useState('checking')
  const [minPasswordLength, setMinPasswordLength] = useState(6)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const check = useCallback(async () => {
    setStatus('checking')
    try {
      const state = await adminAuthRepository.status()
      setMinPasswordLength(state.minPasswordLength)
      if (state.authenticated) setStatus('unlocked')
      else setStatus(state.configured ? 'locked' : 'setup')
    } catch {
      setStatus('unreachable')
    }
  }, [])

  useEffect(() => {
    check()
  }, [check])

  /**
   * One submit for both forms: on first run it sets the password, afterwards it
   * signs in. `confirm` is only filled on the first run, where a typo would
   * otherwise lock the host out of their own installation.
   */
  const submit = useCallback(
    async ({ password, confirm }) => {
      const isSetup = status === 'setup'
      if (isSetup && password !== confirm) {
        setError('the two passwords do not match')
        return
      }

      setError(null)
      setIsSubmitting(true)
      try {
        if (isSetup) await adminAuthRepository.setPassword(password)
        else await adminAuthRepository.login(password)
        setStatus('unlocked')
      } catch (submitError) {
        setError(submitError.message)
      } finally {
        setIsSubmitting(false)
      }
    },
    [status],
  )

  return { status, minPasswordLength, error, isSubmitting, submit, retry: check }
}
