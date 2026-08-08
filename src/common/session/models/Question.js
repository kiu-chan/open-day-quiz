/**
 * Entity: one question and the rule for marking it right or wrong.
 * Shared: the admin writes it, the player answers it, the display shows it.
 * Knows nothing about React.
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
     * Illustration image, stored as an `/api/images/...` path rather than a data
     * URI — see `server/imageStore.js` for why.
     */
    this.image = image
    this.options = options
    /**
     * One image per option, always exactly as long as `options` and always in
     * the same order. Normalised right in the constructor so there is no path
     * that can produce a question whose images are out of step with its options.
     */
    this.optionImages = options.map((_, i) => optionImages[i] ?? null)
    this.correctIndex = correctIndex
    /** The countdown length is a game rule, so it belongs to the model, not the view. */
    this.durationSeconds = durationSeconds
  }

  static fromJSON(raw) {
    return new Question(raw)
  }

  isCorrect(optionIndex) {
    return optionIndex === this.correctIndex
  }

  /** The A, B, C... label for an option slot. */
  labelOf(optionIndex) {
    return String.fromCharCode(65 + optionIndex)
  }

  imageOf(optionIndex) {
    return this.optionImages[optionIndex] ?? null
  }

  /**
   * Fit to play: has content, ≥2 options, and a valid correct answer.
   * An image counts as content — a "which building is this?" question can very
   * well be image-only, and so can its options (four photos, pick one).
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

  /**
   * The same question with its options in a new order.
   *
   * Without this the correct answer sits wherever the admin typed it, and a
   * quiz written top to bottom hands the room a pattern to play instead of a
   * question — at a stand people do notice that "it is always B". A rule of the
   * round rather than a view concern, so it lives here, and it is the whole
   * question that is permuted: the option images and `correctIndex` are carried
   * along by the same shuffled order, so no arrangement can put A's text next to
   * B's picture or mark the wrong slot correct.
   *
   * Fisher–Yates over an array of positions (every permutation equally likely,
   * unlike `sort(() => Math.random() - 0.5)`), and `random` comes from outside
   * for the same reason as in `PrizeBoxes.shuffled`: the model stays pure and a
   * caller can hand in a fixed function to reproduce a situation.
   */
  shuffledOptions(random = Math.random) {
    const order = this.options.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1))
      const swap = order[i]
      order[i] = order[j]
      order[j] = swap
    }

    return this.with({
      options: order.map((from) => this.options[from]),
      optionImages: order.map((from) => this.optionImages[from]),
      correctIndex: order.indexOf(this.correctIndex),
    })
  }

  // ---- editing a question (admin), immutable like every other model ----

  /** A new copy with a few fields replaced. */
  with(patch) {
    return new Question({ ...this, ...patch })
  }

  withPrompt(prompt) {
    return this.with({ prompt })
  }

  /** Pass `null` to remove the image from the question. */
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
   * Remove an option. There must always be ≥2 slots left, and `correctIndex`
   * must not point past the end of the array: removing the correct option moves
   * the correct answer back to the first slot, and removing an option before it
   * shifts the index down by one.
   */
  withOptionRemoved(index) {
    if (!this.canRemoveOption) return this

    const options = this.options.filter((_, i) => i !== index)
    // The images have to fall in the same step as the options, otherwise
    // removing option B leaves C's image sitting next to B's text.
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

  /** Clamp the duration to a playable range: too short and nobody can tap in time. */
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
