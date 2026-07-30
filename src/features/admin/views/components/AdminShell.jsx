import { MonitorPlay, Smartphone } from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'

const NAV = [
  { key: 'list', label: 'Bộ quiz', href: `#${ROUTES.ADMIN}` },
  { key: 'live', label: 'Bàn điều khiển', href: `#${ROUTES.ADMIN_LIVE}` },
]

/** Khung chung của ba trang admin: điều hướng trên, nội dung dưới. */
function AdminShell({ current, children }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-5 py-8">
      <header className="border-border flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <nav className="flex items-center gap-5">
          {NAV.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={`text-sm ${
                item.key === current
                  ? 'text-text-h font-medium underline underline-offset-4'
                  : 'no-underline'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <a
            href={`#${ROUTES.DISPLAY}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 no-underline"
          >
            <MonitorPlay className="size-4" aria-hidden="true" />
            Màn hình lớn
          </a>
          <a
            href={`#${ROUTES.PLAY}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 no-underline"
          >
            <Smartphone className="size-4" aria-hidden="true" />
            Trang người chơi
          </a>
        </div>
      </header>

      {children}
    </div>
  )
}

export default AdminShell
