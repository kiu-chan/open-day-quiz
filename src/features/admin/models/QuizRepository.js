/**
 * The access layer for the quizzes the admin writes — the I/O boundary of the
 * admin feature, and therefore the only file in the admin's `models/` allowed to
 * talk to the network.
 *
 * It talks to `/api/quizzes` on the game server (see `server/quizStore.js`), so
 * a quiz belongs to the event rather than to one browser: whichever laptop opens
 * the admin page sees the same list, and clearing site data no longer throws the
 * questions away.
 *
 * Every method is async because every one of them is a round trip. Callers are
 * controllers, so the waiting shows up as a loading state, never as a frozen UI.
 *
 * Public API: findAll(), findById(), save(), remove(), duplicate(), createEmpty()
 */
import { newId } from '@common/ids.js'
import { Quiz } from '@common/session/models/Quiz.js'

const BASE_URL = '/api/quizzes'

/** Where older versions kept the quizzes. Read once, then handed to the server. */
const LEGACY_STORAGE_KEY = 'open-day-quiz:quizzes'

async function request(method, url, body) {
  const response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}))
    throw new Error(error ?? 'the server did not answer')
  }
  return await response.json()
}

/**
 * One-time move of the quizzes an older version left in this browser. The key is
 * cleared first on purpose: a payload the server rejects must not make every
 * later page load retry it forever. Drop this function once every admin machine
 * has opened the app at least once.
 */
async function migrateLegacyQuizzes() {
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!raw) return

  localStorage.removeItem(LEGACY_STORAGE_KEY)
  try {
    for (const quiz of JSON.parse(raw)) {
      await request('PUT', `${BASE_URL}/${encodeURIComponent(quiz.id)}`, quiz)
    }
  } catch {
    // Nothing useful to say to the admin here: the quizzes on the server are
    // still fine, only the leftovers of the old version could not be brought over.
  }
}

export const quizRepository = {
  async findAll() {
    await migrateLegacyQuizzes()
    const { quizzes } = await request('GET', BASE_URL)
    return quizzes.map(Quiz.fromJSON)
  },

  async findById(id) {
    const quizzes = await quizRepository.findAll()
    return quizzes.find((quiz) => quiz.id === id) ?? null
  },

  /** Insert, or overwrite by id. */
  async save(quiz) {
    await request('PUT', `${BASE_URL}/${encodeURIComponent(quiz.id)}`, quiz.toJSON())
    return quiz
  },

  async remove(id) {
    await request('DELETE', `${BASE_URL}/${encodeURIComponent(id)}`)
  },

  /** Local only — a new quiz reaches the server on the first save(). */
  createEmpty() {
    return new Quiz({ id: newId('quiz'), title: '' })
  },

  async duplicate(id) {
    const source = await quizRepository.findById(id)
    if (!source) return null

    // Questions in the copy need fresh ids: scores are keyed by questionId, so
    // two questions sharing an id in one session would pick up each other's
    // answers.
    const copy = Quiz.fromJSON({
      id: newId('quiz'),
      title: `${source.title} (copy)`,
      questions: source.questions.map((question) => ({
        ...question.toJSON(),
        id: newId('q'),
      })),
    })
    return await quizRepository.save(copy)
  },
}
