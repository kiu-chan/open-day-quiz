import WaitingAvatar from './WaitingAvatar.jsx'

/**
 * A waiting screen: one headline, one supporting line, and above them either the
 * player's avatar or a plain icon.
 *
 * The avatar is used wherever the person waiting has already joined — waiting is
 * exactly when there is room for it. The icon is for the screens where there is
 * no avatar to show yet (no session open) or where the message is about somebody
 * else (watching the winner pick a box).
 */
function StatusScreen({ icon: Icon, avatarId, title, note }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      {/* Each branch is guarded on its own. Rendering `<Icon />` whenever there
          is no avatar looked equivalent, but it blanked the whole page for
          anyone whose avatar id came back empty on a screen that passes no
          icon — a missing prop must never cost the player their screen. */}
      {avatarId && <WaitingAvatar avatarId={avatarId} />}
      {!avatarId && Icon && (
        <Icon className="text-text-h size-12" strokeWidth={1.5} aria-hidden="true" />
      )}
      <h2 className="text-text-h text-2xl">{title}</h2>
      {note && <p className="text-sm opacity-70">{note}</p>}
    </section>
  )
}

export default StatusScreen
