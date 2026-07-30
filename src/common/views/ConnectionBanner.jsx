import { WifiOff } from 'lucide-react'

/**
 * Băng báo mất kết nối tới máy chủ trận đấu. Cần vì từ lúc trạng thái nằm ở máy
 * chủ, mất mạng nghĩa là màn hình đóng băng ở trạng thái cũ mà không có dấu hiệu
 * gì — bấm nút cũng không có chuyện gì xảy ra.
 *
 * Đen nền, chữ trắng: đảo màu là cách gây chú ý mạnh nhất trong bảng màu đen
 * trắng, và vẫn đọc được trên máy chiếu bạc màu.
 */
function ConnectionBanner({ isOffline }) {
  if (!isOffline) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-black px-4 py-2 text-center text-sm font-medium text-white"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden="true" />
      Mất kết nối tới máy chủ — kiểm tra wifi, trang sẽ tự vào lại.
    </div>
  )
}

export default ConnectionBanner
