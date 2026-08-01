/**
 * The countdown as a bar that drains while the answer time runs out, so a
 * player glancing at their phone sees how long is left without reading a
 * number. The track is outlined and the fill shrinks, which is what tells it
 * apart from the filled progress bar of the round underneath it.
 * The transition is linear and as short as the clock tick, otherwise the bar
 * eases behind the seconds it is showing.
 */
function CountdownBar({ percent, seconds, className = '' }) {
  return (
    <div
      role="progressbar"
      aria-label="Time left"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-valuetext={`${seconds} seconds left`}
      className={`border-border h-2 w-full overflow-hidden rounded-full border p-px ${className}`}
    >
      <div
        className="bg-accent h-full rounded-full transition-[width] duration-200 ease-linear"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export default CountdownBar
