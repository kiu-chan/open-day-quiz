/**
 * Controller of the quiz editor page (A2).
 *
 * Saves immediately after every change instead of having a "Save" button: the
 * prototype has no undo, and retyping a whole question set because a tab was
 * closed by accident is thoroughly annoying.
 *
 * The save goes to the server and the local state is updated *first*, without
 * waiting for it: typing must never wait for a round trip. What the round trip
 * feeds is `saveState`, so the page can show whether the last change actually
 * landed — with the writing now happening over the network, "saved" stops being
 * something the page may simply assume.
 *
 * Every editing rule (where `correctIndex` goes when an option is removed, the
 * minimum duration, reordering questions) lives in Quiz/Question — this file
 * only calls into them.
 *
 * Public API: useQuizEditorController(quizId)
 */
import { useCallback, useEffect, useRef, useState } from 'react'
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
  /** 'saved' | 'saving' | 'error' */
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

  /**
   * Typing fires one save per keystroke, so several are in flight at once and
   * they can come back out of order. Each save takes a ticket and only the
   * newest one is allowed to set the badge — otherwise a slow early response
   * would report "saved" over a later change that has not landed yet.
   */
  const latestSave = useRef(0)

  const save = useCallback(async (next) => {
    const ticket = (latestSave.current += 1)
    setSaveState('saving')

    try {
      await quizRepository.save(next)
      if (latestSave.current === ticket) setSaveState('saved')
    } catch {
      if (latestSave.current === ticket) setSaveState('error')
    }
  }, [])

  const apply = useCallback(
    (mutate) => {
      if (!quiz) return
      const next = mutate(quiz)
      if (next === quiz) return

      setQuiz(next)
      save(next)
    },
    [quiz, save],
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
    notFound: !isLoading && !loadError && quiz === null,
    errors: quiz?.errors ?? [],
    setTitle,
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
    addOption,
    removeOption,
  }
}
