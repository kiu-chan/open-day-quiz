import { QrCode } from 'lucide-react'
import JoinQr from '@common/views/JoinQr.jsx'
import Panel from './Panel.jsx'

/** Link và mã QR để khách vào chơi. */
function JoinLinkCard({ url }) {
  return (
    <Panel title="Link tham gia" Icon={QrCode} dashed>
      <div className="flex flex-wrap items-center gap-5">
        <JoinQr url={url} size={140} zoomable />

        <div className="flex min-w-56 flex-1 flex-col gap-2">
          <p className="bg-code-bg text-text-h rounded-lg px-3 py-2 font-mono text-sm break-all">
            {url}
          </p>
          <p className="text-xs opacity-60">
            Mã QR lớn đang ở màn hình lớn. Nếu link là{' '}
            <span className="font-mono">localhost</span> thì điện thoại không vào
            được — chạy <span className="font-mono">npm run dev:lan</span> rồi mở
            lại bằng địa chỉ IP của máy.
          </p>
        </div>
      </div>
    </Panel>
  )
}

export default JoinLinkCard
