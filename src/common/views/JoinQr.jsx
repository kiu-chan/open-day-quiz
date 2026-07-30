import { QRCodeSVG } from 'qrcode.react'

/**
 * Mã QR trỏ tới trang người chơi.
 *
 * Dùng SVG (không phải canvas) để nét khi phóng lên máy chiếu, và để màu mặc
 * định đen trên trắng — đúng luật layout, cũng là tương phản dễ quét nhất.
 * `level="M"` chịu được khoảng 15% vết che, đủ cho ảnh chiếu hơi bạc màu.
 *
 * URL phải là địa chỉ LAN của máy chạy server, không phải `localhost` — điện
 * thoại không quét được `localhost`. Xem docs/usage.md.
 */
function JoinQr({ url, size = 200, className = '' }) {
  return (
    <div className={`border-border rounded-2xl border-2 bg-white p-4 ${className}`}>
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        marginSize={0}
        title="Mã QR để vào chơi"
      />
    </div>
  )
}

export default JoinQr
