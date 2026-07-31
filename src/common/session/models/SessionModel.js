/**
 * Model: the state machine of a game session — the heart of all three screens.
 *
 * Admin / player / display are not three separate apps: all three read the
 * **same** SessionModel and only differ in how they draw that state. That is why
 * this model lives in `common/` instead of belonging to a feature.
 *
 * Immutable: every action returns a new instance; an invalid action returns
 * `this` unchanged. That is what keeps the admin from skipping a question by
 * double-clicking "Next", and lets the repository know nothing changed so it
 * broadcasts nothing.
 *
 * The model never calls `Date.now()` itself — the timestamp is always passed in
 * by the caller, so the game rules stay pure functions.
 *
 * Public API: SESSION_STATES, SessionModel.empty()/fromJSON(), the getters, and
 * the actions openLobby / cancel / start / reveal / next / announceWinner /
 * reset / join / submitAnswer.
 */
import { Leaderboard, pointsOf } from './Leaderboard.js'
import { PrizeBoxes } from './PrizeBoxes.js'
import { Quiz } from './Quiz.js'

/** An avatar id is a short slug; anything else is a client sending junk. */
const MAX_AVATAR_ID_LENGTH = 32

function cleanAvatarId(avatarId) {
  return typeof avatarId === 'string' ? avatarId.slice(0, MAX_AVATAR_ID_LENGTH) : ''
}

export const SESSION_STATES = {
  IDLE: 'idle',
  LOBBY: 'lobby',
  QUESTION: 'question',
  REVEAL: 'reveal',
  PODIUM: 'podium',
  PRIZE: 'prize',
  PRIZE_REVEALED: 'prizeRevealed',
}

/**
 * The table of valid transitions. This is the single place that decides "where
 * can we go from here" — no state `if`s scattered across controllers and views.
 */
const ALLOWED_NEXT = {
  idle: ['lobby'],
  lobby: ['idle', 'question'],
  question: ['reveal'],
  reveal: ['question', 'podium'],
  podium: ['prize'],
  prize: ['prizeRevealed'],
  prizeRevealed: ['idle'],
}

/** Back to the starting line: used when opening a new session or cancelling one. */
const CLEARED_ROUND = {
  currentIndex: 0,
  questionStartedAt: null,
  questionEndsAt: null,
  winnerId: null,
  prizeBoxes: null,
}

export class SessionModel {
  constructor({
    id = null,
    quiz = null,
    state = SESSION_STATES.IDLE,
    currentIndex = 0,
    questionStartedAt = null,
    questionEndsAt = null,
    players = [],
    answers = [],
    winnerId = null,
    prizeBoxes = null,
  }) {
    /**
     * Identifies this run of the game, and changes every time a lobby opens.
     * Phones compare it against the session their stored identity belongs to:
     * same id means "you refreshed, here is your seat back", a different id
     * means the phone has been handed to somebody else and has to join afresh.
     * Passed in rather than generated here, like every other non-pure value in
     * this model.
     */
    this.id = id
    this.quiz = quiz
    this.state = state
    this.currentIndex = currentIndex
    /** When the current question started — used to measure how fast people answer. */
    this.questionStartedAt = questionStartedAt
    /** When the current question ends, see the "countdown" note below. */
    this.questionEndsAt = questionEndsAt
    this.players = players
    this.answers = answers
    /** Who gets the prize; the admin confirms it at the announcement step (usually rank 1). */
    this.winnerId = winnerId
    /** The three prize boxes, only present once the winner has been announced. */
    this.prizeBoxes = prizeBoxes
  }

  static empty() {
    return new SessionModel({})
  }

  static fromJSON(raw) {
    return new SessionModel({
      ...raw,
      quiz: raw.quiz ? Quiz.fromJSON(raw.quiz) : null,
      prizeBoxes: raw.prizeBoxes ? PrizeBoxes.fromJSON(raw.prizeBoxes) : null,
    })
  }

  #with(patch) {
    return new SessionModel({ ...this, ...patch })
  }

  /** Change state when ALLOWED_NEXT permits it, otherwise stand still. */
  #to(state, patch = {}) {
    if (!ALLOWED_NEXT[this.state].includes(state)) return this
    return this.#with({ state, ...patch })
  }

  /**
   * Timing for one question. Stores the **end timestamp** instead of "N seconds
   * left" so every device subtracts against its own clock: if each device
   * counted down independently from N seconds, after a few questions the phones
   * and the projector would drift seconds apart.
   */
  #timingOf(index, now) {
    const question = this.quiz.questionAt(index)
    return {
      questionStartedAt: now,
      questionEndsAt: now + question.durationSeconds * 1000,
    }
  }

  // ---- derived state ----

  get total() {
    return this.quiz?.total ?? 0
  }

  get currentQuestion() {
    return this.quiz?.questionAt(this.currentIndex) ?? null
  }

  get questionNumber() {
    return this.currentIndex + 1
  }

  get isLastQuestion() {
    return this.total > 0 && this.currentIndex === this.total - 1
  }

  /** The questions are done; we are in the podium and prize-giving stretch. */
  get isAfterPlay() {
    return [
      SESSION_STATES.PODIUM,
      SESSION_STATES.PRIZE,
      SESSION_STATES.PRIZE_REVEALED,
    ].includes(this.state)
  }

  /** How much of the game has been played, 0 → 100. */
  get progress() {
    if (this.total === 0) return 0
    if (this.isAfterPlay) return 100

    // At the reveal step the current question counts as finished.
    const done =
      this.state === SESSION_STATES.REVEAL
        ? this.questionNumber
        : this.currentIndex
    return (Math.min(done, this.total) / this.total) * 100
  }

  get isIdle() {
    return this.state === SESSION_STATES.IDLE
  }

  get isCounting() {
    return this.state === SESSION_STATES.QUESTION
  }

  // ---- countdown ----

  remainingMs(now) {
    if (this.questionEndsAt === null) return 0
    return Math.max(0, this.questionEndsAt - now)
  }

  remainingSeconds(now) {
    return Math.ceil(this.remainingMs(now) / 1000)
  }

  isTimeUp(now) {
    return this.questionEndsAt !== null && now >= this.questionEndsAt
  }

  // ---- players and answers ----

  get playerCount() {
    return this.players.length
  }

  findPlayer(playerId) {
    return this.players.find((player) => player.id === playerId) ?? null
  }

  hasName(name) {
    const wanted = name.trim().toLowerCase()
    return this.players.some((player) => player.name.toLowerCase() === wanted)
  }

  /**
   * The animals already spoken for. An avatar belongs to exactly one player per
   * session, so the join form draws these as unavailable — see `join` for why
   * the rule lives in the model and not only in the picker.
   */
  get takenAvatarIds() {
    return this.players.map((player) => player.avatarId)
  }

  isAvatarTaken(avatarId) {
    return this.players.some((player) => player.avatarId === avatarId)
  }

  get currentAnswers() {
    const question = this.currentQuestion
    if (!question) return []
    return this.answers.filter((answer) => answer.questionId === question.id)
  }

  get answeredCount() {
    return this.currentAnswers.length
  }

  currentAnswerOf(playerId) {
    return (
      this.currentAnswers.find((answer) => answer.playerId === playerId) ?? null
    )
  }

  /** Did this player get the current question right? null = has not answered. */
  isCorrectOf(playerId) {
    const answer = this.currentAnswerOf(playerId)
    if (!answer) return null
    return this.currentQuestion.isCorrect(answer.optionIndex)
  }

  /** Points this player just earned on the current question. */
  currentPointsOf(playerId) {
    return pointsOf(this.currentQuestion, this.currentAnswerOf(playerId))
  }

  /**
   * The leaderboard is recomputed from the answers on every call instead of
   * storing a score on each player: only a few dozen people and a handful of
   * questions, and it rules out stored scores drifting out of sync with answers.
   */
  get leaderboard() {
    return Leaderboard.from(this)
  }

  get winner() {
    return this.winnerId ? this.findPlayer(this.winnerId) : null
  }

  /** How many people picked each option on the current question — the display draws this at reveal. */
  get currentDistribution() {
    const question = this.currentQuestion
    if (!question) return []
    return question.options.map(
      (_, i) =>
        this.currentAnswers.filter((answer) => answer.optionIndex === i).length,
    )
  }

  // ---- admin actions ----

  openLobby(quiz, id) {
    return this.#to(SESSION_STATES.LOBBY, {
      id,
      quiz,
      ...CLEARED_ROUND,
      players: [],
      answers: [],
    })
  }

  cancel() {
    return this.#to(SESSION_STATES.IDLE, { id: null, ...CLEARED_ROUND })
  }

  start(now) {
    if (!this.quiz?.isPlayable) return this
    return this.#to(SESSION_STATES.QUESTION, {
      currentIndex: 0,
      ...this.#timingOf(0, now),
    })
  }

  /** Close the question and reveal the answer. Clearing the deadline stops the clock everywhere. */
  reveal() {
    return this.#to(SESSION_STATES.REVEAL, { questionEndsAt: null })
  }

  /** Move to the next question, or to the podium when there are none left. */
  next(now) {
    if (this.state !== SESSION_STATES.REVEAL) return this
    if (this.isLastQuestion) return this.#to(SESSION_STATES.PODIUM)

    const index = this.currentIndex + 1
    return this.#to(SESSION_STATES.QUESTION, {
      currentIndex: index,
      ...this.#timingOf(index, now),
    })
  }

  /**
   * Announce the winner. The winner has to be named explicitly — the prize step
   * needs to know whose it is. The three boxes are shuffled right here, so every
   * round gets a different arrangement.
   */
  announceWinner(winnerId, boxes = PrizeBoxes.shuffled()) {
    if (!winnerId || !this.findPlayer(winnerId)) return this
    return this.#to(SESSION_STATES.PRIZE, { winnerId, prizeBoxes: boxes })
  }

  /** Pick a prize box. Only the winner may pick, and only once. */
  pickBox({ playerId, index }) {
    if (this.state !== SESSION_STATES.PRIZE) return this
    if (playerId !== this.winnerId) return this

    const prizeBoxes = this.prizeBoxes.withPicked(index)
    if (prizeBoxes === this.prizeBoxes) return this

    return this.#to(SESSION_STATES.PRIZE_REVEALED, { prizeBoxes })
  }

  reset() {
    return SessionModel.empty()
  }

  // ---- player actions ----

  /**
   * Join the session. Joining late mid-game is allowed — Open Day visitors turn
   * up in dribs and drabs, and a latecomer only misses the points of the
   * questions already played. A returning player (refresh, screen lock) keeps
   * their name and score instead of becoming a new person.
   *
   * **Two people cannot share an animal.** The picker already hides the taken
   * ones, but the picker is on a phone reading a snapshot that is a moment old:
   * when two visitors tap the same animal at the same instant, only the one
   * whose intent reaches the server first can have it, and the other is sent
   * back to the form to pick again. Enforcing it here rather than only on the
   * phone is what makes the avatar a reliable way to tell two players apart on
   * the projector.
   */
  join({ id, name, avatarId, joinedAt }) {
    if (this.isIdle) return this
    if (this.findPlayer(id)) return this

    const avatar = cleanAvatarId(avatarId)
    if (avatar === '' || this.isAvatarTaken(avatar)) return this

    return this.#with({
      players: [
        ...this.players,
        // The avatar travels as a bare id. The model deliberately does not know
        // the catalogue: the animations are ~600KB of JSON that only a browser
        // ever needs, and importing them here would drag them into the node
        // server too, which runs this very file. Whoever draws the avatar
        // resolves the id, and falls back when it is unknown.
        { id, name: name.trim(), avatarId: avatar, joinedAt },
      ],
    })
  }

  /** Accept an answer: only during a question, before time is up, once per question. */
  submitAnswer({ playerId, optionIndex, now }) {
    const question = this.currentQuestion
    if (this.state !== SESSION_STATES.QUESTION || !question) return this
    if (this.isTimeUp(now)) return this
    if (!this.findPlayer(playerId)) return this
    if (this.currentAnswerOf(playerId)) return this

    const answer = {
      playerId,
      questionId: question.id,
      optionIndex,
      msTaken: now - this.questionStartedAt,
    }
    return this.#with({ answers: [...this.answers, answer] })
  }

  toJSON() {
    return { ...this, quiz: this.quiz?.toJSON() ?? null }
  }
}
