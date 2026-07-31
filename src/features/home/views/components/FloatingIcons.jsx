import { Gift, QrCode, Sparkles, Trophy, Users, Zap } from 'lucide-react'

/* Position, size and timing per icon. The durations are deliberately all
   different and prime-ish, so the icons never drift back into step with each
   other and the background stays quiet. */
const ICONS = [
  { key: 'qr', Icon: QrCode, place: 'left-[4%] top-[14%]', size: 'size-16', duration: '13s', delay: '0s' },
  { key: 'trophy', Icon: Trophy, place: 'right-[7%] top-[9%]', size: 'size-20', duration: '17s', delay: '-4s' },
  { key: 'gift', Icon: Gift, place: 'right-[13%] bottom-[16%]', size: 'size-24', duration: '15s', delay: '-9s' },
  { key: 'zap', Icon: Zap, place: 'left-[11%] bottom-[10%]', size: 'size-14', duration: '11s', delay: '-2s' },
  { key: 'users', Icon: Users, place: 'right-[3%] top-[46%]', size: 'size-12', duration: '19s', delay: '-7s' },
  { key: 'sparkles', Icon: Sparkles, place: 'left-[22%] top-[52%]', size: 'size-10', duration: '14s', delay: '-11s' },
]

/**
 * The icons drifting behind the hero. Purely decorative: thin grey outlines at
 * low opacity, hidden on phones where they would sit under the headline, and
 * `aria-hidden` because they say nothing the text does not.
 */
function FloatingIcons() {
  return (
    <div className="absolute inset-0 -z-10 hidden lg:block" aria-hidden="true">
      {ICONS.map(({ key, Icon, place, size, duration, delay }) => (
        <Icon
          key={key}
          className={`animate-float text-text-h absolute opacity-[0.07] ${place} ${size}`}
          style={{ animationDuration: duration, animationDelay: delay }}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

export default FloatingIcons
