import PlayerAvatar from '@common/views/PlayerAvatar.jsx'

/**
 * The player's avatar as the centrepiece of a waiting screen.
 *
 * Between the lobby and the results a phone has nothing to do, and a visitor
 * holding a screen that says "waiting" and nothing else soon puts it in their
 * pocket — and then misses the start. So the wait is given to the animal: it is
 * large, it is theirs, and it is the one thing on the screen.
 *
 * The frame around it is greyscale, as everything but the avatar is: a static
 * ring, a dashed ring turning once every thirty seconds, and a halo breathing
 * once every six. All three are slow by design — they say "still connected"
 * while leaving the animal the only thing actually worth watching. The name is
 * not repeated here; the shell header already carries it.
 *
 * `compact` is for the second kind of wait: the one *inside* a question, after
 * the answer is locked in. There the question and the chosen option must stay
 * on screen, so the avatar sits below them at a third of the size. It appears
 * only once the answer is in — while there is still a choice to make, the only
 * avatar on screen is the 28px mark in the header, where it cannot pull the eye
 * off the options.
 */
const SIZES = {
  full: { box: 'size-56', halo: 'size-52', orbit: 'size-56', ring: 'size-44', avatar: 'size-40' },
  compact: { box: 'size-32', halo: 'size-30', orbit: 'size-32', ring: 'size-26', avatar: 'size-24' },
}

function WaitingAvatar({ avatarId, compact = false }) {
  const size = compact ? SIZES.compact : SIZES.full

  return (
    // Sized to the outermost ring, not to the avatar: the rings are positioned
    // absolutely, so without this the layout would reserve only the avatar's
    // height and the rings would overlap the text underneath.
    <div className={`relative flex items-center justify-center ${size.box}`}>
      <span
        className={`bg-accent-bg animate-breathe absolute rounded-full ${size.halo}`}
        aria-hidden="true"
      />
      <span
        className={`border-border animate-orbit absolute rounded-full border border-dashed ${size.orbit}`}
        aria-hidden="true"
      />
      <span
        className={`border-border absolute rounded-full border ${size.ring}`}
        aria-hidden="true"
      />

      <PlayerAvatar avatarId={avatarId} className={`border-2 ${size.avatar}`} />
    </div>
  )
}

export default WaitingAvatar
