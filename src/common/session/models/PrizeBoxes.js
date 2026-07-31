/**
 * Model: the three mystery prize boxes at the end of a round.
 *
 * The README asks for the prize positions to be reshuffled every game — that is
 * a **game rule**, not a UI effect, so it belongs to the model. Shuffled with
 * Fisher–Yates (every permutation equally likely, unlike
 * `sort(() => Math.random() - 0.5)` which skews the distribution), and `random`
 * is passed in so a caller can supply a fixed function to reproduce a situation.
 *
 * A box holds a **prize id**, not the prize itself: that is all the session
 * state has to carry across the wire, and the catalogue below stays the one
 * place where the wording of a prize is written down. The views read the rest
 * of it through `prizeAt()` / `pickedPrize`.
 *
 * Public API: PRIZES, prizeById(), PrizeBoxes.shuffled(), fromJSON(),
 * prizeAt(index), withPicked(index)
 */
export const PRIZES = [
  {
    id: 'course-magnet',
    name: 'Course Magnet',
    description: 'A fridge magnet with the course logo on it.',
  },
  {
    id: 'fablab-sticker',
    name: 'FabLab Sticker',
    description: 'A vinyl sticker cut in the university FabLab.',
  },
  {
    id: 'printed-figure',
    name: '3D Printed Figure',
    description: 'A small mascot printed on a lab 3D printer.',
  },
]

/** Falls back to the bare id so an unknown prize still renders as *something*. */
export function prizeById(id) {
  return PRIZES.find((prize) => prize.id === id) ?? { id, name: id, description: '' }
}

export class PrizeBoxes {
  constructor({ prizeIds, pickedIndex = null }) {
    /** prizeIds[i] = the prize inside box number i. */
    this.prizeIds = prizeIds
    this.pickedIndex = pickedIndex
  }

  static fromJSON(raw) {
    return new PrizeBoxes(raw)
  }

  static shuffled(random = Math.random) {
    const prizeIds = PRIZES.map((prize) => prize.id)
    for (let i = prizeIds.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1))
      const swap = prizeIds[i]
      prizeIds[i] = prizeIds[j]
      prizeIds[j] = swap
    }
    return new PrizeBoxes({ prizeIds })
  }

  get count() {
    return this.prizeIds.length
  }

  get isPicked() {
    return this.pickedIndex !== null
  }

  /** The full prize inside box number `index`. */
  prizeAt(index) {
    return prizeById(this.prizeIds[index])
  }

  get pickedPrize() {
    return this.isPicked ? this.prizeAt(this.pickedIndex) : null
  }

  /** Pick a box. Once picked, no changing your mind. */
  withPicked(index) {
    if (this.isPicked) return this
    if (index < 0 || index >= this.count) return this
    return new PrizeBoxes({ prizeIds: this.prizeIds, pickedIndex: index })
  }

  toJSON() {
    return { prizeIds: this.prizeIds, pickedIndex: this.pickedIndex }
  }
}
