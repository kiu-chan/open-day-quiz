import { Sparkle, Star } from 'lucide-react'

/**
 * The fireworks around a prize box that has just been opened: stars shooting
 * outwards and streamers raining down over the card.
 *
 * Every piece is placed by hand rather than randomly, so the burst looks the
 * same on the phone and on the projector — the room is watching both at once.
 * The direction of a star is a static rotation on its wrapper and the flight is
 * the animation on the child: a keyframe transform replaces an inline one
 * outright, so the two cannot live on the same element. Each piece sets its own
 * `--stagger`, which the animations in `index.css` add to the shared start time
 * of the reveal — without it the burst fires as one mechanical pulse.
 */

/** Angles in degrees, 0 = straight up. Uneven on purpose. */
const SPARKS = [
  { angle: -14, stagger: '0s', Icon: Star },
  { angle: 32, stagger: '0.12s', Icon: Sparkle },
  { angle: 74, stagger: '0.04s', Icon: Star },
  { angle: 119, stagger: '0.2s', Icon: Sparkle },
  { angle: 158, stagger: '0.09s', Icon: Star },
  { angle: 203, stagger: '0.17s', Icon: Sparkle },
  { angle: 246, stagger: '0.02s', Icon: Star },
  { angle: 287, stagger: '0.23s', Icon: Sparkle },
  { angle: 326, stagger: '0.11s', Icon: Star },
]

/** Streamers: where they fall from, when, and what they look like. */
const CONFETTI = [
  { left: '6%', stagger: '0.05s', tone: 'bg-text-h', shape: 'rounded-xs' },
  { left: '18%', stagger: '0.4s', tone: 'bg-text', shape: 'rounded-full' },
  { left: '27%', stagger: '0.18s', tone: 'border-text-h border', shape: 'rounded-xs' },
  { left: '38%', stagger: '0.62s', tone: 'bg-text-h', shape: 'rounded-full' },
  { left: '47%', stagger: '0.3s', tone: 'bg-border', shape: 'rounded-xs' },
  { left: '56%', stagger: '0.72s', tone: 'bg-text-h', shape: 'rounded-xs' },
  { left: '65%', stagger: '0.12s', tone: 'bg-text', shape: 'rounded-full' },
  { left: '74%', stagger: '0.5s', tone: 'border-text-h border', shape: 'rounded-xs' },
  { left: '84%', stagger: '0.25s', tone: 'bg-text-h', shape: 'rounded-xs' },
  { left: '93%', stagger: '0.66s', tone: 'bg-border', shape: 'rounded-full' },
]

const VARIANTS = {
  phone: {
    sparkDistance: '4.5rem',
    sparkIcon: 'size-4',
    confettiDrop: '9rem',
    confettiPiece: 'h-2 w-1',
  },
  display: {
    sparkDistance: '10rem',
    sparkIcon: 'size-9',
    confettiDrop: '20rem',
    confettiPiece: 'h-4 w-2',
  },
}

function PrizeCelebration({ variant }) {
  const v = VARIANTS[variant]

  return (
    <span
      className="pointer-events-none absolute inset-0 overflow-visible"
      aria-hidden="true"
    >
      {CONFETTI.map(({ left, stagger, tone, shape }) => (
        <span
          key={left}
          className={`animate-confetti-fall absolute top-0 ${v.confettiPiece} ${tone} ${shape}`}
          style={{ left, '--stagger': stagger, '--confetti-drop': v.confettiDrop }}
        />
      ))}

      {SPARKS.map(({ angle, stagger, Icon }) => (
        <span
          key={angle}
          className="absolute top-1/2 left-1/2"
          style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
        >
          <span
            className="animate-spark-out block"
            style={{ '--stagger': stagger, '--spark-distance': v.sparkDistance }}
          >
            {/* Turned back upright, so a star never hangs on its side. */}
            <Icon
              className={v.sparkIcon}
              style={{ transform: `rotate(${-angle}deg)` }}
              strokeWidth={1.5}
            />
          </span>
        </span>
      ))}
    </span>
  )
}

export default PrizeCelebration
