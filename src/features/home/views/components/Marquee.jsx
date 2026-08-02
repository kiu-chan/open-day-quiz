import { Gift, QrCode, Trophy, Users, Zap } from 'lucide-react'
import { splitLines } from '@common/home/models/HomeContent.js'

/* The labels are the admin's, the icons are not: they cycle in this order and
   start again if somebody writes more lines than there are icons. */
const ICONS = [QrCode, Zap, Users, Trophy, Gift]

function Strip({ labels, hidden }) {
  return (
    <ul
      className="flex shrink-0 list-none items-center gap-10 px-5"
      aria-hidden={hidden ? 'true' : undefined}
    >
      {labels.map((label, index) => {
        const Icon = ICONS[index % ICONS.length]
        return (
          <li
            key={label + index}
            className="flex items-center gap-3 whitespace-nowrap"
          >
            <Icon
              className="size-6 shrink-0"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="text-lg font-medium tracking-wide uppercase">
              {label}
            </span>
          </li>
        )
      })}
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
function Marquee({ items }) {
  const labels = splitLines(items)

  return (
    <div className="bg-accent group flex overflow-hidden py-4 text-white select-none">
      <div className="animate-marquee flex shrink-0 group-hover:[animation-play-state:paused]">
        <Strip labels={labels} />
        <Strip labels={labels} hidden />
      </div>
    </div>
  )
}

export default Marquee
