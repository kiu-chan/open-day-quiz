/**
 * Controller dùng chung: đọc phiên chơi hiện tại và nghe mọi thay đổi của nó.
 * Cả ba surface đều bắt đầu từ hook này; controller riêng của từng surface bọc
 * thêm hành động và phần state mà surface đó cần.
 *
 * Public API: useSession() → { session, update }
 */
import { useCallback, useEffect, useState } from 'react'
import { sessionRepository } from '../models/SessionRepository.js'

export function useSession() {
  const [session, setSession] = useState(() => sessionRepository.read())

  useEffect(() => sessionRepository.subscribe(setSession), [])

  const update = useCallback(
    (mutate) => sessionRepository.update(mutate),
    [],
  )

  return { session, update }
}
