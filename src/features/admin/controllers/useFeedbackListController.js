/**
 * Controller of the feedback page (A6): reads what visitors sent, works out the
 * summary, and can empty the book for a fresh event day.
 *
 * Unlike the other admin pages this one has nothing to edit and therefore no
 * save state — it reads. It also does not subscribe to anything: feedback
 * arrives a phone at a time long after the round, so a `Refresh` button is
 * honest about it where a live stream would only pretend.
 *
 * The summary comes from the model rather than being counted here, so the
 * average and the bars are worked out in one place.
 *
 * Public API: useFeedbackListController()
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { summarise } from '@common/feedback/models/Feedback.js'
import { feedbackRepository } from '@common/feedback/models/FeedbackRepository.js'

export function useFeedbackListController() {
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setEntries(await feedbackRepository.list())
    } catch (cause) {
      setError(cause.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const clear = useCallback(async () => {
    try {
      await feedbackRepository.clear()
      setEntries([])
    } catch (cause) {
      setError(cause.message)
    }
  }, [])

  const summary = useMemo(() => summarise(entries), [entries])

  return { entries, summary, isLoading, error, load, clear }
}
