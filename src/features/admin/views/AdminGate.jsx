import { useState } from 'react'
import {
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Lock,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  Unplug,
} from 'lucide-react'
import Button from '@common/views/Button.jsx'
import { useAdminAuthController } from '../controllers/useAdminAuthController.js'

const FIELD =
  'border-border bg-bg text-text-h focus:border-accent-border w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition'

/** The frame every state of the gate is drawn in: one centred card, nothing else. */
function Card({ Icon, title, subtitle, children }) {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="animate-rise border-border bg-bg shadow-card flex w-full max-w-md flex-col gap-6 rounded-2xl border-2 p-7">
        <div className="flex flex-col gap-2">
          <Icon className="text-text-h size-9" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="text-text-h text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  )
}

/**
 * The lock on the three admin pages: `children` only renders once this browser
 * has typed the event password.
 *
 * It is page-level rather than a component under `components/` because it calls
 * a controller and it *is* the whole screen until it opens.
 *
 * On an installation that has no password yet it asks for one instead of asking
 * to type one — the very first person to open the admin page sets it, and from
 * that moment the server refuses to set another (see `server/adminAuth.js`).
 */
function AdminGate({ children }) {
  const { status, minPasswordLength, error, isSubmitting, submit, retry } =
    useAdminAuthController()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  if (status === 'unlocked') return children

  if (status === 'checking') {
    return (
      <Card Icon={Lock} title="Admin" subtitle="Checking with the server…">
        <LoaderCircle
          className="text-text-h size-8 animate-spin"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </Card>
    )
  }

  if (status === 'unreachable') {
    return (
      <Card
        Icon={Unplug}
        title="No server"
        subtitle="The game server did not answer, so the admin page cannot be unlocked. Start it, then try again."
      >
        <Button variant="primary" onClick={retry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </Card>
    )
  }

  const isSetup = status === 'setup'

  return (
    <Card
      Icon={isSetup ? ShieldCheck : Lock}
      title={isSetup ? 'Set the admin password' : 'Admin password'}
      subtitle={
        isSetup
          ? 'This installation has no password yet. Pick one now — it is hashed and written to the .env file on this machine, never stored as typed.'
          : 'The control desk is locked. Type the password chosen for this installation.'
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          submit({ password, confirm })
        }}
      >
        <label className="flex flex-col gap-2">
          <span className="text-text-h text-sm font-medium">Password</span>
          <div className="relative">
            <input
              type={isVisible ? 'text' : 'password'}
              className={`${FIELD} pr-12`}
              value={password}
              autoFocus
              autoComplete={isSetup ? 'new-password' : 'current-password'}
              minLength={isSetup ? minPasswordLength : undefined}
              required
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="text-text hover:text-text-h absolute inset-y-0 right-0 cursor-pointer px-4 transition"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? (
                <EyeOff className="size-5" aria-label="Hide the password" />
              ) : (
                <Eye className="size-5" aria-label="Show the password" />
              )}
            </button>
          </div>
          {isSetup && (
            <span className="text-xs opacity-70">
              At least {minPasswordLength} characters.
            </span>
          )}
        </label>

        {isSetup && (
          <label className="flex flex-col gap-2">
            <span className="text-text-h text-sm font-medium">Repeat the password</span>
            <input
              type={isVisible ? 'text' : 'password'}
              className={FIELD}
              value={confirm}
              autoComplete="new-password"
              required
              onChange={(event) => setConfirm(event.target.value)}
            />
          </label>
        )}

        {error && (
          <p className="border-accent-border text-text-h flex items-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm">
            <TriangleAlert className="size-4 shrink-0" aria-label="Error" />
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <KeyRound className="size-4" aria-hidden="true" />
          )}
          {isSetup ? 'Set the password' : 'Unlock'}
        </Button>
      </form>
    </Card>
  )
}

export default AdminGate
