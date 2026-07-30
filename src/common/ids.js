/**
 * Generates ids for quizzes, questions and players.
 * Unique enough for one event — no need for globally collision-proof ids.
 */
export function newId(prefix) {
  const time = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 6)
  return `${prefix}-${time}-${random}`
}
