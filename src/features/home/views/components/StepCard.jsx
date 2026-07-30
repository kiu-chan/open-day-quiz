/** Một bước trong phần "Chơi thế nào": số thứ tự cỡ lớn, icon, mô tả ngắn. */
function StepCard({ number, Icon, title, children, delay = '0ms' }) {
  return (
    <li
      className="animate-rise border-border hover:border-accent-border hover:shadow-card group relative flex flex-col gap-3 rounded-2xl border-2 p-6 transition duration-300 hover:-translate-y-1"
      style={{ animationDelay: delay }}
    >
      <span className="text-text-h/10 group-hover:text-text-h/20 absolute top-3 right-5 font-mono text-6xl font-black transition">
        {number}
      </span>

      <Icon
        className="text-text-h size-9 shrink-0"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-base">{children}</p>
    </li>
  )
}

export default StepCard
