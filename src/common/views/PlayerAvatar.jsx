import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import { avatarById } from '@common/session/models/Avatars.js'

/**
 * A player's avatar, drawn in a circle.
 *
 * This is the one view in the project that runs an effect. Driving `lottie-web`
 * means mounting a player into a DOM node and tearing it down again, which no
 * amount of architecture can turn into a pure render — and it is presentation
 * machinery, not a game rule, so it belongs here rather than in a controller.
 * Nothing else in the app touches the animation player.
 *
 * `grayscale` is not decoration. The animations come from lottiefiles.com in
 * full colour, and this project's interface rule is black, white and grey only —
 * partly for the look, mostly because the projector washes colour out. The
 * filter is what lets a colourful third-party asset live inside that rule.
 * `contrast` puts back the separation that turning the colours off takes away.
 *
 * `animate` defaults to **off**. A leaderboard with twenty rows would otherwise
 * run twenty Lottie players at once and turn the projector into a slideshow.
 * Standing still, the avatar is just the first frame. Turn it on where there are
 * only a few on screen and the movement is the point: the picker, the lobby, the
 * winner.
 */
function PlayerAvatar({ avatarId, className = 'size-10', animate = false }) {
  const avatar = avatarById(avatarId)
  const host = useRef(null)

  useEffect(() => {
    const player = lottie.loadAnimation({
      container: host.current,
      renderer: 'svg',
      loop: animate,
      autoplay: animate,
      // A copy per player: lottie-web writes its own bookkeeping into the data
      // it is handed, and the same avatar is on screen several times at once
      // (the picker shows all twelve) — sharing one object lets those instances
      // corrupt each other.
      animationData: structuredClone(avatar.animation),
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    })

    return () => player.destroy()
  }, [avatar, animate])

  return (
    <span
      ref={host}
      role="img"
      aria-label={avatar.label}
      className={`border-border bg-bg inline-flex shrink-0 overflow-hidden rounded-full border ${className}`}
      style={{ filter: 'grayscale(1) contrast(1.15)' }}
    />
  )
}

export default PlayerAvatar
