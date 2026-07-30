/**
 * Lớp truy cập bộ quiz do admin soạn — ranh giới I/O của feature admin, nên
 * cũng là file duy nhất trong `models/` của admin được chạm vào localStorage.
 *
 * Lần đầu mở app thì nạp sẵn QUIZ_DATA. Đổi sang API thật thì chỉ sửa file này
 * (và đổi các hàm thành `async`), Quiz và view không đổi.
 *
 * Public API: findAll(), findById(), save(), remove(), duplicate(), createEmpty()
 */
import { newId } from '@common/ids.js'
import { Quiz } from '@common/session/models/Quiz.js'
import { QUIZ_DATA } from './data/quizzes.js'

const STORAGE_KEY = 'open-day-quiz:quizzes'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : QUIZ_DATA
    return list.map(Quiz.fromJSON)
  } catch {
    // Dữ liệu cũ sai cấu trúc: quay về bộ mẫu thay vì làm treo trang admin.
    return QUIZ_DATA.map(Quiz.fromJSON)
  }
}

function persist(quizzes) {
  const raw = JSON.stringify(quizzes.map((quiz) => quiz.toJSON()))
  localStorage.setItem(STORAGE_KEY, raw)
}

export const quizRepository = {
  findAll: () => load(),

  findById(id) {
    return load().find((quiz) => quiz.id === id) ?? null
  },

  /** Thêm mới hoặc ghi đè theo id. */
  save(quiz) {
    const quizzes = load()
    const index = quizzes.findIndex((item) => item.id === quiz.id)
    if (index === -1) quizzes.push(quiz)
    else quizzes[index] = quiz

    persist(quizzes)
    return quiz
  },

  remove(id) {
    persist(load().filter((quiz) => quiz.id !== id))
  },

  createEmpty() {
    return new Quiz({ id: newId('quiz'), title: '' })
  },

  duplicate(id) {
    const source = quizRepository.findById(id)
    if (!source) return null

    // Câu hỏi trong bản sao phải có id mới: điểm được lưu theo questionId nên
    // hai câu trùng id trong cùng một phiên sẽ nhận nhầm đáp án của nhau.
    const copy = Quiz.fromJSON({
      id: newId('quiz'),
      title: `${source.title} (bản sao)`,
      questions: source.questions.map((question) => ({
        ...question.toJSON(),
        id: newId('cau'),
      })),
    })
    return quizRepository.save(copy)
  },
}
