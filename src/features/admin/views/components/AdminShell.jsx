import { MonitorPlay, Smartphone } from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'

const NAV = [
  { key: 'list', label: 'Quizzes', href: `#${ROUTES.ADMIN}` },
  { key: 'live', label: 'Control desk', href: `#${ROUTES.ADMIN_LIVE}` },
  { key: 'home', label: 'Home page', href: `#${ROUTES.ADMIN_HOME}` },
]

const EXTERNAL = [
  {
    key: 'display',
    label: 'Big screen',
    href: `#${ROUTES.DISPLAY}`,
    Icon: MonitorPlay,
  },
  {
    key: 'play',
    label: 'Player page',
    href: `#${ROUTES.PLAY}`,
    Icon: Smartphone,
  },
]

/**
 * The shared frame of the three admin pages: a sticky nav bar, the page title,
 * then the content.
 *
 * The title lives in the shell rather than in each page so all three admin pages
 * keep the same rhythm: same font size, same spacing, same place for the action
 * buttons (`actions`). The open tab is marked with a black fill, not a colour.
 */
function AdminShell({ current, title, subtitle, actions, children }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-border bg-bg/90 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3">
          <div className="flex items-center gap-4">
            <a
              href={`#${ROUTES.HOME}`}
              className="text-text-h flex items-center gap-2.5 no-underline"
            >
              <span className="bg-accent flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold text-white">
                OD
              </span>
              <span className="hidden text-sm font-semibold tracking-tight sm:inline">
                Open Day Quiz
              </span>
            </a>

            <nav className="flex items-center gap-1.5">
              {NAV.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  aria-current={item.key === current ? 'page' : undefined}
                  className={`rounded-full border-2 px-3.5 py-1.5 text-sm no-underline transition ${
                    item.key === current
                      ? 'bg-accent border-accent-border font-medium text-white'
                      : 'text-text hover:border-border border-transparent'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {EXTERNAL.map(({ key, label, href, Icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-text hover:text-text-h inline-flex items-center gap-1.5 no-underline transition"
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="hidden md:inline">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-8">
        {title && (
          <div className="animate-rise flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-text-h text-4xl font-bold tracking-tight sm:text-5xl">
                {title}
              </h1>
              {subtitle && <p className="text-base">{subtitle}</p>}
            </div>

            {actions && (
              <div className="flex flex-wrap items-center gap-2">{actions}</div>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  )
}

export default AdminShell
