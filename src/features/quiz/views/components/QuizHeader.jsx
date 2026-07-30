function QuizHeader({ score, total }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
          Open Day
        </p>
        <h1 className="text-text-h text-3xl tracking-tight">Quiz nhanh</h1>
      </div>
      <span className="border-accent-border bg-accent-bg text-accent font-mono rounded-full border px-3 py-1 text-sm">
        {score}/{total}
      </span>
    </header>
  )
}

export default QuizHeader
