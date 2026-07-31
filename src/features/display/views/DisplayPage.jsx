import { Gift, MonitorOff, Trophy, Users } from 'lucide-react'
import { SESSION_STATES } from '@common/session/models/SessionModel.js'
import ConnectionBanner from '@common/views/ConnectionBanner.jsx'
import Countdown from '@common/views/Countdown.jsx'
import JoinQr from '@common/views/JoinQr.jsx'
import LeaderboardTable from '@common/views/LeaderboardTable.jsx'
import PlayerAvatar from '@common/views/PlayerAvatar.jsx'
import ProgressBar from '@common/views/ProgressBar.jsx'
import QuizImage from '@common/views/QuizImage.jsx'
import { useDisplayController } from '../controllers/useDisplayController.js'
import BigOption from './components/BigOption.jsx'
import DisplayShell from './components/DisplayShell.jsx'
import PlayerWall from './components/PlayerWall.jsx'
import PrizeShowcase from './components/PrizeShowcase.jsx'

function DisplayBody({ display }) {
  if (display.state === SESSION_STATES.IDLE) {
    return (
      <DisplayShell>
        <div className="flex flex-col items-center gap-6 text-center">
          <MonitorOff className="text-text-h size-20" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="text-text-h text-5xl tracking-tight">No session open</h1>
        </div>
      </DisplayShell>
    )
  }

  if (display.state === SESSION_STATES.LOBBY) {
    return (
      <DisplayShell>
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-text-h text-5xl tracking-tight lg:text-6xl">
            Scan the QR code to join
          </h1>

          {/* On a projector the QR size is derived from the viewport height: a
              4:3 hall screen is shorter than a laptop screen, so a hardcoded
              320px is either too small or pushes the text below off-screen. */}
          <JoinQr url={display.joinUrl} size="min(42vh, 80vw)" zoomable />

          <p className="font-mono text-lg break-all lg:text-xl">{display.joinUrl}</p>

          <p className="text-text-h flex items-center gap-3 text-4xl font-medium">
            <Users className="size-9" aria-hidden="true" />
            <span className="tabular-nums">{display.playerCount}</span>
            <span className="text-2xl font-normal">joined</span>
          </p>

          <PlayerWall players={display.players} />
        </div>
      </DisplayShell>
    )
  }

  if (
    display.state === SESSION_STATES.QUESTION ||
    display.state === SESSION_STATES.REVEAL
  ) {
    const isRevealed = display.state === SESSION_STATES.REVEAL

    return (
      <DisplayShell
        header={
          <>
            <p className="font-mono text-2xl">
              Question {display.questionNumber} / {display.total}
            </p>
            {isRevealed ? (
              <p className="font-mono text-2xl tabular-nums">
                {display.answeredCount} / {display.playerCount} answered
              </p>
            ) : (
              <Countdown seconds={display.secondsLeft} className="text-4xl" />
            )}
          </>
        }
      >
        {display.question.prompt && (
          <h1
            className={`text-text-h leading-tight tracking-tight ${
              isRevealed ? 'text-3xl lg:text-4xl' : 'text-4xl lg:text-6xl'
            }`}
          >
            {display.question.prompt}
          </h1>
        )}

        {/* The image is capped by viewport height so the four option tiles below
            can never be pushed off the projected area. */}
        <QuizImage
          src={display.question.image}
          alt="Question image"
          className="mx-auto max-h-[36vh] w-auto"
        />

        <ul className="grid gap-4 lg:grid-cols-2">
          {display.question.options.map((option, i) => (
            <BigOption
              key={i}
              label={display.question.labelOf(i)}
              text={option}
              image={display.question.imageOf(i)}
              isRevealed={isRevealed}
              isAnswer={display.question.isCorrect(i)}
              count={display.distribution[i] ?? 0}
            />
          ))}
        </ul>

        <ProgressBar value={display.progress} className="h-3" />
      </DisplayShell>
    )
  }

  if (display.state === SESSION_STATES.PODIUM) {
    return (
      <DisplayShell
        header={
          <>
            <p className="font-mono text-2xl">Results</p>
            <p className="font-mono text-2xl tabular-nums">
              {display.playerCount} players
            </p>
          </>
        }
      >
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-text-h flex items-center gap-4 text-5xl tracking-tight lg:text-6xl">
            <Trophy className="size-12" strokeWidth={1.5} aria-hidden="true" />
            Leaderboard
          </h1>
          <LeaderboardTable rows={display.topRows} variant="display" />
        </div>
      </DisplayShell>
    )
  }

  // What is left: prize and prizeRevealed.
  return (
    <DisplayShell>
      <div className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-text-h flex items-center gap-4 text-5xl tracking-tight lg:text-6xl">
          <Gift className="size-12" strokeWidth={1.5} aria-hidden="true" />
          {display.prizeBoxes?.isPicked ? 'The prize' : 'Pick a prize box'}
        </h1>
        <p className="flex items-center justify-center gap-3 text-3xl">
          Winner:
          <PlayerAvatar avatarId={display.winnerAvatarId} className="size-14" />
          <span className="text-text-h font-medium">{display.winnerName}</span>
        </p>

        {display.prizeBoxes && <PrizeShowcase boxes={display.prizeBoxes} />}
      </div>
    </DisplayShell>
  )
}

function DisplayPage() {
  const display = useDisplayController()

  return (
    <>
      <ConnectionBanner isOffline={display.isOffline} />
      <DisplayBody display={display} />
    </>
  )
}

export default DisplayPage
