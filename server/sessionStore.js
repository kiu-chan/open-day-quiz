/**
 * Trạng thái phiên chơi sống ở đây — máy chủ là **nguồn sự thật duy nhất**.
 *
 * Client không còn tự đổi trạng thái: nó gửi *ý định* (intent) lên, máy chủ áp
 * vào SessionModel rồi phát ảnh chụp mới cho mọi thiết bị. Hai lý do:
 *  - Ba surface giờ nằm trên ba thiết bị khác nhau nhưng phải thấy **một** trạng
 *    thái. Nếu client nào cũng được ghi thẳng thì hai người bấm cùng lúc là hai
 *    máy tin vào hai kết quả khác nhau.
 *  - `msTaken` (trả lời nhanh cỡ nào) phải đo bằng một đồng hồ duy nhất. Đồng hồ
 *    điện thoại lệch với laptop vài giây là chấm điểm sai vài trăm điểm.
 *
 * File này import đúng SessionModel mà client dùng, nên luật chơi chỉ có một
 * bản — không có "luật phía server" song song để lệch nhau.
 *
 * Public API: sessionStore.read() / apply(intent) / subscribe(fn)
 */
import { Quiz } from '../src/common/session/models/Quiz.js'
import { SessionModel } from '../src/common/session/models/SessionModel.js'

/** Nhịp kiểm hết giờ. 250ms là đủ mượt cho người xem, chưa tốn gì cả. */
const TICK_MS = 250

let current = SessionModel.empty()
const listeners = new Set()

function commit(next) {
  // Hành động không hợp lệ thì model trả về đúng instance cũ: không phát gì.
  if (next === current) return current

  current = next
  for (const listener of listeners) listener(current)
  return current
}

/**
 * Bảng dịch intent (thứ client gửi lên) sang hành động của model. Đây là chỗ
 * duy nhất biết tên intent — thêm hành động mới thì thêm một dòng ở đây.
 *
 * `now` do máy chủ cấp, không nhận từ client: người chơi sửa đồng hồ máy mình
 * cũng không kiếm thêm được điểm nào.
 */
function reduce(session, intent, now) {
  switch (intent.type) {
    case 'openLobby':
      // Mở phiên mới đồng nghĩa huỷ phiên đang chạy: máy trạng thái chỉ cho vào
      // lobby từ idle nên phải reset trước.
      return session.reset().openLobby(Quiz.fromJSON(intent.quiz))
    case 'cancel':
      return session.cancel()
    case 'start':
      return session.start(now)
    case 'reveal':
      return session.reveal()
    case 'next':
      return session.next(now)
    case 'announceWinner':
      return session.announceWinner(intent.winnerId)
    case 'reset':
      return session.reset()
    case 'join':
      return session.join({ id: intent.id, name: intent.name, joinedAt: now })
    case 'answer':
      return session.submitAnswer({
        playerId: intent.playerId,
        optionIndex: intent.optionIndex,
        now,
      })
    case 'pickBox':
      return session.pickBox({ playerId: intent.playerId, index: intent.index })
    default:
      return session
  }
}

export const sessionStore = {
  read: () => current,

  /**
   * Áp một intent. Bọc try/catch vì đây là dữ liệu từ ngoài vào: một điện thoại
   * gửi payload thiếu trường không được phép làm chết máy chủ giữa trận.
   */
  apply(intent) {
    if (!intent || typeof intent.type !== 'string') return current
    try {
      return commit(reduce(current, intent, Date.now()))
    } catch (error) {
      console.error(`Bỏ qua intent "${intent.type}":`, error.message)
      return current
    }
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

/**
 * Hết giờ thì tự chốt câu. Việc này thuộc máy chủ vì chỉ được có một đồng hồ:
 * trước đây tab admin làm, nhưng nếu điện thoại và máy chiếu cũng tự chốt thì
 * mỗi máy chốt ở một thời điểm khác nhau — và nếu admin khoá màn hình thì trận
 * đấu treo luôn ở câu đang chạy.
 */
const ticker = setInterval(() => {
  const now = Date.now()
  if (current.isCounting && current.isTimeUp(now)) commit(current.reveal())
}, TICK_MS)

// Chỉ máy chủ HTTP giữ tiến trình sống, nhịp này không nên giữ.
ticker.unref()
