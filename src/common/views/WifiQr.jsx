import { Wifi } from 'lucide-react'
import { wifiQrValue } from '@common/wifi/models/WifiSettings.js'
import JoinQr from './JoinQr.jsx'

/**
 * The code that puts a phone on the same network as the server.
 *
 * It is the step before every other QR code in the app: the game only exists on
 * the LAN, so a visitor on mobile data cannot even load the page the join code
 * points at. Scanned from the camera, this one joins the network outright —
 * iOS and Android both do it — which is why it is worth a code rather than a
 * network name written on a poster and mistyped by half the hall.
 *
 * The name and password are printed underneath all the same: that is the way in
 * for the phones whose camera will not do it, and the reason the credentials are
 * never treated as a secret here. Anyone standing in the room is meant to have
 * them.
 *
 * The text deliberately carries no size class so it takes the size of whatever
 * it is dropped into — a projector column and a phone card want very different
 * ones.
 *
 * Renders nothing when no network is configured; the caller does not have to
 * check first.
 */
function WifiQr({ ssid, password, size = 200, className = '' }) {
  const value = wifiQrValue({ ssid, password })
  if (!value) return null

  const caption = password ? `${ssid} · ${password}` : ssid

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <JoinQr
        value={value}
        size={size}
        zoomable
        label="QR code to join the Wi-Fi"
        caption={caption}
      />

      <p className="text-text-h flex flex-wrap items-center justify-center gap-2 font-mono break-all">
        <Wifi className="size-[1em] shrink-0" aria-hidden="true" />
        {ssid}
      </p>

      <p className="font-mono break-all opacity-70">
        {password ? password : 'Open network — no password'}
      </p>
    </div>
  )
}

export default WifiQr
