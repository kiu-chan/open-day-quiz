import { ArrowRight } from 'lucide-react'

/**
 * Thẻ dẫn tới một trong ba màn của app. Thẻ nổi bật (`featured`) đổ đen thay vì
 * đổi màu — cùng một cách phân cấp với Button.
 */
function SurfaceCard({ href, Icon, title, description, featured = false, delay = '0ms' }) {
  const tone = featured
    ? 'bg-accent border-accent-border text-white'
    : 'border-border text-text hover:border-accent-border'

  return (
    <a
      href={href}
      style={{ animationDelay: delay }}
      className={`animate-rise hover:shadow-card flex flex-col gap-3 rounded-2xl border-2 p-6 no-underline transition duration-300 hover:-translate-y-1 ${tone}`}
    >
      <Icon className="size-8 shrink-0" strokeWidth={1.5} aria-hidden="true" />

      <h3
        className={`text-xl font-semibold ${featured ? 'text-white' : 'text-text-h'}`}
      >
        {title}
      </h3>
      <p className={`text-base ${featured ? 'opacity-80' : ''}`}>{description}</p>

      <span className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-medium">
        Mở
        <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
      </span>
    </a>
  )
}

export default SurfaceCard
