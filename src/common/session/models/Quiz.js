/**
 * Entity: a quiz = a title + a list of questions.
 * The admin writes and saves it; when a session opens, the session keeps its own
 * copy of the quiz so editing the quiz mid-game cannot disturb the running round.
 */
import { Question } from './Question.js'

export class Quiz {
  constructor({ id, title = '', questions = [] }) {
    this.id = id
    this.title = title
    this.questions = questions
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
      questions: this.questions.map((question) => question.toJSON()),
    }
  }
}
