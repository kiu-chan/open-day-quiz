import { Blocks, Gift, Magnet, PackageOpen, Sticker } from 'lucide-react'
import PrizeCelebration from './PrizeCelebration.jsx'

/**
 * One mystery prize box, closed or being unwrapped.
 *
 * Shared by the phone (the winner taps a box) and the projector (the room
 * watches the same box open), so the two surfaces cannot drift apart — only the
 * sizes differ. A box is closed (waiting, gently wobbling), opened (this one was
 * picked) or dimmed (another box was picked), read straight off the `PrizeBoxes`
 * model. The opened box grows: it is the only thing left on screen, so it is
 * drawn at roughly twice its resting size.
 *
 * Never colour: the opened box is told apart by a thicker border, a different
 * icon and the prize written under it.
 */

/** The look of a prize, which is presentation — the model only knows its id. */
const PRIZE_ICONS = {
  'course-magnet': Magnet,
  'fablab-sticker': Sticker,
  'printed-figure': Blocks,
}

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

const VARIANTS = {
  phone: {
    card: 'gap-2 rounded-2xl border-2 px-2 py-4',
    stage: 'size-14',
    icon: 'size-9',
    label: 'text-xs',
    open: {
      card: 'mx-auto max-w-sm gap-3 rounded-3xl border-2 px-6 py-7',
      stage: 'size-24',
      icon: 'size-16',
      label: 'text-sm',
      ray: 'h-3 w-0.5',
      rayOffset: '2.4rem',
      prizeIcon: 'size-7',
      prizeName: 'text-lg',
      prizeNote: 'text-xs',
    },
  },
  display: {
    card: 'gap-4 rounded-3xl border-4 px-4 py-8',
    stage: 'size-28',
    icon: 'size-20',
    label: 'text-2xl',
    open: {
      card: 'mx-auto max-w-2xl gap-5 rounded-[2rem] border-4 px-10 py-12',
      stage: 'size-44',
      icon: 'size-32',
      label: 'text-3xl',
      ray: 'h-8 w-1.5',
      rayOffset: '4.75rem',
      prizeIcon: 'size-14',
      prizeName: 'text-5xl',
      prizeNote: 'text-2xl',
    },
  },
}

function PrizeBox({ boxes, index, variant = 'phone', onPick }) {
  const isClosed = !boxes.isPicked
  const isOpened = boxes.pickedIndex === index

  const v = VARIANTS[variant]
  const open = v.open

  const tone = isClosed
    ? 'border-border'
    : isOpened
      ? 'border-text-h bg-code-bg'
      : 'border-border opacity-0'

  const prize = boxes.prizeAt(index)
  const PrizeIcon = PRIZE_ICONS[prize.id] ?? Gift
  const Wrapper = onPick ? 'button' : 'div'
  const interactive =
    onPick && isClosed
      ? 'hover:border-accent-border hover:bg-accent-bg cursor-pointer'
      : ''

  return (
    <Wrapper
      {...(onPick && {
        type: 'button',
        disabled: !isClosed,
        onClick: () => onPick(index),
      })}
      className={`text-text-h relative flex w-full flex-col items-center bg-transparent transition-all duration-500 ${
        isOpened ? open.card : v.card
      } ${tone} ${interactive}`}
    >
      {isOpened && <PrizeCelebration variant={variant} />}

      {/* Both icons share one grid cell, so the closed box flies off from
          exactly where the open one appears. */}
      <span
        className={`relative grid place-items-center transition-all duration-500 ${
          isOpened ? `${open.stage} animate-box-shake` : v.stage
        }`}
      >
        {isOpened && (
          <span className="animate-burst absolute inset-0" aria-hidden="true">
            {RAY_ANGLES.map((angle) => (
              <span
                key={angle}
                className={`bg-text-h absolute top-1/2 left-1/2 rounded-full ${open.ray}`}
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${open.rayOffset})`,
                }}
              />
            ))}
          </span>
        )}

        <Gift
          className={`col-start-1 row-start-1 transition-all duration-500 ${
            isOpened ? open.icon : v.icon
          } ${
            isOpened ? 'animate-lid-off' : 'animate-wobble'
          }`}
          // Out of phase, so three wobbling boxes do not look mechanical.
          style={isOpened ? undefined : { animationDelay: `${index * 0.45}s` }}
          strokeWidth={1.5}
          aria-hidden="true"
        />
        {isOpened && (
          <PackageOpen
            className={`animate-box-open col-start-1 row-start-1 ${open.icon}`}
            strokeWidth={1.5}
            aria-label="Opened box"
          />
        )}
      </span>

      <span className={`font-mono ${isOpened ? open.label : v.label}`}>
        Box {index + 1}
      </span>

      {isOpened && (
        <span className="animate-prize-in flex flex-col items-center gap-2 text-center">
          <PrizeIcon className={open.prizeIcon} strokeWidth={1.5} aria-hidden="true" />
          <span className={`font-semibold ${open.prizeName}`}>{prize.name}</span>
          <span className={`opacity-70 ${open.prizeNote}`}>{prize.description}</span>
        </span>
      )}
    </Wrapper>
  )
}

export default PrizeBox
