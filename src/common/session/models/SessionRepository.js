/**
 * Lớp truy cập trạng thái phiên chơi — **ranh giới I/O duy nhất** của session.
 * Đây là lý do repository tồn tại, nên nó là file duy nhất trong `models/`
 * được phép chạm vào localStorage.
 *
 * Hiện lưu localStorage và phát tín hiệu cho mọi tab trong **cùng một máy**
 * (nhờ sự kiện `storage`): đủ để demo admin ở tab này, display ở tab kia.
 * Đồng bộ giữa nhiều **thiết bị** là việc của Phase 3 — khi chốt được transport
 * (Firebase / Socket.IO) thì chỉ file này đổi, SessionModel và view không đổi.
 *
 * Public API: read(), update(fn), subscribe(fn), reset().
 */
import { SessionModel } from './SessionModel.js'

const STORAGE_KEY = 'open-day-quiz:session'

const listeners = new Set()

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? SessionModel.fromJSON(JSON.parse(raw)) : SessionModel.empty()
  } catch {
    // Dữ liệu cũ hỏng hoặc đổi cấu trúc: thà mở phiên mới còn hơn treo app.
    return SessionModel.empty()
  }
}

let current = load()

function emit() {
  for (const listener of listeners) listener(current)
}

// Tab khác vừa ghi: nạp lại rồi thông báo cho view của tab này.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return
  current = load()
  emit()
})

export const sessionRepository = {
  read: () => current,

  /**
   * `mutate` nhận phiên hiện tại và trả về phiên mới. Nếu máy trạng thái chặn
   * hành động thì nó trả về đúng instance cũ — lúc đó không ghi, không thông báo.
   */
  update(mutate) {
    const next = mutate(current)
    if (next === current) return current

    current = next
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    emit()
    return current
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  reset() {
    return sessionRepository.update((session) => session.reset())
  },
}
