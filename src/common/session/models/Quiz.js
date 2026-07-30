/**
 * Entity: một bộ quiz = tên + danh sách câu hỏi.
 * Admin soạn và lưu lại; khi mở phiên chơi, session giữ luôn bản quiz này để
 * admin sửa bộ quiz giữa lúc đang chơi cũng không làm lệch trận đang diễn ra.
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

  /** Tổng thời lượng, để admin biết trận sẽ dài bao lâu. */
  get totalSeconds() {
    return this.questions.reduce((sum, q) => sum + q.durationSeconds, 0)
  }

  /** Lý do chưa chơi được, tiếng Việt, để admin sửa. Rỗng = chơi được. */
  get errors() {
    const errors = []
    if (this.title.trim().length === 0) errors.push('Bộ quiz chưa có tên')
    if (this.total === 0) errors.push('Bộ quiz chưa có câu hỏi nào')

    const invalid = this.questions
      .map((question, i) => (question.isValid ? null : i + 1))
      .filter((number) => number !== null)
    if (invalid.length > 0) {
      errors.push(`Câu ${invalid.join(', ')} còn thiếu nội dung hoặc đáp án đúng`)
    }
    return errors
  }

  get isPlayable() {
    return this.errors.length === 0
  }

  // ---- sửa bộ quiz (admin), bất biến ----

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

  /** Đổi chỗ hai câu liền kề — thứ tự trong danh sách là thứ tự đem ra chơi. */
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
