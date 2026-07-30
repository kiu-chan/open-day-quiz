import { useEffect, useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

/**
 * Mã QR trỏ tới trang người chơi.
 *
 * Dùng SVG (không phải canvas) để nét khi phóng lên máy chiếu, và để màu mặc
 * định đen trên trắng — đúng luật layout, cũng là tương phản dễ quét nhất.
 * `level="M"` chịu được khoảng 15% vết che, đủ cho ảnh chiếu hơi bạc màu.
 *
 * `size` là cỡ mong muốn chứ không phải cỡ cứng: nhận số (px) hoặc một độ dài
 * CSS bất kỳ (`'min(42vh, 80vw)'`), và luôn co lại khi khung hẹp hơn. SVG bên
 * trong có `viewBox` nên kéo giãn theo khung mà không vỡ nét.
 *
 * `zoomable` cho phép bấm vào mã để phóng ra kín màn hình — khách đứng xa hoặc
 * điện thoại camera yếu vẫn quét được. Đây là trạng thái UI cục bộ của riêng
 * máy đang xem, không phải trạng thái phiên chơi, nên không gửi lên máy chủ.
 *
 * URL phải là địa chỉ LAN của máy chạy server, không phải `localhost` — điện
 * thoại không quét được `localhost`. Xem docs/usage.md.
 */
function JoinQr({ url, size = 200, className = '', zoomable = false }) {
  const [isZoomed, setIsZoomed] = useState(false)

  // Esc để thoát: nghe ở window vì lớp phủ không giữ focus sau khi người dùng
  // bấm ra vùng trống. Chỉ gắn khi đang phóng to.
  useEffect(() => {
    if (!isZoomed) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsZoomed(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isZoomed])

  const frame = (
    <div
      style={{ width: typeof size === 'number' ? `${size}px` : size }}
      className={`border-border max-w-full rounded-2xl border-2 bg-white p-4 ${className}`}
    >
      <QRCodeSVG
        value={url}
        size={512}
        level="M"
        marginSize={0}
        title="Mã QR để vào chơi"
        className="h-auto w-full"
      />
    </div>
  )

  if (!zoomable) return frame

  return (
    <>
      <button
        type="button"
        onClick={() => setIsZoomed(true)}
        aria-label="Phóng to mã QR"
        title="Phóng to mã QR"
        className="group relative max-w-full cursor-pointer rounded-2xl border-0 bg-transparent p-0 transition hover:opacity-85 active:scale-95"
      >
        {frame}
        <span className="bg-accent absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-lg text-white opacity-0 transition group-hover:opacity-100">
          <Maximize2 className="size-4" aria-hidden="true" />
        </span>
      </button>

      {isZoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mã QR phóng to"
          onClick={() => setIsZoomed(false)}
          className="bg-bg fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 p-6"
        >
          <QRCodeSVG
            value={url}
            size={1000}
            level="M"
            marginSize={0}
            title="Mã QR để vào chơi"
            className="h-auto w-[min(78vh,92vw)]"
          />

          <p className="text-text-h max-w-full text-center font-mono text-lg break-all">
            {url}
          </p>

          <p className="flex items-center gap-2 text-sm opacity-70">
            <X className="size-4 shrink-0" aria-hidden="true" />
            Bấm bất kỳ đâu hoặc nhấn Esc để đóng
          </p>
        </div>
      )}
    </>
  )
}

export default JoinQr
