/**
 * Controller phụ: trả về "bây giờ" và tự nhích khi `active`.
 *
 * View không được tự gọi `Date.now()`, và model thì không được có timer — nên
 * mọi chỗ cần đếm ngược đều lấy `now` từ đây rồi hỏi model
 * `session.remainingSeconds(now)`.
 *
 * Public API: useNow(active) → mốc thời gian hiện tại (ms)
 */
import { useEffect, useState } from 'react'

/** 200ms: đồng hồ giây nhìn vẫn mượt mà không render quá dày. */
const TICK_MS = 200

export function useNow(active) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return

    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(id)
  }, [active])

  return now
}
