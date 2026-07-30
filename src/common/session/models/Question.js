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
    image = null,
    options = ['', ''],
    optionImages = [],
    correctIndex = 0,
    durationSeconds = DEFAULT_DURATION_SECONDS,
  }) {
    this.id = id
    this.prompt = prompt
    /**
     * Ảnh minh hoạ, lưu dưới dạng đường dẫn `/api/images/...` chứ không phải
     * data URI — xem `server/imageStore.js` để biết vì sao.
     */
    this.image = image
    this.options = options
    /**
     * Ảnh của từng đáp án, luôn dài đúng bằng `options` và luôn cùng thứ tự.
     * Chuẩn hoá ngay ở constructor để không có đường nào tạo ra được một câu
     * hỏi mà ảnh lệch khỏi đáp án của nó.
     */
    this.optionImages = options.map((_, i) => optionImages[i] ?? null)
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

  imageOf(optionIndex) {
    return this.optionImages[optionIndex] ?? null
  }

  /**
   * Đủ điều kiện đem ra chơi: có nội dung, ≥2 đáp án, đáp án đúng hợp lệ.
   * Ảnh tính là nội dung — câu hỏi kiểu "đây là công trình nào?" hoàn toàn có
   * thể chỉ có ảnh, và đáp án cũng vậy (bốn tấm ảnh, chọn một).
   */
  get isValid() {
    const isFilled = (text, image) => text.trim().length > 0 || Boolean(image)

    return (
      isFilled(this.prompt, this.image) &&
      this.options.length >= 2 &&
      this.options.every((option, i) => isFilled(option, this.imageOf(i))) &&
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

  /** `null` để gỡ ảnh ra khỏi câu hỏi. */
  withImage(image) {
    return this.with({ image })
  }

  withOptionAt(index, text) {
    const options = [...this.options]
    options[index] = text
    return this.with({ options })
  }

  withOptionImageAt(index, image) {
    const optionImages = [...this.optionImages]
    optionImages[index] = image
    return this.with({ optionImages })
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
    // Ảnh phải rơi cùng một nhịp với đáp án, không thì bỏ ô B xong ảnh của C
    // nhảy sang nằm cạnh chữ của B.
    const optionImages = this.optionImages.filter((_, i) => i !== index)

    let correctIndex = this.correctIndex
    if (index === this.correctIndex) correctIndex = 0
    else if (index < this.correctIndex) correctIndex -= 1

    return this.with({ options, optionImages, correctIndex })
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
      image: this.image,
      options: this.options,
      optionImages: this.optionImages,
      correctIndex: this.correctIndex,
      durationSeconds: this.durationSeconds,
    }
  }
}
