import {
  ArrowRight,
  ChevronDown,
  MonitorPlay,
  QrCode,
  Smartphone,
  Sparkles,
  UserPlus,
  Zap,
} from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { useHeadlineLayout } from '../controllers/useHeadlineLayout.js'
import { useHomeController } from '../controllers/useHomeController.js'
import FloatingIcons from './components/FloatingIcons.jsx'
import HeroTitle from './components/HeroTitle.jsx'
import JoinPanel from './components/JoinPanel.jsx'
import LiveStatus from './components/LiveStatus.jsx'
import Marquee from './components/Marquee.jsx'
import PrizeTeaser from './components/PrizeTeaser.jsx'
import StepCard from './components/StepCard.jsx'

const CTA_BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-3.5 text-lg font-medium no-underline transition hover:opacity-85 active:scale-95'

/* The three steps. Only the words are the admin's — the number, the icon and the
   order are layout, and a step card without its icon is a different design, not
   different content. */
const STEPS = [
  { number: '01', Icon: QrCode, title: 'step1Title', text: 'step1Text', delay: '0ms' },
  { number: '02', Icon: UserPlus, title: 'step2Title', text: 'step2Text', delay: '120ms' },
  { number: '03', Icon: Zap, title: 'step3Title', text: 'step3Text', delay: '240ms' },
]

function HomePage() {
  const home = useHomeController()
  const headline = useHeadlineLayout()
  const { content } = home

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
            {content.badge}
          </p>

          <HeroTitle headline={content.headline} {...headline} />

          <p
            className="animate-rise max-w-2xl text-xl sm:text-2xl"
            style={{ animationDelay: '160ms' }}
          >
            {content.intro}{' '}
            <strong className="text-text-h font-semibold">
              {content.introHighlight}
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
              <span className="relative">{content.playCta}</span>
            </a>
            <a
              href={`#${ROUTES.DISPLAY}`}
              className={`${CTA_BASE} border-border text-text-h hover:border-accent-border`}
            >
              <MonitorPlay className="size-5 shrink-0" aria-hidden="true" />
              {content.displayCta}
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

      <Marquee items={content.marquee} />

      <JoinPanel
        url={home.homeUrl}
        title={content.joinTitle}
        text={content.joinText}
      />

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-16">
        <header className="reveal flex flex-col gap-2">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {content.stepsTitle}
          </h2>
          <p className="text-lg">{content.stepsSubtitle}</p>
        </header>

        <ul className="grid list-none gap-5 p-0 sm:grid-cols-3">
          {STEPS.map(({ number, Icon, title, text, delay }) => (
            <StepCard
              key={number}
              number={number}
              Icon={Icon}
              title={content[title]}
              delay={delay}
            >
              {content[text]}
            </StepCard>
          ))}
        </ul>
      </section>

      <section className="bg-code-bg border-border border-y">
        <div className="reveal mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-5 py-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {content.prizeTitle}
          </h2>
          <p className="max-w-xl text-lg">{content.prizeText}</p>

          <PrizeTeaser />
        </div>
      </section>

      <footer className="border-border border-t px-5 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 text-sm">
          <span>{content.footerNote}</span>
          <a
            href={`#${ROUTES.ADMIN_LIVE}`}
            className="text-text-h inline-flex items-center gap-1.5 no-underline"
          >
            {content.footerLink}
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </main>
  )
}

export default HomePage
