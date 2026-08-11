import { QrCode } from 'lucide-react'
import JoinQr from '@common/views/JoinQr.jsx'
import Panel from './Panel.jsx'

/** The link and QR code visitors use to join. */
function JoinLinkCard({ url }) {
  return (
    <Panel title="Join link" Icon={QrCode} dashed>
      <div className="flex flex-wrap items-center gap-5">
        <JoinQr value={url} size={140} zoomable />

        <div className="flex min-w-56 flex-1 flex-col gap-2">
          <p className="bg-code-bg text-text-h rounded-lg px-3 py-2 font-mono text-sm break-all">
            {url}
          </p>
          <p className="text-xs opacity-60">
            The large QR code is on the big screen. If the link says{' '}
            <span className="font-mono">localhost</span>, phones cannot reach it —
            run <span className="font-mono">npm run dev:lan</span> and reopen the
            page using the machine's IP address.
          </p>
        </div>
      </div>
    </Panel>
  )
}

export default JoinLinkCard
