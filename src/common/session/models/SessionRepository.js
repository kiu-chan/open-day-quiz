/**
 * Lớp truy cập trạng thái phiên chơi — **ranh giới I/O duy nhất** của session.
 * Đây là lý do repository tồn tại, nên nó là file duy nhất trong `models/` được
 * phép chạm vào mạng.
 *
 * Client **không** tự đổi trạng thái: nó gửi ý định lên máy chủ
 * (`POST /api/intent`) và nhận lại ảnh chụp phiên qua SSE (`GET /api/events`).
 * Máy chủ là nguồn sự thật — xem `server/sessionStore.js` để biết vì sao.
 *
 * `read()` vẫn đồng bộ và vẫn trả về SessionModel: nó đọc ảnh chụp gần nhất đã
 * nhận được. Nhờ vậy toàn bộ view và SessionModel không phải sửa gì khi app
 * chuyển từ localStorage sang máy chủ.
 *
 * Public API: read(), send(intent), subscribe(fn), connection, serverNow(), CONNECTION.
 */
import { SessionModel } from './SessionModel.js'

const EVENTS_URL = '/api/events'
const INTENT_URL = '/api/intent'

export const CONNECTION = {
  CONNECTING: 'connecting',
  ONLINE: 'online',
  OFFLINE: 'offline',
}

let current = SessionModel.empty()
let connection = CONNECTION.CONNECTING
let stream = null
let clockOffset = 0

const listeners = new Set()

function emit() {
  for (const listener of listeners) listener({ session: current, connection })
}

/**
 * "Bây giờ" theo đồng hồ **máy chủ**, không phải đồng hồ máy này.
 *
 * `questionEndsAt` là mốc do máy chủ đặt, nên máy nào đặt lệch giờ mà tự trừ theo
 * đồng hồ của nó sẽ thấy đếm ngược sai hẳn — thường là 0 suốt cả câu. Mỗi frame
 * SSE mang theo đồng hồ máy chủ nên độ lệch được chỉnh lại liên tục. Trong LAN,
 * độ trễ đường truyền chỉ vài ms nên bỏ qua được.
 */
export function serverNow() {
  return Date.now() + clockOffset
}

function connect() {
  stream = new EventSource(EVENTS_URL)

  stream.addEventListener('message', (event) => {
    const frame = JSON.parse(event.data)
    clockOffset = frame.serverNow - Date.now()
    current = SessionModel.fromJSON(frame.session)
    connection = CONNECTION.ONLINE
    emit()
  })

  // EventSource tự thử kết nối lại sau vài giây, nên ở đây chỉ cần đổi cờ để
  // view nói cho người dùng biết. Không tự viết vòng thử lại — đó là lý do
  // chọn SSE thay vì WebSocket trần.
  stream.addEventListener('error', () => {
    if (connection === CONNECTION.OFFLINE) return
    connection = CONNECTION.OFFLINE
    emit()
  })
}

export const sessionRepository = {
  read: () => current,

  get connection() {
    return connection
  },

  /**
   * Gửi một ý định. Không chờ trạng thái mới ở phần hồi đáp: nó về qua SSE cùng
   * lúc với mọi máy khác.
   *
   * Gửi thất bại thì chỉ bật cờ mất kết nối chứ không xếp hàng gửi lại — trận
   * đấu là thời gian thực, một đáp án gửi lại sau 30 giây thì đã hết câu rồi.
   * Người chơi thấy báo mất kết nối và bấm lại là đúng hành vi mong đợi.
   */
  async send(intent) {
    try {
      const response = await fetch(INTENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intent),
      })
      if (!response.ok) throw new Error(`máy chủ trả ${response.status}`)
    } catch {
      if (connection === CONNECTION.OFFLINE) return
      connection = CONNECTION.OFFLINE
      emit()
    }
  },

  /** Người nghe đầu tiên mới mở kết nối: SSR và test render không cần mạng. */
  subscribe(listener) {
    listeners.add(listener)
    if (!stream) connect()
    return () => listeners.delete(listener)
  },
}
