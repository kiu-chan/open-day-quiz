/**
 * Khối nội dung có viền của trang admin. Mọi mảng trong bàn điều khiển và trang
 * soạn quiz đều dùng chung khối này để các cạnh thẳng hàng nhau; `dashed` dành
 * cho khối chưa có nội dung thật (trạng thái rỗng, hướng dẫn).
 */
function Panel({ title, Icon, aside, dashed = false, className = '', children }) {
  return (
    <section
      className={`border-border bg-bg flex flex-col gap-4 rounded-2xl border-2 p-5 ${
        dashed ? 'border-dashed' : ''
      } ${className}`}
    >
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-text-h flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
            {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
            {title}
          </h2>
          {aside}
        </header>
      )}

      {children}
    </section>
  )
}

export default Panel
