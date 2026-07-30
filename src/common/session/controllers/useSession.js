/**
 * Controller dùng chung: đọc phiên chơi hiện tại, nghe mọi thay đổi từ máy chủ,
 * và gửi ý định lên. Cả ba surface đều bắt đầu từ hook này; controller riêng của
 * từng surface bọc thêm hành động và phần state mà surface đó cần.
 *
 * `send` nhận một intent (`{ type: 'start' }`, `{ type: 'answer', ... }`) chứ
 * không nhận hàm biến đổi model: chỉ máy chủ được áp luật, client chỉ nói nó
 * muốn gì.
 *
 * Public API: useSession() → { session, isOffline, send }
 */
import { useCallback, useEffect, useState } from 'react'
import { CONNECTION, sessionRepository } from '../models/SessionRepository.js'

export function useSession() {
  const [snapshot, setSnapshot] = useState(() => ({
    session: sessionRepository.read(),
    connection: sessionRepository.connection,
  }))

  useEffect(() => sessionRepository.subscribe(setSnapshot), [])

  const send = useCallback((intent) => sessionRepository.send(intent), [])

  return {
    session: snapshot.session,
    /**
     * Chỉ phân biệt "mất kết nối" hay không: lúc mới mở trang trạng thái
     * `connecting` chỉ kéo dài vài chục ms trong mạng LAN, hiện băng báo lỗi
     * trong khoảng đó thì chỉ nháy một cái gây hoang mang.
     */
    isOffline: snapshot.connection === CONNECTION.OFFLINE,
    send,
  }
}
