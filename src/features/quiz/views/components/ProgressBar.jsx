function ProgressBar({ value }) {
  return (
    <div className="bg-code-bg h-1.5 w-full overflow-hidden rounded-full">
      <div
        className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export default ProgressBar
