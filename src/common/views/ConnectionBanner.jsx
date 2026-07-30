import { WifiOff } from 'lucide-react'

/**
 * Banner for losing the connection to the game server. Needed because now that
 * the state lives on the server, going offline means the screen freezes on the
 * old state with no sign of it — buttons simply do nothing.
 *
 * Black background, white text: inverting is the strongest attention grabber in
 * a black-and-white palette, and it still reads on a washed-out projector.
 */
function ConnectionBanner({ isOffline }) {
  if (!isOffline) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-black px-4 py-2 text-center text-sm font-medium text-white"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden="true" />
      Lost connection to the server — check the wifi, the page will rejoin itself.
    </div>
  )
}

export default ConnectionBanner
