/**
 * The big-screen frame: fills the whole screen, large text, nothing to click.
 * `header` is the top bar (question number, clock); the rest is centred.
 */
function DisplayShell({ header, children }) {
  return (
    <main className="flex flex-1 flex-col gap-8 px-8 py-8 lg:px-16">
      {header && (
        <header className="border-border flex items-center justify-between gap-6 border-b-2 pb-4">
          {header}
        </header>
      )}

      <div className="flex flex-1 flex-col justify-center gap-8">{children}</div>
    </main>
  )
}

export default DisplayShell
