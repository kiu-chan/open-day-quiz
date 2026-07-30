import { Gift, QrCode, Trophy, Users, Zap } from 'lucide-react'

const ITEMS = [
  { key: 'qr', Icon: QrCode, label: 'Quét QR là chơi' },
  { key: 'fast', Icon: Zap, label: 'Nhanh hơn được nhiều điểm hơn' },
  { key: 'crowd', Icon: Users, label: 'Cả hội trường cùng trả lời' },
  { key: 'rank', Icon: Trophy, label: 'Bảng xếp hạng trực tiếp' },
  { key: 'prize', Icon: Gift, label: 'Ba hộp quà bí mật' },
]

function Strip({ hidden }) {
  return (
    <ul
      className="flex shrink-0 list-none items-center gap-10 px-5"
      aria-hidden={hidden ? 'true' : undefined}
    >
      {ITEMS.map(({ key, Icon, label }) => (
        <li key={key} className="flex items-center gap-3 whitespace-nowrap">
          <Icon className="size-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-lg font-medium tracking-wide uppercase">
            {label}
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Băng chữ chạy ngang, nền đen. Nội dung được lặp đúng hai lần và animation
 * dịch trọn một nửa chiều rộng, nên khi quay vòng khung nhìn thấy y hệt lúc
 * đầu — không có khoảng trống chớp qua. Bản lặp thứ hai là trang trí nên bị
 * `aria-hidden` để trình đọc màn hình không đọc hai lần.
 */
function Marquee() {
  return (
    <div className="bg-accent flex overflow-hidden py-4 text-white select-none">
      <div className="animate-marquee flex shrink-0">
        <Strip />
        <Strip hidden />
      </div>
    </div>
  )
}

export default Marquee
