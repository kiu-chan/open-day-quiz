/** Khung màn hình điện thoại: hẹp, một cột, tên người chơi ở trên. */
function PlayerShell({ name, children }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 py-6">
      <header className="border-border flex items-center justify-between gap-3 border-b pb-3">
        <span className="text-text-h text-sm font-medium">
          {name || 'Open Day Quiz'}
        </span>
        {name && <span className="font-mono text-xs opacity-60">Open Day Quiz</span>}
      </header>

      {children}
    </main>
  )
}

export default PlayerShell
