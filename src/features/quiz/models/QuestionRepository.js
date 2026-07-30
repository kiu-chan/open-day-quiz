import { Question } from './Question.js'
import { QUESTION_DATA } from './data/questions.js'

/**
 * Lớp truy cập dữ liệu: chỗ duy nhất biết câu hỏi đến từ đâu.
 * Muốn lấy từ API thì đổi findAll() thành async fetch tại đây và
 * thêm trạng thái loading ở controller.
 */
export const questionRepository = {
  findAll() {
    return QUESTION_DATA.map(Question.fromJSON)
  },
}
