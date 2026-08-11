import { useEffect, useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

/**
 * The QR code a visitor scans. It carries the player page on most screens, and
 * the Wi-Fi credentials in `WifiQr` — hence `value` rather than `url`, and the
 * `caption` printed under the enlarged code, which for a Wi-Fi payload is the
 * network name rather than the raw `WIFI:…` string nobody can read.
 *
 * Rendered as SVG (not canvas) so it stays crisp blown up on a projector, and
 * left at the default black on white — which follows the layout rules and also
 * happens to be the easiest contrast to scan.
 * `level="M"` tolerates roughly 15% occlusion, enough for a slightly washed-out
 * projected image.
 *
 * `size` is a wish, not a hard size: it takes a number (px) or any CSS length
 * (`'min(42vh, 80vw)'`), and always shrinks when the container is narrower. The
 * inner SVG has a `viewBox`, so it stretches to the frame without going fuzzy.
 *
 * `zoomable` lets you tap the code to blow it up full screen — visitors standing
 * far away or holding a phone with a weak camera can still scan it. This is
 * local UI state of the viewing device only, not session state, so it is never
 * sent to the server.
 *
 * A join URL must be the LAN address of the machine running the server, not
 * `localhost` — phones cannot scan their way to `localhost`. See docs/usage.md.
 */
function JoinQr({
  value,
  size = 200,
  className = '',
  zoomable = false,
  label = 'QR code to join the game',
  caption = value,
}) {
  const [isZoomed, setIsZoomed] = useState(false)

  // Esc to exit: listened for on window because the overlay does not keep focus
  // after the user clicks an empty area. Only attached while zoomed.
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
        value={value}
        size={512}
        level="M"
        marginSize={0}
        title={label}
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
        aria-label={`Enlarge the QR code — ${label}`}
        title="Enlarge the QR code"
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
          aria-label={`Enlarged QR code — ${label}`}
          onClick={() => setIsZoomed(false)}
          className="bg-bg fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 p-6"
        >
          <QRCodeSVG
            value={value}
            size={1000}
            level="M"
            marginSize={0}
            title={label}
            className="h-auto w-[min(78vh,92vw)]"
          />

          <p className="text-text-h max-w-full text-center font-mono text-lg break-all">
            {caption}
          </p>

          <p className="flex items-center gap-2 text-sm opacity-70">
            <X className="size-4 shrink-0" aria-hidden="true" />
            Click anywhere or press Esc to close
          </p>
        </div>
      )}
    </>
  )
}

export default JoinQr
