/**
 * Model: scoring and ranking for one game session.
 *
 * Why not 1 point per question: an Open Day round is only about 5 questions, and
 * scoring that way leaves a crowd of people tied with no way to pick the few
 * winners a prize is handed to. So a correct answer = base points + a speed
 * bonus.
 *
 * **Equal scores share a rank.** The ordering still puts the faster player
 * first, but the number next to the row only follows the score: two people on
 * 3200 are both 2nd and the row under them is 4th. Nobody is pushed down a place
 * for something they cannot see, and it is the ranking a hall reads off a
 * projector without arguing.
 *
 * Time is still the tiebreak that hands out the **prizes**: the faster of two
 * players sharing a place takes the winning slot without the admin doing
 * anything. Only an exact tie on score *and* time is undecidable — and only when
 * it falls across the line between winning and not, which is `hasTieAt(count)`.
 * Then the admin fills the remaining slots by hand from the control desk.
 *
 * Does not import React and does not know where the session is stored — it only
 * takes a session in and returns a ranking.
 *
 * Public API: BASE_POINTS, MAX_SPEED_BONUS, TOP_COUNT,
 * pointsOf(question, answer), Leaderboard.from(session)
 */
export const BASE_POINTS = 1000
export const MAX_SPEED_BONUS = 500

/**
 * How many rows any public board carries — the standings between two questions
 * and the final leaderboard alike. Ten is what a projector holds at a readable
 * size, and it is a rule of the round rather than a layout choice: the phone and
 * the big screen show the same ten, and everybody below the tenth place learns
 * their own rank and nobody else's.
 */
export const TOP_COUNT = 10

/** Points for one answer. Wrong or unanswered scores 0. */
export function pointsOf(question, answer) {
  if (!question || !answer) return 0
  if (!question.isCorrect(answer.optionIndex)) return 0

  const limitMs = question.durationSeconds * 1000
  const leftRatio = Math.max(0, 1 - answer.msTaken / limitMs)
  return BASE_POINTS + Math.round(MAX_SPEED_BONUS * leftRatio)
}

/**
 * Attach ranks to an already sorted list. Competition ranking on the score
 * alone: equal scores share a rank, then the used-up ranks are skipped
 * (1, 2, 2, 4) — not 1, 2, 2, 3. The faster of two equal scores still comes
 * first in the list, it just does not get a better number for it.
 */
function withRanks(sorted) {
  let rank = 0
  let previousScore = null

  return sorted.map((row, index) => {
    if (row.score !== previousScore) rank = index + 1
    previousScore = row.score

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

  /** The only slice a player or the big screen is ever shown — see `TOP_COUNT`. */
  get topTen() {
    return this.rows.slice(0, TOP_COUNT)
  }

  /** The `count` players the round hands a prize to when nothing is tied. */
  winnerRows(count) {
    return this.rows.slice(0, Math.max(0, count))
  }

  /**
   * The players the round cannot tell apart across the winning line: same score
   * **and** same total answering time as the last winning slot, so there is no
   * rule left to rank them by and more of them than there are prizes. Sharing a
   * place on score alone is not one of these — the faster player takes the slot.
   *
   * Empty when the line falls cleanly, which is the normal case: the speed bonus
   * is measured in milliseconds and two people almost never land on the very
   * same number.
   */
  tiedRowsAt(count) {
    const last = this.rows[count - 1]
    const next = this.rows[count]
    if (!last || !next) return []
    if (last.score !== next.score || last.totalMs !== next.totalMs) return []

    return this.rows.filter(
      (row) => row.score === last.score && row.totalMs === last.totalMs,
    )
  }

  hasTieAt(count) {
    return this.tiedRowsAt(count).length > 0
  }

  /**
   * The winners that are settled whatever the admin decides about a tie — the
   * rows above the tied group. Equal to `winnerRows` when there is no tie, so
   * the control desk can always show these as already won and only ask about
   * the slots left over.
   */
  settledRows(count) {
    const tied = this.tiedRowsAt(count)
    if (tied.length === 0) return this.winnerRows(count)
    return this.rows.slice(0, this.rows.indexOf(tied[0]))
  }

  rowOf(playerId) {
    return this.rows.find((row) => row.playerId === playerId) ?? null
  }

  /**
   * The top rows, each carrying where that player stood in `previous`:
   * `previousRank`, `previousScore`, `previousIndex` (their line in the earlier
   * ordering, so a view can move the row from where it was) and `rankDelta`,
   * positive when they climbed.
   *
   * Everything is `null` / 0 for somebody the earlier ranking does not know — a
   * latecomer, or the first scored question, where there is no "before" to
   * compare against and a change on every row would be noise.
   */
  movementFrom(previous) {
    const before = new Map(
      previous.rows.map((row, index) => [row.playerId, { ...row, index }]),
    )

    return this.topTen.map((row) => {
      const was = before.get(row.playerId) ?? null

      return {
        ...row,
        previousRank: was?.rank ?? null,
        previousScore: was?.score ?? 0,
        previousIndex: was?.index ?? null,
        rankDelta: was ? was.rank - row.rank : null,
      }
    })
  }
}
