import { Gift, QrCode, Trophy, Users, Zap } from 'lucide-react'

const ITEMS = [
  { key: 'qr', Icon: QrCode, label: 'Scan to play' },
  { key: 'fast', Icon: Zap, label: 'Faster answers score more' },
  { key: 'crowd', Icon: Users, label: 'The whole hall answers together' },
  { key: 'rank', Icon: Trophy, label: 'Live leaderboard' },
  { key: 'prize', Icon: Gift, label: 'Three mystery prize boxes' },
]

function Strip({ hidden }) {
  return (
    <ul
      className="flex shrink-0 list-none items-center gap-10 px-5"
      aria-hidden={hidden ? 'true' : undefined}
    >
      {ITEMS.map(({ key, Icon, label }) => (
        <li key={key} className="flex items-center gap-3 whitespace-nowrap">
          <Icon className="size-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-lg font-medium tracking-wide uppercase">
            {label}
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * The scrolling text band on a black background. The content is repeated exactly
 * twice and the animation shifts by exactly half the width, so when the loop
 * restarts the viewport looks identical to where it began — no gap flashing past.
 * The second copy is decorative, so it is `aria-hidden` to stop screen readers
 * reading it twice. Hovering the band stops it, so anybody who wants to read an
 * item that is sliding away can.
 */
function Marquee() {
  return (
    <div className="bg-accent group flex overflow-hidden py-4 text-white select-none">
      <div className="animate-marquee flex shrink-0 group-hover:[animation-play-state:paused]">
        <Strip />
        <Strip hidden />
      </div>
    </div>
  )
}

export default Marquee
