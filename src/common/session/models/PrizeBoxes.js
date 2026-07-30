/**
 * Model: the three mystery prize boxes at the end of a round.
 *
 * The README asks for the prize positions to be reshuffled every game — that is
 * a **game rule**, not a UI effect, so it belongs to the model. Shuffled with
 * Fisher–Yates (every permutation equally likely, unlike
 * `sort(() => Math.random() - 0.5)` which skews the distribution), and `random`
 * is passed in so a caller can supply a fixed function to reproduce a situation.
 *
 * Public API: PRIZES, PrizeBoxes.shuffled(), fromJSON(), withPicked(index)
 */
export const PRIZES = ['Course Magnet', 'FabLab Sticker', '3D Printed Figure']

export class PrizeBoxes {
  constructor({ prizes, pickedIndex = null }) {
    /** prizes[i] = the prize inside box number i. */
    this.prizes = prizes
    this.pickedIndex = pickedIndex
  }

  static fromJSON(raw) {
    return new PrizeBoxes(raw)
  }

  static shuffled(random = Math.random) {
    const prizes = [...PRIZES]
    for (let i = prizes.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1))
      const swap = prizes[i]
      prizes[i] = prizes[j]
      prizes[j] = swap
    }
    return new PrizeBoxes({ prizes })
  }

  get count() {
    return this.prizes.length
  }

  get isPicked() {
    return this.pickedIndex !== null
  }

  get pickedPrize() {
    return this.isPicked ? this.prizes[this.pickedIndex] : null
  }

  /** Pick a box. Once picked, no changing your mind. */
  withPicked(index) {
    if (this.isPicked) return this
    if (index < 0 || index >= this.count) return this
    return new PrizeBoxes({ prizes: this.prizes, pickedIndex: index })
  }

  toJSON() {
    return { prizes: this.prizes, pickedIndex: this.pickedIndex }
  }
}
