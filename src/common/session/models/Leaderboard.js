/**
 * Model: scoring and ranking for one game session.
 *
 * Why not 1 point per question: an Open Day round is only about 5 questions, and
 * scoring that way leaves a crowd of people tied with no way to pick **one**
 * winner to hand a prize to. So a correct answer = base points + a speed bonus.
 *
 * Ties are broken by total answering time (faster ranks higher). Equal on both
 * score and time means both share a rank — at that point the admin picks the
 * winner by hand from the control desk.
 *
 * Does not import React and does not know where the session is stored — it only
 * takes a session in and returns a ranking.
 *
 * Public API: BASE_POINTS, MAX_SPEED_BONUS, pointsOf(question, answer),
 * Leaderboard.from(session)
 */
export const BASE_POINTS = 1000
export const MAX_SPEED_BONUS = 500

/** Points for one answer. Wrong or unanswered scores 0. */
export function pointsOf(question, answer) {
  if (!question || !answer) return 0
  if (!question.isCorrect(answer.optionIndex)) return 0

  const limitMs = question.durationSeconds * 1000
  const leftRatio = Math.max(0, 1 - answer.msTaken / limitMs)
  return BASE_POINTS + Math.round(MAX_SPEED_BONUS * leftRatio)
}

/**
 * Attach ranks to an already sorted list. Competition ranking: equals share a
 * rank, then the used-up ranks are skipped (1, 2, 2, 4) — not 1, 2, 2, 3.
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

      return {
        playerId: player.id,
        name: player.name,
        avatarId: player.avatarId,
        score,
        correctCount,
        totalMs,
      }
    })

    rows.sort(
      (a, b) =>
        b.score - a.score ||
        a.totalMs - b.totalMs ||
        a.name.localeCompare(b.name, 'en'),
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

  /** Several people sharing first place → the admin has to choose who gets the prize. */
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
