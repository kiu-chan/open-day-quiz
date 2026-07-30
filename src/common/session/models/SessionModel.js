/**
 * Model: máy trạng thái của một phiên chơi — trái tim của cả ba màn hình.
 *
 * Admin / player / display không phải ba ứng dụng riêng: cả ba đọc **cùng một**
 * SessionModel, chỉ khác nhau ở cách vẽ trạng thái đó ra. Vì vậy model này nằm
 * ở `common/` chứ không thuộc feature nào.
 *
 * Bất biến: mọi hành động trả về instance mới; hành động không hợp lệ trả về
 * đúng `this`. Nhờ vậy admin bấm "câu tiếp" hai lần liên tiếp không nhảy mất
 * một câu, và repository biết là không có gì thay đổi nên không phát tín hiệu.
 *
 * Model không tự gọi `Date.now()` — thời điểm luôn do controller truyền vào,
 * để luật chơi vẫn là hàm thuần.
 *
 * Public API: SESSION_STATES, SessionModel.empty()/fromJSON(), các getter, và
 * các hành động openLobby / cancel / start / reveal / next / announceWinner /
 * reset / join / submitAnswer.
 */
import { Leaderboard, pointsOf } from './Leaderboard.js'
import { PrizeBoxes } from './PrizeBoxes.js'
import { Quiz } from './Quiz.js'

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
 * Bảng chuyển trạng thái hợp lệ. Đây là chỗ duy nhất quyết định "được đi đâu
 * từ đâu" — không rải `if` về trạng thái ra khắp controller và view.
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

/** Về vạch xuất phát: dùng khi mở phiên mới hoặc huỷ phiên. */
const CLEARED_ROUND = {
  currentIndex: 0,
  questionStartedAt: null,
  questionEndsAt: null,
  winnerId: null,
  prizeBoxes: null,
}

export class SessionModel {
  constructor({
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
    this.quiz = quiz
    this.state = state
    this.currentIndex = currentIndex
    /** Mốc bắt đầu câu hiện tại — dùng để tính người trả lời nhanh cỡ nào. */
    this.questionStartedAt = questionStartedAt
    /** Mốc kết thúc câu hiện tại, xem ghi chú "đếm ngược" ở dưới. */
    this.questionEndsAt = questionEndsAt
    this.players = players
    this.answers = answers
    /** Người nhận quà, admin chốt ở bước công bố (thường là hạng nhất). */
    this.winnerId = winnerId
    /** Ba hộp quà, chỉ có từ lúc công bố người thắng. */
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

  /** Đổi trạng thái nếu ALLOWED_NEXT cho phép, không thì đứng im. */
  #to(state, patch = {}) {
    if (!ALLOWED_NEXT[this.state].includes(state)) return this
    return this.#with({ state, ...patch })
  }

  /**
   * Mốc thời gian của một câu. Lưu **thời điểm kết thúc** thay vì "còn N giây"
   * để mọi máy tự trừ theo đồng hồ của mình: nếu mỗi máy đếm độc lập từ N giây
   * thì sau vài câu điện thoại và máy chiếu sẽ lệch nhau vài giây.
   */
  #timingOf(index, now) {
    const question = this.quiz.questionAt(index)
    return {
      questionStartedAt: now,
      questionEndsAt: now + question.durationSeconds * 1000,
    }
  }

  // ---- trạng thái suy ra ----

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

  /** Đã chơi xong phần câu hỏi, đang ở khúc vinh danh và trao quà. */
  get isAfterPlay() {
    return [
      SESSION_STATES.PODIUM,
      SESSION_STATES.PRIZE,
      SESSION_STATES.PRIZE_REVEALED,
    ].includes(this.state)
  }

  /** Đã đi qua bao nhiêu phần trận đấu, 0 → 100. */
  get progress() {
    if (this.total === 0) return 0
    if (this.isAfterPlay) return 100

    // Ở bước reveal thì câu hiện tại coi như đã xong.
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

  // ---- đếm ngược ----

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

  // ---- người chơi và đáp án ----

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

  /** Người này trả lời đúng câu hiện tại không? null = chưa trả lời. */
  isCorrectOf(playerId) {
    const answer = this.currentAnswerOf(playerId)
    if (!answer) return null
    return this.currentQuestion.isCorrect(answer.optionIndex)
  }

  /** Điểm người này vừa kiếm được ở câu hiện tại. */
  currentPointsOf(playerId) {
    return pointsOf(this.currentQuestion, this.currentAnswerOf(playerId))
  }

  /**
   * Bảng hạng tính lại từ đáp án mỗi lần gọi thay vì lưu điểm vào player: chỉ
   * vài chục người và vài câu, mà tránh được cảnh điểm lưu sẵn lệch với đáp án.
   */
  get leaderboard() {
    return Leaderboard.from(this)
  }

  get winner() {
    return this.winnerId ? this.findPlayer(this.winnerId) : null
  }

  /** Số người chọn từng đáp án ở câu hiện tại — display vẽ phân bố lúc reveal. */
  get currentDistribution() {
    const question = this.currentQuestion
    if (!question) return []
    return question.options.map(
      (_, i) =>
        this.currentAnswers.filter((answer) => answer.optionIndex === i).length,
    )
  }

  // ---- hành động của admin ----

  openLobby(quiz) {
    return this.#to(SESSION_STATES.LOBBY, {
      quiz,
      ...CLEARED_ROUND,
      players: [],
      answers: [],
    })
  }

  cancel() {
    return this.#to(SESSION_STATES.IDLE, { ...CLEARED_ROUND })
  }

  start(now) {
    if (!this.quiz?.isPlayable) return this
    return this.#to(SESSION_STATES.QUESTION, {
      currentIndex: 0,
      ...this.#timingOf(0, now),
    })
  }

  /** Chốt câu và lộ đáp án. Xoá mốc kết thúc để đồng hồ dừng ở mọi máy. */
  reveal() {
    return this.#to(SESSION_STATES.REVEAL, { questionEndsAt: null })
  }

  /** Còn câu thì sang câu mới, hết câu thì lên bục vinh danh. */
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
   * Công bố người thắng. Phải chỉ rõ ai — bước chọn quà cần biết của ai.
   * Ba hộp quà được xáo ngay lúc này, mỗi lượt chơi một cách xáo khác.
   */
  announceWinner(winnerId, boxes = PrizeBoxes.shuffled()) {
    if (!winnerId || !this.findPlayer(winnerId)) return this
    return this.#to(SESSION_STATES.PRIZE, { winnerId, prizeBoxes: boxes })
  }

  /** Chọn hộp quà. Chỉ người thắng được chọn, và chỉ được chọn một lần. */
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

  // ---- hành động của người chơi ----

  /**
   * Vào phiên. Vào muộn giữa trận vẫn cho — khách Open Day đến lẻ tẻ, người vào
   * muộn chỉ mất điểm những câu đã qua. Người cũ vào lại (refresh, tắt màn hình)
   * thì giữ nguyên tên và điểm, không tạo người mới.
   */
  join({ id, name, joinedAt }) {
    if (this.isIdle) return this
    if (this.findPlayer(id)) return this
    return this.#with({
      players: [...this.players, { id, name: name.trim(), joinedAt }],
    })
  }

  /** Nhận đáp án: chỉ khi đang ở câu hỏi, chưa hết giờ, và mỗi câu một lần. */
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
