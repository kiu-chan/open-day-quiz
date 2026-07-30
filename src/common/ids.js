/**
 * Sinh id cho quiz, câu hỏi và người chơi.
 * Đủ độc nhất cho một sự kiện — không cần chống trùng ở mức toàn cầu.
 */
export function newId(prefix) {
  const time = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 6)
  return `${prefix}-${time}-${random}`
}
