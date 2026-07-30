import {
  ArrowRight,
  MonitorPlay,
  QrCode,
  Settings2,
  Smartphone,
  Sparkles,
  UserPlus,
  Zap,
} from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { useHomeController } from '../controllers/useHomeController.js'
import LiveStatus from './components/LiveStatus.jsx'
import Marquee from './components/Marquee.jsx'
import PrizeTeaser from './components/PrizeTeaser.jsx'
import StepCard from './components/StepCard.jsx'
import SurfaceCard from './components/SurfaceCard.jsx'

const CTA_BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-3.5 text-lg font-medium no-underline transition hover:opacity-85 active:scale-95'

function HomePage() {
  const home = useHomeController()

  return (
    <main className="flex flex-1 flex-col">
      {/* Lưới chấm trôi rất chậm: nền có nhịp thở mà không giành sự chú ý với chữ. */}
      <section className="relative isolate overflow-hidden px-5 pt-14 pb-16 sm:pt-20">
        <div
          className="animate-drift absolute inset-0 -z-10 bg-[radial-gradient(circle,_var(--color-border)_1.5px,_transparent_1.5px)] bg-[length:28px_28px] opacity-70"
          aria-hidden="true"
        />

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <p className="animate-rise border-accent-border text-text-h inline-flex w-fit items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-medium tracking-wide uppercase">
            <Sparkles className="size-4 shrink-0" aria-hidden="true" />
            Open Day · Sân chơi của trường
          </p>

          <h1
            className="animate-rise text-text-h text-6xl leading-[0.85] font-black tracking-tighter sm:text-8xl lg:text-9xl"
            style={{ animationDelay: '80ms' }}
          >
            OPEN
            <br />
            DAY
            <br />
            {/* Khối đen lệch trục: điểm nhấn "lễ hội" làm bằng hình, không bằng màu. */}
            <span className="bg-accent mt-2 inline-block -rotate-2 px-4 pt-1 pb-2 text-white">
              QUIZ
            </span>
          </h1>

          <p
            className="animate-rise max-w-2xl text-xl sm:text-2xl"
            style={{ animationDelay: '160ms' }}
          >
            Quét mã QR, trả lời trên điện thoại, xem tên mình leo bảng xếp hạng
            trên màn hình lớn. Người đứng nhất được chọn{' '}
            <strong className="text-text-h font-semibold">
              một trong ba hộp quà bí mật
            </strong>
            .
          </p>

          <div
            className="animate-rise flex flex-wrap items-center gap-4"
            style={{ animationDelay: '240ms' }}
          >
            <a
              href={`#${ROUTES.PLAY}`}
              className={`${CTA_BASE} bg-accent border-accent-border text-white`}
            >
              <Smartphone className="size-5 shrink-0" aria-hidden="true" />
              Vào chơi ngay
            </a>
            <a
              href={`#${ROUTES.DISPLAY}`}
              className={`${CTA_BASE} border-border text-text-h hover:border-accent-border`}
            >
              <MonitorPlay className="size-5 shrink-0" aria-hidden="true" />
              Mở màn hình lớn
            </a>
          </div>

          <div className="animate-rise" style={{ animationDelay: '320ms' }}>
            <LiveStatus {...home} />
          </div>
        </div>
      </section>

      <Marquee />

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-16">
        <header className="flex flex-col gap-2">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Chơi thế nào?
          </h2>
          <p className="text-lg">Ba bước, không cần cài gì cả.</p>
        </header>

        <ul className="grid list-none gap-5 p-0 sm:grid-cols-3">
          <StepCard number="01" Icon={QrCode} title="Quét mã QR">
            Mã hiện ngay trên màn hình lớn của hội trường. Camera điện thoại là
            đủ, không cần tải ứng dụng.
          </StepCard>
          <StepCard
            number="02"
            Icon={UserPlus}
            title="Nhập tên"
            delay="120ms"
          >
            Gõ tên bạn muốn hiện trên bảng xếp hạng rồi chờ MC bấm bắt đầu.
          </StepCard>
          <StepCard number="03" Icon={Zap} title="Trả lời thật nhanh" delay="240ms">
            Mỗi câu có đồng hồ đếm ngược. Đúng thì được điểm, trả lời càng sớm
            điểm càng cao.
          </StepCard>
        </ul>
      </section>

      <section className="bg-code-bg border-border border-y">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-5 py-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Và phần thưởng…
          </h2>
          <p className="max-w-xl text-lg">
            Người đứng nhất lên chọn một trong ba hộp. Ba hộp được xáo lại mỗi
            trận, nên không ai đoán trước được hộp nào có gì.
          </p>

          <PrizeTeaser />
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-16">
        <header className="flex flex-col gap-2">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ba màn hình, một trận đấu
          </h2>
          <p className="text-lg">
            Mọi thiết bị trong cùng wifi đều thấy cùng một trạng thái.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-3">
          <SurfaceCard
            href={`#${ROUTES.PLAY}`}
            Icon={Smartphone}
            title="Người chơi"
            description="Trên điện thoại: nhập tên, chọn đáp án, xem điểm của mình."
            featured
          />
          <SurfaceCard
            href={`#${ROUTES.DISPLAY}`}
            Icon={MonitorPlay}
            title="Màn hình lớn"
            description="Chiếu lên máy chiếu: mã QR, câu hỏi, đồng hồ, bảng xếp hạng."
            delay="120ms"
          />
          <SurfaceCard
            href={`#${ROUTES.ADMIN}`}
            Icon={Settings2}
            title="Quản trị"
            description="Soạn bộ câu hỏi và điều khiển vòng chơi từ máy của MC."
            delay="240ms"
          />
        </div>
      </section>

      <footer className="border-border border-t px-5 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 text-sm">
          <span>Open Day Quiz — bản demo chạy trong mạng nội bộ.</span>
          <a
            href={`#${ROUTES.ADMIN_LIVE}`}
            className="text-text-h inline-flex items-center gap-1.5 no-underline"
          >
            Bàn điều khiển
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </main>
  )
}

export default HomePage
