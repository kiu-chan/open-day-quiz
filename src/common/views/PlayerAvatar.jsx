import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import { avatarById } from '@common/session/models/Avatars.js'

/**
 * A player's avatar, drawn in a circle: in full colour, and always moving.
 *
 * The avatars are the **one** deliberate exception to the black-and-white rule
 * of this project — see the interface rules in `docs/architecture.md`. They are
 * the only thing on screen a visitor owns, and a room full of little animals
 * doing their thing is the point of them; drained of colour and frozen on their
 * first frame they were just grey stickers. Nothing else in the app gets to
 * claim this exception, and no avatar may ever be the *only* thing telling two
 * states apart — selection is still marked by border weight and a tick.
 *
 * This is the one view in the project that runs an effect. Driving `lottie-web`
 * means mounting a player into a DOM node and tearing it down again, which no
 * amount of architecture can turn into a pure render — and it is presentation
 * machinery, not a game rule, so it belongs here rather than in a controller.
 * Nothing else in the app touches the animation player.
 */
function PlayerAvatar({ avatarId, className = 'size-10' }) {
  const avatar = avatarById(avatarId)
  const host = useRef(null)

  useEffect(() => {
    const player = lottie.loadAnimation({
      container: host.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      // A copy per player: lottie-web writes its own bookkeeping into the data
      // it is handed, and the same avatar is on screen several times at once
      // (the picker shows the whole catalogue) — sharing one object lets those
      // instances corrupt each other.
      animationData: structuredClone(avatar.animation),
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    })

    return () => player.destroy()
  }, [avatar])

  return (
    <span
      ref={host}
      role="img"
      aria-label={avatar.label}
      className={`border-border bg-bg inline-flex shrink-0 overflow-hidden rounded-full border ${className}`}
    />
  )
}

export default PlayerAvatar
