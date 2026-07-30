/**
 * Entity: một câu hỏi và quy tắc chấm đúng/sai của nó.
 * Không biết gì về React.
 */
export class Question {
  constructor({ id, prompt, options, correctIndex }) {
    this.id = id
    this.prompt = prompt
    this.options = options
    this.correctIndex = correctIndex
  }

  static fromJSON(raw) {
    return new Question(raw)
  }

  isCorrect(optionIndex) {
    return optionIndex === this.correctIndex
  }

  /** Nhãn A, B, C... cho ô đáp án. */
  labelOf(optionIndex) {
    return String.fromCharCode(65 + optionIndex)
  }
}
