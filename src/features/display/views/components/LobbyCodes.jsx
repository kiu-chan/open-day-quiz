import JoinQr from '@common/views/JoinQr.jsx'
import WifiQr from '@common/views/WifiQr.jsx'

/**
 * The codes the hall scans from the big screen — drawn both while a lobby is
 * open and while the screen sits idle between rounds. `url` is whichever page
 * the moment calls for — the join form once a lobby is open, the home page while
 * the screen is idle — the caller decides, this only draws it.
 *
 * With no Wi-Fi configured this is the join code alone, the size it has always
 * been. With one, it becomes two numbered columns and the Wi-Fi goes first:
 * the join code leads to an address that only exists on the local network, so a
 * phone on mobile data scanning it lands on a browser error. Ordering the codes
 * is the whole point of the component — a hall reads left to right, and the
 * numbers say it again for the people who do not.
 *
 * Side by side the codes are smaller, but they are still sized off the viewport
 * height (see JoinQr): a 4:3 hall screen is much shorter than the laptop the
 * page was laid out on, and a fixed pixel size pushes the start button off the
 * bottom of it.
 */
function LobbyCodes({ url, ssid, password }) {
  const hasWifi = Boolean(ssid)

  const joinColumn = (
    <>
      <JoinQr
        value={url}
        size={hasWifi ? 'min(30vh, 36vw)' : 'min(42vh, 80vw)'}
        zoomable
      />
      <p className="font-mono text-lg break-all lg:text-xl">{url}</p>
    </>
  )

  if (!hasWifi) return joinColumn

  return (
    <div className="flex flex-wrap items-start justify-center gap-12 lg:gap-20">
      <div className="flex flex-col items-center gap-4">
        <p className="text-text-h text-3xl font-medium">01 · Join the Wi-Fi</p>
        <WifiQr
          ssid={ssid}
          password={password}
          size="min(30vh, 36vw)"
          className="text-lg lg:text-xl"
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-text-h text-3xl font-medium">02 · Scan to play</p>
        {joinColumn}
      </div>
    </div>
  )
}

export default LobbyCodes
