/**
 * Model: toàn bộ luật chơi của bài quiz.
 * Bất biến — mỗi hành động trả về một QuizModel mới, nên React chỉ cần
 * so sánh tham chiếu là biết phải render lại.
 */
export class QuizModel {
  constructor({ questions, index = 0, answers = [] }) {
    this.questions = questions
    this.index = index
    /** answers[i] = chỉ số đáp án đã chọn ở câu i, hoặc null nếu chưa chọn. */
    this.answers = answers
  }

  static create(questions) {
    return new QuizModel({ questions })
  }

  #with(patch) {
    return new QuizModel({
      questions: this.questions,
      index: this.index,
      answers: this.answers,
      ...patch,
    })
  }

  get total() {
    return this.questions.length
  }

  get currentQuestion() {
    return this.questions[this.index] ?? null
  }

  /** Đáp án người dùng đã chọn ở câu hiện tại (null nếu chưa chọn). */
  get pickedIndex() {
    return this.answers[this.index] ?? null
  }

  /** Đã chọn rồi thì lộ đáp án đúng/sai. */
  get isRevealed() {
    return this.pickedIndex !== null
  }

  get isFinished() {
    return this.index >= this.total
  }

  get isLastQuestion() {
    return this.index === this.total - 1
  }

  get score() {
    return this.questions.reduce(
      (sum, question, i) =>
        question.isCorrect(this.answers[i] ?? -1) ? sum + 1 : sum,
      0,
    )
  }

  get isPerfect() {
    return this.total > 0 && this.score === this.total
  }

  /** 0 → 100, dùng cho progress bar. */
  get progress() {
    if (this.total === 0) return 100
    return (Math.min(this.index, this.total) / this.total) * 100
  }

  /** Chọn đáp án. Đã chọn rồi thì bỏ qua (không cho đổi ý). */
  answer(optionIndex) {
    if (this.isFinished || this.isRevealed) return this

    const answers = [...this.answers]
    answers[this.index] = optionIndex
    return this.#with({ answers })
  }

  /** Sang câu kế tiếp. Chưa chọn đáp án thì chưa cho đi. */
  next() {
    if (this.isFinished || !this.isRevealed) return this
    return this.#with({ index: this.index + 1 })
  }

  restart() {
    return QuizModel.create(this.questions)
  }
}
