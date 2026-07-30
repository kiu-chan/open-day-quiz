/**
 * Controller phụ: trả về "bây giờ" và tự nhích khi `active`.
 *
 * View không được tự gọi `Date.now()`, và model thì không được có timer — nên
 * mọi chỗ cần đếm ngược đều lấy `now` từ đây rồi hỏi model
 * `session.remainingSeconds(now)`.
 *
 * Lấy `serverNow()` chứ không phải `Date.now()`: mốc hết giờ do máy chủ đặt, nên
 * điện thoại đặt lệch giờ phải bù lại mới đếm đúng.
 *
 * Public API: useNow(active) → mốc thời gian hiện tại (ms)
 */
import { useEffect, useState } from 'react'
import { serverNow } from '../models/SessionRepository.js'

/** 200ms: đồng hồ giây nhìn vẫn mượt mà không render quá dày. */
const TICK_MS = 200

export function useNow(active) {
  const [now, setNow] = useState(() => serverNow())

  useEffect(() => {
    if (!active) return

    setNow(serverNow())
    const id = setInterval(() => setNow(serverNow()), TICK_MS)
    return () => clearInterval(id)
  }, [active])

  return now
}
