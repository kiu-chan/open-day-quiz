/**
 * Controller of the quiz editor page (A2).
 *
 * Edits stay in the browser until the admin presses "Save": the quiz on the
 * server is the one every session is opened from, so overwriting it is a
 * deliberate act, not something a keystroke does behind the editor's back.
 *
 * The price of that is work that only exists in this tab, so `saveState` tracks
 * it ('unsaved' the moment anything changes) and a `beforeunload` guard makes
 * the browser ask before a reload or a closed tab takes it away.
 *
 * Every editing rule (where `correctIndex` goes when an option is removed, the
 * minimum duration, reordering questions) lives in Quiz/Question — this file
 * only calls into them.
 *
 * Public API: useQuizEditorController(quizId)
 */
import { useCallback, useEffect, useState } from 'react'
import { newId } from '@common/ids.js'
import { Question } from '@common/session/models/Question.js'
import { imageRepository } from '../models/ImageRepository.js'
import { quizRepository } from '../models/QuizRepository.js'

/** A new question: two empty slots is the minimum for a valid one. */
function emptyQuestion() {
  return new Question({ id: newId('q'), prompt: '', options: ['', ''] })
}

export function useQuizEditorController(quizId) {
  const [quiz, setQuiz] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  /** 'saved' | 'unsaved' | 'saving' | 'error' */
  const [saveState, setSaveState] = useState('saved')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const found = await quizRepository.findById(quizId)
        if (!cancelled) setQuiz(found)
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
  }, [quizId])

  const hasUnsavedChanges = saveState === 'unsaved' || saveState === 'error'

  /**
   * Nothing but a closed tab can take unsaved questions away, so let the browser
   * ask first. It only warns while there is something to lose.
   */
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const warn = (event) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [hasUnsavedChanges])

  /**
   * Write the quiz to the server. Called by the page once the admin has
   * confirmed it in the dialog, never by an edit.
   */
  const save = useCallback(async () => {
    if (!quiz) return

    setSaveState('saving')
    try {
      await quizRepository.save(quiz)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [quiz])

  const apply = useCallback(
    (mutate) => {
      if (!quiz) return
      const next = mutate(quiz)
      if (next === quiz) return

      setQuiz(next)
      setSaveState('unsaved')
    },
    [quiz],
  )

  /** Edit one question in place: takes the old question, returns the new one. */
  const editQuestion = useCallback(
    (index, mutate) =>
      apply((current) =>
        current.withQuestionAt(index, mutate(current.questions[index])),
      ),
    [apply],
  )

  const setTitle = useCallback(
    (title) => apply((current) => current.withTitle(title)),
    [apply],
  )

  const setWinnerCount = useCallback(
    (count) => apply((current) => current.withWinnerCount(count)),
    [apply],
  )

  const addQuestion = useCallback(() => {
    // Generate the id outside the mutate function so a React re-run cannot
    // produce two different ids.
    const question = emptyQuestion()
    apply((current) => current.withQuestionAdded(question))
  }, [apply])

  const duplicateQuestion = useCallback(
    (index) =>
      apply((current) => {
        const source = current.questions[index]
        return current.withQuestionAdded(source.with({ id: newId('q') }))
      }),
    [apply],
  )

  const removeQuestion = useCallback(
    (index) => apply((current) => current.withQuestionRemoved(index)),
    [apply],
  )

  const moveQuestion = useCallback(
    (index, delta) => apply((current) => current.withQuestionMoved(index, delta)),
    [apply],
  )

  const setPrompt = useCallback(
    (index, prompt) => editQuestion(index, (question) => question.withPrompt(prompt)),
    [editQuestion],
  )

  const setOption = useCallback(
    (index, optionIndex, text) =>
      editQuestion(index, (question) => question.withOptionAt(optionIndex, text)),
    [editQuestion],
  )

  const setImage = useCallback(
    (index, image) => editQuestion(index, (question) => question.withImage(image)),
    [editQuestion],
  )

  const setOptionImage = useCallback(
    (index, optionIndex, image) =>
      editQuestion(index, (question) =>
        question.withOptionImageAt(optionIndex, image),
      ),
    [editQuestion],
  )

  /**
   * Upload an image and return its path. The image picker keeps its own
   * "uploading" state and its own error message, so no shared state is needed
   * here.
   */
  const uploadImage = useCallback((file) => imageRepository.upload(file), [])

  const setCorrect = useCallback(
    (index, optionIndex) =>
      editQuestion(index, (question) => question.withCorrect(optionIndex)),
    [editQuestion],
  )

  const setDuration = useCallback(
    (index, seconds) =>
      editQuestion(index, (question) => question.withDuration(seconds)),
    [editQuestion],
  )

  const setDurationForAll = useCallback(
    (seconds) => apply((current) => current.withDurationForAll(seconds)),
    [apply],
  )

  const addOption = useCallback(
    (index) => editQuestion(index, (question) => question.withOptionAdded()),
    [editQuestion],
  )

  const removeOption = useCallback(
    (index, optionIndex) =>
      editQuestion(index, (question) => question.withOptionRemoved(optionIndex)),
    [editQuestion],
  )

  return {
    quiz,
    isLoading,
    loadError,
    saveState,
    hasUnsavedChanges,
    save,
    notFound: !isLoading && !loadError && quiz === null,
    errors: quiz?.errors ?? [],
    setTitle,
    setWinnerCount,
    addQuestion,
    duplicateQuestion,
    removeQuestion,
    moveQuestion,
    setPrompt,
    setOption,
    setImage,
    setOptionImage,
    uploadImage,
    setCorrect,
    setDuration,
    setDurationForAll,
    addOption,
    removeOption,
  }
}
