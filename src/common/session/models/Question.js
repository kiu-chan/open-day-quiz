/**
 * Entity: một câu hỏi và quy tắc chấm đúng/sai của nó.
 * Dùng chung: admin soạn nó, player trả lời nó, display chiếu nó.
 * Không biết gì về React.
 */
export const DEFAULT_DURATION_SECONDS = 20
export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 4
export const MIN_DURATION_SECONDS = 5
export const MAX_DURATION_SECONDS = 120

export class Question {
  constructor({
    id,
    prompt = '',
    options = ['', ''],
    correctIndex = 0,
    durationSeconds = DEFAULT_DURATION_SECONDS,
  }) {
    this.id = id
    this.prompt = prompt
    this.options = options
    this.correctIndex = correctIndex
    /** Thời lượng đếm ngược là luật chơi, nên nó thuộc model chứ không thuộc view. */
    this.durationSeconds = durationSeconds
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

  /** Đủ điều kiện đem ra chơi: có nội dung, ≥2 đáp án, đáp án đúng hợp lệ. */
  get isValid() {
    return (
      this.prompt.trim().length > 0 &&
      this.options.length >= 2 &&
      this.options.every((option) => option.trim().length > 0) &&
      this.correctIndex >= 0 &&
      this.correctIndex < this.options.length
    )
  }

  // ---- sửa câu hỏi (admin), bất biến như mọi model khác ----

  /** Bản mới với vài trường được thay. */
  with(patch) {
    return new Question({ ...this, ...patch })
  }

  withPrompt(prompt) {
    return this.with({ prompt })
  }

  withOptionAt(index, text) {
    const options = [...this.options]
    options[index] = text
    return this.with({ options })
  }

  get canAddOption() {
    return this.options.length < MAX_OPTIONS
  }

  withOptionAdded() {
    if (!this.canAddOption) return this
    return this.with({ options: [...this.options, ''] })
  }

  get canRemoveOption() {
    return this.options.length > MIN_OPTIONS
  }

  /**
   * Bỏ một đáp án. Phải luôn còn ≥2 ô, và `correctIndex` không được trỏ ra
   * ngoài mảng: bỏ đúng ô đang là đáp án đúng thì dồn đáp án đúng về ô đầu,
   * bỏ ô nằm trước nó thì kéo chỉ số lùi một bước.
   */
  withOptionRemoved(index) {
    if (!this.canRemoveOption) return this

    const options = this.options.filter((_, i) => i !== index)
    let correctIndex = this.correctIndex
    if (index === this.correctIndex) correctIndex = 0
    else if (index < this.correctIndex) correctIndex -= 1

    return this.with({ options, correctIndex })
  }

  withCorrect(index) {
    if (index < 0 || index >= this.options.length) return this
    return this.with({ correctIndex: index })
  }

  /** Kẹp thời lượng trong khoảng chơi được: quá ngắn thì không ai kịp bấm. */
  withDuration(seconds) {
    const clamped = Math.min(
      MAX_DURATION_SECONDS,
      Math.max(MIN_DURATION_SECONDS, Math.round(seconds) || MIN_DURATION_SECONDS),
    )
    return this.with({ durationSeconds: clamped })
  }

  toJSON() {
    return {
      id: this.id,
      prompt: this.prompt,
      options: this.options,
      correctIndex: this.correctIndex,
      durationSeconds: this.durationSeconds,
    }
  }
}
