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
 * the actions openLobby / cancel / start / reveal / next / announceWinners /
 * setAutoAdvance / reset / join / leave / submitAnswer.
 */
import { Leaderboard, pointsOf } from './Leaderboard.js'
import { PrizeBoxes } from './PrizeBoxes.js'
import { Quiz } from './Quiz.js'

/** An avatar id is a short slug; anything else is a client sending junk. */
const MAX_AVATAR_ID_LENGTH = 32

/**
 * How many players a round needs before it may start. A quiz with one or two
 * people on the leaderboard is not a game, and at a stand it usually means the
 * host pressed Start while the queue was still scanning the QR code. It is a
 * rule of the round, so it is enforced here rather than only greying out the
 * button — the admin page is not the only thing that can send `start`.
 */
export const MIN_PLAYERS = 3

function cleanAvatarId(avatarId) {
  return typeof avatarId === 'string' ? avatarId.slice(0, MAX_AVATAR_ID_LENGTH) : ''
}

export const SESSION_STATES = {
  IDLE: 'idle',
  LOBBY: 'lobby',
  QUESTION: 'question',
  REVEAL: 'reveal',
  STANDINGS: 'standings',
  PODIUM: 'podium',
  PRIZE: 'prize',
  PRIZE_REVEALED: 'prizeRevealed',
}

/**
 * How long each self-advancing step stays on screen. Long enough to read the
 * right answer and the tally on a projector, long enough for the standings to
 * finish moving and be read, long enough to take in the final results before the
 * winner is called out — short enough that a hall does not go quiet. These are
 * rules of the round, so they live here next to the question duration rather
 * than in a view. A state missing from this table is one auto mode never leaves
 * by itself.
 */
const AUTO_SECONDS = {
  [SESSION_STATES.REVEAL]: 6,
  [SESSION_STATES.STANDINGS]: 8,
  [SESSION_STATES.PODIUM]: 10,
}

/**
 * The table of valid transitions. This is the single place that decides "where
 * can we go from here" — no state `if`s scattered across controllers and views.
 */
const ALLOWED_NEXT = {
  idle: ['lobby'],
  lobby: ['idle', 'question'],
  question: ['reveal'],
  reveal: ['standings'],
  standings: ['question', 'podium'],
  podium: ['prize'],
  prize: ['prizeRevealed'],
  prizeRevealed: ['idle'],
}

/** Back to the starting line: used when opening a new session or cancelling one. */
const CLEARED_ROUND = {
  currentIndex: 0,
  questionStartedAt: null,
  questionEndsAt: null,
  autoStepEndsAt: null,
  winnerIds: [],
  prizeBoxes: [],
}

export class SessionModel {
  constructor({
    id = null,
    quiz = null,
    state = SESSION_STATES.IDLE,
    currentIndex = 0,
    questionStartedAt = null,
    questionEndsAt = null,
    autoStepEndsAt = null,
    players = [],
    answers = [],
    winnerIds = [],
    prizeBoxes = [],
    autoAdvance = true,
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
    /**
     * When the step now on screen stops being shown — the revealed answer, or
     * the standings after it. Set only while auto mode is on, and an end
     * timestamp for the same reason as `questionEndsAt`. One field for both
     * steps because only one of them is ever on screen.
     */
    this.autoStepEndsAt = autoStepEndsAt
    this.players = players
    this.answers = answers
    /**
     * Who gets a prize, in rank order; the admin confirms them at the
     * announcement step (usually simply the top of the leaderboard). How many
     * there are is `winnerCount`, a rule the quiz carries.
     */
    this.winnerIds = winnerIds
    /**
     * One set of three boxes per winner, in the same order as `winnerIds`, and
     * only present once the winners have been announced. A set each rather than
     * one shared set: everybody gets the same choice of three, and a winner is
     * never handed whatever the person before them left behind.
     */
    this.prizeBoxes = prizeBoxes
    /**
     * Auto mode: the round walks itself from question to reveal to the next
     * question, up to the final results. The host still opens the lobby, starts
     * the round and announces the winner — a tie at the top needs a human, and
     * so does handing over the prize.
     *
     * **On by default.** At a stand nobody is watching the laptop, and a round
     * stuck on a revealed answer because no one pressed anything is the worse
     * failure; a host who wants to talk between questions switches it off.
     */
    this.autoAdvance = autoAdvance
  }

  static empty() {
    return new SessionModel({})
  }

  static fromJSON(raw) {
    return new SessionModel({
      ...raw,
      quiz: raw.quiz ? Quiz.fromJSON(raw.quiz) : null,
      prizeBoxes: (raw.prizeBoxes ?? []).map((boxes) =>
        PrizeBoxes.fromJSON(boxes),
      ),
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
   * When the step being entered should hand over by itself, or `null` when it
   * has to wait for a human: auto mode is off, the step is not one that moves on
   * (a question ends on its own clock, the prize on a tap), or **the line
   * between winning and not falls between two people the round cannot tell
   * apart** — that last one is a decision, not a step, and no automatic rule can
   * be fair about it. The control desk shows the tied names for the host to
   * choose from.
   */
  #autoDeadlineFor(state, now) {
    if (!this.autoAdvance || AUTO_SECONDS[state] === undefined) return null

    if (state === SESSION_STATES.PODIUM) {
      const leaderboard = this.leaderboard
      // No clear set of winners, no automatic announcement — an empty round has
      // nobody to call out, and a tie across the line has too many.
      if (leaderboard.isEmpty) return null
      if (leaderboard.hasTieAt(this.winnerCount)) return null
    }

    return now + AUTO_SECONDS[state] * 1000
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

    // Once the answer is out the current question counts as finished, and it
    // stays finished while the standings that follow it are on screen.
    const isDone = [SESSION_STATES.REVEAL, SESSION_STATES.STANDINGS].includes(
      this.state,
    )
    const done = isDone ? this.questionNumber : this.currentIndex
    return (Math.min(done, this.total) / this.total) * 100
  }

  get isIdle() {
    return this.state === SESSION_STATES.IDLE
  }

  /** Nobody has played a question yet — the only window in which a player may start over. */
  get isLobby() {
    return this.state === SESSION_STATES.LOBBY
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

  /**
   * How much of the answer time is still on the clock, 100 → 0, for the bar that
   * drains next to the countdown. It is measured against *this* question's own
   * duration, which the admin may set per question — which is why it is computed
   * here and not from a fixed number in a view.
   */
  remainingPercent(now) {
    const duration = this.currentQuestion?.durationSeconds ?? 0
    if (duration <= 0) return 0
    return Math.min(100, (this.remainingMs(now) / (duration * 1000)) * 100)
  }

  isTimeUp(now) {
    return this.questionEndsAt !== null && now >= this.questionEndsAt
  }

  /** Seconds left on the answer or the standings before auto mode moves on. */
  autoRemainingSeconds(now) {
    if (this.autoStepEndsAt === null) return 0
    return Math.ceil(Math.max(0, this.autoStepEndsAt - now) / 1000)
  }

  /** The step on screen has been up long enough — the server may move on. */
  isAutoDue(now) {
    return this.autoStepEndsAt !== null && now >= this.autoStepEndsAt
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

  /**
   * Where everybody stood **before** the question currently on screen. Nothing
   * is stored: the same scoring runs a second time over the answers with the
   * current question's left out, which is what lets the reveal show "was 4th,
   * now 2nd" and tick a score up from its old value. Storing a snapshot of the
   * ranking on every question would be a second source of truth for something
   * the answers already say.
   *
   * Empty until a second question is scored: before that everyone is level, and
   * a "change" on every row means nothing.
   */
  get previousLeaderboard() {
    const question = this.currentQuestion
    if (!question) return new Leaderboard([])

    const earlier = this.answers.filter(
      (answer) => answer.questionId !== question.id,
    )
    if (earlier.length === 0) return new Leaderboard([])

    return Leaderboard.from(this.#with({ answers: earlier }))
  }

  /** The top ten, each row carrying where it came from — drawn between questions. */
  get standings() {
    return this.leaderboard.movementFrom(this.previousLeaderboard)
  }

  /**
   * How many people this round hands a prize to. The quiz asks for a number, but
   * a round can never have more winners than players — three prizes and two
   * people in the hall would leave the prize step waiting for somebody who does
   * not exist.
   */
  get winnerCount() {
    return Math.min(this.quiz?.winnerCount ?? 1, this.playerCount)
  }

  get winners() {
    return this.winnerIds
      .map((playerId) => this.findPlayer(playerId))
      .filter((player) => player !== null)
  }

  isWinner(playerId) {
    return this.winnerIds.includes(playerId)
  }

  /**
   * Whose turn it is to open a box, as a position in `winnerIds`, or `-1` once
   * everybody has. The winners pick **one at a time and in rank order**: the
   * room watches one box open, and the phone of the person after them stays a
   * waiting screen until it is their turn.
   */
  get pickingIndex() {
    return this.prizeBoxes.findIndex((boxes) => !boxes.isPicked)
  }

  get pickingPlayerId() {
    return this.winnerIds[this.pickingIndex] ?? null
  }

  boxesOf(playerId) {
    return this.prizeBoxes[this.winnerIds.indexOf(playerId)] ?? null
  }

  /** One row per winner, in rank order — what the prize step is drawn from. */
  get prizeRows() {
    return this.winnerIds.map((playerId, i) => {
      const player = this.findPlayer(playerId)
      return {
        playerId,
        name: player?.name ?? '',
        avatarId: player?.avatarId ?? null,
        boxes: this.prizeBoxes[i],
        isPicking: i === this.pickingIndex,
      }
    })
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

  /**
   * Open the lobby on a copy of the quiz, with every question's options
   * reshuffled. Here and not in the editor: the admin keeps reading the quiz in
   * the order they wrote it, and each round deals a fresh arrangement, so a
   * visitor who watched the previous round learns nothing but the answers.
   *
   * The arrangement is part of the session, which is why it is drawn once, on
   * the server, and travels in the snapshot — phones and the projector have to
   * label the same answer B, and a stored `optionIndex` has to mean the same
   * thing to everyone scoring it.
   */
  openLobby(quiz, id, random = Math.random) {
    return this.#to(SESSION_STATES.LOBBY, {
      id,
      quiz: quiz.withShuffledOptions(random),
      ...CLEARED_ROUND,
      players: [],
      answers: [],
    })
  }

  cancel() {
    return this.#to(SESSION_STATES.IDLE, { id: null, ...CLEARED_ROUND })
  }

  /** A playable quiz and enough people in the lobby — what Start waits for. */
  get canStart() {
    return Boolean(this.quiz?.isPlayable) && this.playerCount >= MIN_PLAYERS
  }

  start(now) {
    if (!this.canStart) return this
    return this.#to(SESSION_STATES.QUESTION, {
      currentIndex: 0,
      ...this.#timingOf(0, now),
    })
  }

  /** Close the question and reveal the answer. Clearing the deadline stops the clock everywhere. */
  reveal(now) {
    return this.#to(SESSION_STATES.REVEAL, {
      questionEndsAt: null,
      autoStepEndsAt: this.#autoDeadlineFor(SESSION_STATES.REVEAL, now),
    })
  }

  /**
   * Move on one step: the revealed answer hands over to the standings, the
   * standings to the next question — or to the podium when there are none left —
   * and the podium calls out the winner.
   *
   * The standings are a **step of the round**, not a corner of the reveal
   * screen. The answer and the ranking are two different things to look at, and
   * on a projector they were fighting for the same space; giving the board a
   * state of its own is also what keeps the phones and the big screen showing it
   * at the same moment, since the server owns the switch.
   *
   * "Move on" from the podium means announcing whoever tops the leaderboard, so
   * that auto mode and the host's button take the exact same route into the
   * prize step. A tie across the winning line is refused here: that one needs a
   * person.
   */
  next(now) {
    if (this.state === SESSION_STATES.REVEAL) {
      return this.#to(SESSION_STATES.STANDINGS, {
        autoStepEndsAt: this.#autoDeadlineFor(SESSION_STATES.STANDINGS, now),
      })
    }

    if (this.state === SESSION_STATES.PODIUM) {
      const count = this.winnerCount
      const leaderboard = this.leaderboard
      if (leaderboard.hasTieAt(count)) return this
      return this.announceWinners(
        leaderboard.winnerRows(count).map((row) => row.playerId),
      )
    }

    if (this.state !== SESSION_STATES.STANDINGS) return this
    if (this.isLastQuestion) {
      return this.#to(SESSION_STATES.PODIUM, {
        autoStepEndsAt: this.#autoDeadlineFor(SESSION_STATES.PODIUM, now),
      })
    }

    const index = this.currentIndex + 1
    return this.#to(SESSION_STATES.QUESTION, {
      currentIndex: index,
      autoStepEndsAt: null,
      ...this.#timingOf(index, now),
    })
  }

  /**
   * Switch auto mode on or off. Toggling it while a self-advancing step is on
   * screen has to arm or disarm that step's deadline as well, otherwise the host
   * turning auto on mid-round would see nothing happen until the *next* question
   * was revealed — and turning it off would not stop the move already scheduled.
   */
  setAutoAdvance(enabled, now) {
    if (enabled === this.autoAdvance) return this
    // Armed from the new setting, not the old one, which is why the deadline is
    // worked out on the switched instance.
    const switched = this.#with({ autoAdvance: enabled })
    return switched.#with({
      autoStepEndsAt: switched.#autoDeadlineFor(switched.state, now),
    })
  }

  /**
   * Announce the winners, in rank order. They have to be named explicitly — the
   * prize step needs to know whose phones the boxes belong to — and there have
   * to be exactly `winnerCount` of them, so a stray click cannot open the prize
   * step with fewer people than there are prizes to give.
   *
   * Every winner is given their own three boxes, each shuffled here, so every
   * round *and* every winner gets a different arrangement. They are a parameter
   * for the same reason `PrizeBoxes.shuffled` takes its random function from
   * outside: a caller can hand in a fixed set to reproduce a situation.
   */
  announceWinners(winnerIds, boxes = null) {
    if (!Array.isArray(winnerIds) || winnerIds.length === 0) return this
    if (winnerIds.length !== this.winnerCount) return this
    if (new Set(winnerIds).size !== winnerIds.length) return this
    if (winnerIds.some((playerId) => !this.findPlayer(playerId))) return this

    // The prize step waits for a tap, so the auto deadline stops here — leaving
    // the podium's behind would have the server trying to move on every tick.
    return this.#to(SESSION_STATES.PRIZE, {
      winnerIds,
      prizeBoxes: boxes ?? winnerIds.map(() => PrizeBoxes.shuffled()),
      autoStepEndsAt: null,
    })
  }

  /**
   * Pick a prize box. Only the winner whose turn it is may pick, and only once —
   * the turn moves on by itself because `pickingIndex` is simply the first
   * winner with an unopened set. The round leaves the prize step when the last
   * winner has opened theirs; until then it stays put, which is what keeps every
   * box that has already been opened on the big screen.
   */
  pickBox({ playerId, index }) {
    if (this.state !== SESSION_STATES.PRIZE) return this

    const turn = this.pickingIndex
    if (turn === -1 || this.winnerIds[turn] !== playerId) return this

    const picked = this.prizeBoxes[turn].withPicked(index)
    if (picked === this.prizeBoxes[turn]) return this

    const prizeBoxes = this.prizeBoxes.map((boxes, i) =>
      i === turn ? picked : boxes,
    )
    if (prizeBoxes.some((boxes) => !boxes.isPicked)) {
      return this.#with({ prizeBoxes })
    }
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

  /**
   * Give up a seat, freeing the name and the animal for somebody else.
   *
   * **Only from the lobby.** A visitor who mistyped their name or regrets their
   * animal should be able to start over, but the moment the first question is
   * out there are answers and a score attached to this player, and leaving would
   * either throw those away or leave orphaned answers behind. So the window
   * closes when the game starts, and everywhere else this returns `this`.
   */
  leave(playerId) {
    if (!this.isLobby) return this
    if (!this.findPlayer(playerId)) return this
    return this.#with({
      players: this.players.filter((player) => player.id !== playerId),
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
