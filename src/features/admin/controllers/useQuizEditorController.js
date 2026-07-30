/**
 * Controller of the quiz editor page (A2).
 *
 * Saves immediately after every change instead of having a "Save" button: the
 * prototype has no undo, and retyping a whole question set because a tab was
 * closed by accident is thoroughly annoying.
 *
 * Every editing rule (where `correctIndex` goes when an option is removed, the
 * minimum duration, reordering questions) lives in Quiz/Question — this file
 * only calls into them.
 *
 * Public API: useQuizEditorController(quizId)
 */
import { useCallback, useState } from 'react'
import { newId } from '@common/ids.js'
import { Question } from '@common/session/models/Question.js'
import { imageRepository } from '../models/ImageRepository.js'
import { quizRepository } from '../models/QuizRepository.js'

/** A new question: two empty slots is the minimum for a valid one. */
function emptyQuestion() {
  return new Question({ id: newId('q'), prompt: '', options: ['', ''] })
}

export function useQuizEditorController(quizId) {
  const [quiz, setQuiz] = useState(() => quizRepository.findById(quizId))

  const apply = useCallback(
    (mutate) => {
      if (!quiz) return
      const next = mutate(quiz)
      if (next === quiz) return

      quizRepository.save(next)
      setQuiz(next)
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
    notFound: quiz === null,
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
