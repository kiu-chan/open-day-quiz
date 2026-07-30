/**
 * One number on the control desk (players, answers in, seconds left). The host
 * has to read it at a glance, so the figure is large and uses `tabular-nums` to
 * stop it jittering as it counts down.
 */
function StatTile({ label, value, hint, Icon }) {
  return (
    <div className="border-border flex flex-col gap-1 rounded-2xl border-2 p-4">
      <span className="flex items-center gap-1.5 text-xs tracking-wide uppercase">
        {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
        {label}
      </span>
      <span className="text-text-h font-mono text-3xl leading-none font-bold tabular-nums">
        {value}
      </span>
      {hint && <span className="text-xs opacity-60">{hint}</span>}
    </div>
  )
}

export default StatTile
