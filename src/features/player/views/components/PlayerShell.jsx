import PlayerAvatar from '@common/views/PlayerAvatar.jsx'

/** The phone screen frame: narrow, single column, avatar and player name at the top. */
function PlayerShell({ name, avatarId, children }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 py-6">
      <header className="border-border flex items-center justify-between gap-3 border-b pb-3">
        <span className="text-text-h flex items-center gap-2 text-sm font-medium">
          {name && <PlayerAvatar avatarId={avatarId} className="size-7" />}
          {name || 'Open Day Quiz'}
        </span>
        {name && <span className="font-mono text-xs opacity-60">Open Day Quiz</span>}
      </header>

      {children}
    </main>
  )
}

export default PlayerShell
