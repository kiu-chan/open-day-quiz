import { Maximize2, Smartphone } from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import JoinQr from '@common/views/JoinQr.jsx'
import WifiQr from '@common/views/WifiQr.jsx'

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
 * When a network is configured (A5), the band becomes **two numbered steps** and
 * the Wi-Fi comes first, because on the projector this page is read by phones
 * that are not on the network yet and cannot reach the join code at all. Two
 * codes side by side is also exactly how somebody scans the wrong one, so each
 * is numbered, titled, and given its own column rather than left to be told
 * apart by size.
 *
 * The wording of the two steps is not the admin's, unlike the rest of this page:
 * it explains a mechanism that does not change from event to event, and it is
 * only ever on screen when the Wi-Fi step exists at all.
 *
 * The codes shrink when there are two of them: one code owns the height of the
 * viewport, two share the width of the band.
 *
 * The URL is printed underneath in mono because it is the fallback for a camera
 * that will not focus; the link beside it is the fallback for the other case a
 * QR code cannot serve, a visitor already reading this page on the phone that
 * was meant to scan it.
 */
function Step({ number, title, text, children }) {
  return (
    <div className="border-border flex flex-1 flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-5 py-8">
      <p className="text-text-h font-mono text-sm tracking-widest">{number}</p>
      <h3 className="text-text-h text-2xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="max-w-sm text-base">{text}</p>
      {children}
    </div>
  )
}

const WIFI_STEP_TEXT =
  'The game only exists on the network in this room, so your phone has to be on the same Wi-Fi as the screen. Scan this code and it connects itself — nothing to type.'

function JoinPanel({ url, title, text, ssid, password }) {
  const hasWifi = Boolean(ssid)
  const codeSize = hasWifi ? 'min(34vh, 66vw)' : 'min(46vh, 82vw)'

  const joinCode = (
    <>
      <JoinQr value={url} size={codeSize} zoomable />

      <p className="text-text-h max-w-full font-mono text-base break-all sm:text-lg">
        {url}
      </p>
    </>
  )

  return (
    <section className="bg-code-bg border-border border-y">
      <div className="reveal mx-auto flex w-full max-w-5xl flex-col items-center gap-7 px-5 py-16 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h2>
        {hasWifi ? (
          /* The admin's join text moves into step two rather than being
             repeated above it — every string on the page is written once. */
          <div className="flex w-full flex-col items-stretch gap-6 lg:flex-row">
            <Step number="01" title="First, join the Wi-Fi" text={WIFI_STEP_TEXT}>
              <WifiQr
                ssid={ssid}
                password={password}
                size={codeSize}
                className="text-base"
              />
            </Step>
            <Step number="02" title="Then open the game" text={text}>
              {joinCode}
            </Step>
          </div>
        ) : (
          <>
            <p className="max-w-xl text-lg">{text}</p>
            {joinCode}
          </>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          <span className="inline-flex items-center gap-2 opacity-70">
            <Maximize2 className="size-4 shrink-0" aria-hidden="true" />
            Tap a code to fill the screen
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
