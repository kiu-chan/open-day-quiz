/**
 * Model: ba hộp quà bí mật của cuối trận.
 *
 * README yêu cầu vị trí quà được xáo lại mỗi lượt chơi — đây là **luật chơi**
 * chứ không phải hiệu ứng giao diện, nên nó thuộc model. Xáo bằng Fisher–Yates
 * (mỗi hoán vị có xác suất bằng nhau, khác với `sort(() => Math.random() - 0.5)`
 * cho ra phân bố lệch), và nhận `random` từ ngoài để chỗ gọi có thể truyền một
 * hàm cố định khi cần dựng lại đúng một tình huống.
 *
 * Public API: PRIZES, PrizeBoxes.shuffled(), fromJSON(), withPicked(index)
 */
export const PRIZES = ['Course Magnet', 'FabLab Sticker', '3D Printed Figure']

export class PrizeBoxes {
  constructor({ prizes, pickedIndex = null }) {
    /** prizes[i] = phần quà nằm trong hộp thứ i. */
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

  /** Chọn hộp. Đã chọn rồi thì không cho đổi ý. */
  withPicked(index) {
    if (this.isPicked) return this
    if (index < 0 || index >= this.count) return this
    return new PrizeBoxes({ prizes: this.prizes, pickedIndex: index })
  }

  toJSON() {
    return { prizes: this.prizes, pickedIndex: this.pickedIndex }
  }
}
