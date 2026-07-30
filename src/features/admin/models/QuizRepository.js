/**
 * The access layer for the quizzes the admin writes — the I/O boundary of the
 * admin feature, and therefore the only file in the admin's `models/` allowed to
 * touch localStorage.
 *
 * On first launch it seeds QUIZ_DATA. Switching to a real API means changing
 * only this file (and making the functions `async`); Quiz and the views stay put.
 *
 * Public API: findAll(), findById(), save(), remove(), duplicate(), createEmpty()
 */
import { newId } from '@common/ids.js'
import { Quiz } from '@common/session/models/Quiz.js'
import { QUIZ_DATA } from './data/quizzes.js'

const STORAGE_KEY = 'open-day-quiz:quizzes'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : QUIZ_DATA
    return list.map(Quiz.fromJSON)
  } catch {
    // Old data in a broken shape: fall back to the sample set rather than
    // freezing the admin page.
    return QUIZ_DATA.map(Quiz.fromJSON)
  }
}

function persist(quizzes) {
  const raw = JSON.stringify(quizzes.map((quiz) => quiz.toJSON()))
  localStorage.setItem(STORAGE_KEY, raw)
}

export const quizRepository = {
  findAll: () => load(),

  findById(id) {
    return load().find((quiz) => quiz.id === id) ?? null
  },

  /** Insert, or overwrite by id. */
  save(quiz) {
    const quizzes = load()
    const index = quizzes.findIndex((item) => item.id === quiz.id)
    if (index === -1) quizzes.push(quiz)
    else quizzes[index] = quiz

    persist(quizzes)
    return quiz
  },

  remove(id) {
    persist(load().filter((quiz) => quiz.id !== id))
  },

  createEmpty() {
    return new Quiz({ id: newId('quiz'), title: '' })
  },

  duplicate(id) {
    const source = quizRepository.findById(id)
    if (!source) return null

    // Questions in the copy need fresh ids: scores are keyed by questionId, so
    // two questions sharing an id in one session would pick up each other's
    // answers.
    const copy = Quiz.fromJSON({
      id: newId('quiz'),
      title: `${source.title} (copy)`,
      questions: source.questions.map((question) => ({
        ...question.toJSON(),
        id: newId('q'),
      })),
    })
    return quizRepository.save(copy)
  },
}
