/**
 * Model: chấm điểm và sắp hạng cho một phiên chơi.
 *
 * Vì sao không chấm 1 điểm mỗi câu: trận Open Day chỉ khoảng 5 câu, chấm kiểu
 * đó thì hàng loạt người đồng điểm và không chọn ra được **một** người thắng để
 * trao quà. Nên điểm một câu đúng = điểm cơ bản + thưởng theo tốc độ trả lời.
 *
 * Đồng điểm thì hơn nhau ở tổng thời gian trả lời (nhanh hơn xếp trên). Bằng
 * nhau cả điểm và cả thời gian thì hai người cùng hạng — lúc đó admin tự chọn
 * người thắng ở bàn điều khiển.
 *
 * Không import React, không biết session được lưu ở đâu — chỉ nhận session vào
 * và trả về bảng hạng.
 *
 * Public API: BASE_POINTS, MAX_SPEED_BONUS, pointsOf(question, answer),
 * Leaderboard.from(session)
 */
export const BASE_POINTS = 1000
export const MAX_SPEED_BONUS = 500

/** Điểm cho một đáp án. Sai hoặc không trả lời thì 0 điểm. */
export function pointsOf(question, answer) {
  if (!question || !answer) return 0
  if (!question.isCorrect(answer.optionIndex)) return 0

  const limitMs = question.durationSeconds * 1000
  const leftRatio = Math.max(0, 1 - answer.msTaken / limitMs)
  return BASE_POINTS + Math.round(MAX_SPEED_BONUS * leftRatio)
}

/**
 * Gắn hạng vào danh sách đã sắp. Hạng kiểu thi đấu: bằng nhau thì cùng hạng,
 * rồi bỏ qua các hạng đã dùng (1, 2, 2, 4) — không phải 1, 2, 2, 3.
 */
function withRanks(sorted) {
  let rank = 0
  let previous = null

  return sorted.map((row, index) => {
    const isTied =
      previous !== null &&
      previous.score === row.score &&
      previous.totalMs === row.totalMs
    if (!isTied) rank = index + 1
    previous = row

    return { ...row, rank }
  })
}

export class Leaderboard {
  constructor(rows) {
    this.rows = rows
  }

  static from(session) {
    const questionById = new Map(
      (session.quiz?.questions ?? []).map((question) => [question.id, question]),
    )

    const rows = session.players.map((player) => {
      const answers = session.answers.filter(
        (answer) => answer.playerId === player.id,
      )

      let score = 0
      let correctCount = 0
      let totalMs = 0
      for (const answer of answers) {
        const points = pointsOf(questionById.get(answer.questionId), answer)
        score += points
        if (points > 0) correctCount += 1
        totalMs += answer.msTaken
      }

      return { playerId: player.id, name: player.name, score, correctCount, totalMs }
    })

    rows.sort(
      (a, b) =>
        b.score - a.score ||
        a.totalMs - b.totalMs ||
        a.name.localeCompare(b.name, 'vi'),
    )

    return new Leaderboard(withRanks(rows))
  }

  get isEmpty() {
    return this.rows.length === 0
  }

  get top() {
    return this.rows.slice(0, 3)
  }

  get winner() {
    return this.rows[0] ?? null
  }

  /** Nhiều người cùng hạng nhất → admin phải tự chọn ai nhận quà. */
  get topRows() {
    return this.rows.filter((row) => row.rank === 1)
  }

  get hasTieAtTop() {
    return this.topRows.length > 1
  }

  rowOf(playerId) {
    return this.rows.find((row) => row.playerId === playerId) ?? null
  }
}
