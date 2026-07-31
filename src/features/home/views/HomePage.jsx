import {
  ArrowRight,
  ChevronDown,
  MonitorPlay,
  QrCode,
  Settings2,
  Smartphone,
  Sparkles,
  UserPlus,
  Zap,
} from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { useHomeController } from '../controllers/useHomeController.js'
import FloatingIcons from './components/FloatingIcons.jsx'
import LiveStatus from './components/LiveStatus.jsx'
import Marquee from './components/Marquee.jsx'
import PrizeTeaser from './components/PrizeTeaser.jsx'
import StepCard from './components/StepCard.jsx'
import SurfaceCard from './components/SurfaceCard.jsx'

const CTA_BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-3.5 text-lg font-medium no-underline transition hover:opacity-85 active:scale-95'

function HomePage() {
  const home = useHomeController()

  return (
    <main className="flex flex-1 flex-col">
      {/* A very slowly drifting dot grid: the background breathes without
          competing with the text for attention. */}
      <section className="relative isolate overflow-hidden px-5 pt-14 pb-16 sm:pt-20">
        <div
          className="animate-drift absolute inset-0 -z-10 bg-[radial-gradient(circle,_var(--color-border)_1.5px,_transparent_1.5px)] bg-[length:28px_28px] opacity-70"
          aria-hidden="true"
        />
        <FloatingIcons />

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <p className="animate-rise border-accent-border text-text-h inline-flex w-fit items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-medium tracking-wide uppercase">
            <Sparkles className="size-4 shrink-0" aria-hidden="true" />
            Open Day · The campus game
          </p>

          <h1
            className="animate-rise text-text-h text-6xl leading-[0.85] font-black tracking-tighter sm:text-8xl lg:text-9xl"
            style={{ animationDelay: '80ms' }}
          >
            OPEN
            <br />
            DAY
            <br />
            {/* The tilted black block: the "festive" accent made out of shape
                rather than colour. It rocks slowly around that tilt, which is
                the one bit of movement in the headline itself. */}
            <span className="mt-2 inline-block -rotate-2">
              <span className="bg-accent animate-tilt inline-block px-4 pt-1 pb-2 text-white">
                QUIZ
              </span>
            </span>
          </h1>

          <p
            className="animate-rise max-w-2xl text-xl sm:text-2xl"
            style={{ animationDelay: '160ms' }}
          >
            Scan the QR code, answer on your phone, and watch your name climb the
            leaderboard on the big screen. Whoever finishes first gets to pick{' '}
            <strong className="text-text-h font-semibold">
              one of three mystery prize boxes
            </strong>
            .
          </p>

          <div
            className="animate-rise flex flex-wrap items-center gap-4"
            style={{ animationDelay: '240ms' }}
          >
            <a
              href={`#${ROUTES.PLAY}`}
              className={`${CTA_BASE} bg-accent border-accent-border relative overflow-hidden text-white`}
            >
              {/* A white glint crossing the black button every few seconds —
                  brightness, not colour, doing the "press me". */}
              <span
                className="animate-sweep absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 blur-sm"
                aria-hidden="true"
              />
              <Smartphone
                className="relative size-5 shrink-0"
                aria-hidden="true"
              />
              <span className="relative">Play now</span>
            </a>
            <a
              href={`#${ROUTES.DISPLAY}`}
              className={`${CTA_BASE} border-border text-text-h hover:border-accent-border`}
            >
              <MonitorPlay className="size-5 shrink-0" aria-hidden="true" />
              Open the big screen
            </a>
          </div>

          <div className="animate-rise" style={{ animationDelay: '320ms' }}>
            <LiveStatus {...home} />
          </div>

          {/* Tells the eye there is more below the fold. Decorative — the
              sections underneath are reachable without it. */}
          <ChevronDown
            className="animate-bob text-text-h mt-4 hidden size-7 self-center sm:block"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
      </section>

      <Marquee />

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-16">
        <header className="reveal flex flex-col gap-2">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            How do you play?
          </h2>
          <p className="text-lg">Three steps, nothing to install.</p>
        </header>

        <ul className="grid list-none gap-5 p-0 sm:grid-cols-3">
          <StepCard number="01" Icon={QrCode} title="Scan the QR code">
            The code is right there on the hall's big screen. Your phone camera is
            enough — no app to download.
          </StepCard>
          <StepCard
            number="02"
            Icon={UserPlus}
            title="Enter your name"
            delay="120ms"
          >
            Type the name you want on the leaderboard, then wait for the host to
            press start.
          </StepCard>
          <StepCard number="03" Icon={Zap} title="Answer fast" delay="240ms">
            Every question has a countdown. Correct answers score points, and the
            sooner you answer the more you get.
          </StepCard>
        </ul>
      </section>

      <section className="bg-code-bg border-border border-y">
        <div className="reveal mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-5 py-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            And the prize…
          </h2>
          <p className="max-w-xl text-lg">
            The winner comes up and picks one of three boxes. The boxes are
            reshuffled every round, so nobody can guess what is in which.
          </p>

          <PrizeTeaser />
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-16">
        <header className="reveal flex flex-col gap-2">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Three screens, one game
          </h2>
          <p className="text-lg">
            Every device on the same wifi sees the same state.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-3">
          <SurfaceCard
            href={`#${ROUTES.PLAY}`}
            Icon={Smartphone}
            title="Player"
            description="On a phone: enter your name, pick answers, track your score."
            featured
          />
          <SurfaceCard
            href={`#${ROUTES.DISPLAY}`}
            Icon={MonitorPlay}
            title="Big screen"
            description="For the projector: QR code, questions, clock, leaderboard."
            delay="120ms"
          />
          <SurfaceCard
            href={`#${ROUTES.ADMIN}`}
            Icon={Settings2}
            title="Admin"
            description="Write the questions and drive the round from the host's laptop."
            delay="240ms"
          />
        </div>
      </section>

      <footer className="border-border border-t px-5 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 text-sm">
          <span>Open Day Quiz — a demo that runs on the local network.</span>
          <a
            href={`#${ROUTES.ADMIN_LIVE}`}
            className="text-text-h inline-flex items-center gap-1.5 no-underline"
          >
            Control desk
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </main>
  )
}

export default HomePage
