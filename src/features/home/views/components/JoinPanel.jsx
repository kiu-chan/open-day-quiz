import { Maximize2, Smartphone } from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import JoinQr from '@common/views/JoinQr.jsx'

/**
 * The "scan to get started" band on the home page.
 *
 * **The code carries the home page, not the join form.** At the stand this page
 * is what stands on the projector between rounds, and somebody scanning it off
 * the wall has read none of it yet — dropping them straight into a form asking
 * for a name is asking them to join something they have not been told about. So
 * the scan hands them this page on their own phone, and the Play button on it is
 * the step they take next.
 *
 * The code is sized against the **viewport height** rather than a fixed pixel
 * count — big enough to be scanned from the back of a hall, and still inside a
 * phone screen. It is zoomable on top of that, which is the one press that turns
 * this page into a full-screen code.
 *
 * The URL is printed underneath in mono because it is the fallback for a camera
 * that will not focus; the link beside it is the fallback for the other case a
 * QR code cannot serve, a visitor already reading this page on the phone that
 * was meant to scan it.
 */
function JoinPanel({ url, title, text }) {
  return (
    <section className="bg-code-bg border-border border-y">
      <div className="reveal mx-auto flex w-full max-w-5xl flex-col items-center gap-7 px-5 py-16 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h2>
        <p className="max-w-xl text-lg">{text}</p>

        <JoinQr url={url} size="min(46vh, 82vw)" zoomable />

        <p className="text-text-h max-w-full font-mono text-base break-all sm:text-lg">
          {url}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          <span className="inline-flex items-center gap-2 opacity-70">
            <Maximize2 className="size-4 shrink-0" aria-hidden="true" />
            Tap the code to fill the screen
          </span>
          {/* The scan lands back on this page, so this is the only way out of
              the band and into the round — it goes to the player route itself. */}
          <a
            href={`#${ROUTES.PLAY}`}
            className="text-text-h inline-flex items-center gap-2 no-underline"
          >
            <Smartphone className="size-4 shrink-0" aria-hidden="true" />
            Already on your phone? Go straight to the game
          </a>
        </div>
      </div>
    </section>
  )
}

export default JoinPanel
