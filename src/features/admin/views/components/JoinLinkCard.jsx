import { QrCode } from 'lucide-react'
import JoinQr from '@common/views/JoinQr.jsx'

/** Link và mã QR để khách vào chơi. */
function JoinLinkCard({ url }) {
  return (
    <section className="border-border flex flex-wrap items-center gap-5 rounded-xl border border-dashed p-4">
      <JoinQr url={url} size={120} />

      <div className="flex min-w-56 flex-1 flex-col gap-2">
        <h2 className="text-text-h flex items-center gap-2 text-sm font-medium">
          <QrCode className="size-4" aria-hidden="true" />
          Link tham gia
        </h2>
        <p className="font-mono text-sm break-all">{url}</p>
        <p className="text-xs opacity-60">
          Mã QR lớn đang ở màn hình lớn. Nếu link là <span className="font-mono">localhost</span>{' '}
          thì điện thoại không vào được — chạy <span className="font-mono">npm run dev:lan</span>{' '}
          rồi mở lại bằng địa chỉ IP của máy.
        </p>
      </div>
    </section>
  )
}

export default JoinLinkCard
