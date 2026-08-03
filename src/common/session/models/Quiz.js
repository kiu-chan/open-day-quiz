/**
 * Entity: a quiz = a title + a list of questions.
 * The admin writes and saves it; when a session opens, the session keeps its own
 * copy of the quiz so editing the quiz mid-game cannot disturb the running round.
 */
import { Question } from './Question.js'

export const MIN_WINNERS = 1
/**
 * The most people one round may hand a prize to. Not a storage limit: every
 * winner opens their own set of boxes, and past five the prize giving takes
 * longer than the quiz did and the projector runs out of room for the boxes.
 */
export const MAX_WINNERS = 5

function clampWinners(count) {
  return Math.min(
    MAX_WINNERS,
    Math.max(MIN_WINNERS, Math.round(count) || MIN_WINNERS),
  )
}

export class Quiz {
  constructor({ id, title = '', questions = [], winnerCount = MIN_WINNERS }) {
    this.id = id
    this.title = title
    this.questions = questions
    /**
     * How many people this quiz hands a prize to at the end. A rule of the
     * round, so it travels with the quiz into the session rather than being
     * typed again on the control desk every time.
     *
     * Clamped here and not only in `withWinnerCount`: `quizzes.json` is a plain
     * file on the server and can be edited by hand, and a quiz asking for 40
     * winners would strand the round at the prize step.
     */
    this.winnerCount = clampWinners(winnerCount)
  }

  static fromJSON(raw) {
    return new Quiz({
      ...raw,
      questions: (raw.questions ?? []).map(Question.fromJSON),
    })
  }

  get total() {
    return this.questions.length
  }

  questionAt(index) {
    return this.questions[index] ?? null
  }

  /** Total duration, so the admin knows how long the round will run. */
  get totalSeconds() {
    return this.questions.reduce((sum, q) => sum + q.durationSeconds, 0)
  }

  /**
   * The countdown every question runs for, or `null` when they do not all share
   * one. The editor needs to tell "all 20s" from "mixed", because a single field
   * for the whole quiz must not claim a value only some questions have.
   */
  get uniformDurationSeconds() {
    if (this.total === 0) return null

    const first = this.questions[0].durationSeconds
    const isShared = this.questions.every(
      (question) => question.durationSeconds === first,
    )
    return isShared ? first : null
  }

  /** Why it is not playable yet, in plain words, so the admin can fix it. Empty = playable. */
  get errors() {
    const errors = []
    if (this.title.trim().length === 0) errors.push('The quiz has no title yet')
    if (this.total === 0) errors.push('The quiz has no questions yet')

    const invalid = this.questions
      .map((question, i) => (question.isValid ? null : i + 1))
      .filter((number) => number !== null)
    if (invalid.length > 0) {
      errors.push(
        `Question ${invalid.join(', ')} is missing content or a correct answer`,
      )
    }
    return errors
  }

  get isPlayable() {
    return this.errors.length === 0
  }

  // ---- editing the quiz (admin), immutable ----

  #with(patch) {
    return new Quiz({ ...this, ...patch })
  }

  withTitle(title) {
    return this.#with({ title })
  }

  /** How many winners the round ends with; the constructor keeps it in range. */
  withWinnerCount(count) {
    return this.#with({ winnerCount: count })
  }

  /**
   * Give every question the same countdown. The clamping to a playable range is
   * `Question.withDuration`'s job, so setting it for the whole quiz cannot slip
   * past the limits one question at a time can't.
   */
  withDurationForAll(seconds) {
    if (this.total === 0) return this
    return this.#with({
      questions: this.questions.map((question) => question.withDuration(seconds)),
    })
  }

  withQuestionAdded(question) {
    return this.#with({ questions: [...this.questions, question] })
  }

  withQuestionAt(index, question) {
    const questions = [...this.questions]
    questions[index] = question
    return this.#with({ questions })
  }

  withQuestionRemoved(index) {
    return this.#with({
      questions: this.questions.filter((_, i) => i !== index),
    })
  }

  /** Swap two neighbouring questions — list order is the order they are played in. */
  withQuestionMoved(index, delta) {
    const target = index + delta
    if (target < 0 || target >= this.total) return this

    const questions = [...this.questions]
    const moved = questions[index]
    questions[index] = questions[target]
    questions[target] = moved
    return this.#with({ questions })
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      winnerCount: this.winnerCount,
      questions: this.questions.map((question) => question.toJSON()),
    }
  }
}
