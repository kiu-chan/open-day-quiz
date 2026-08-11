import { Gift, ListOrdered, MonitorOff, Play, Trophy, Users } from 'lucide-react'
import { SESSION_STATES } from '@common/session/models/SessionModel.js'
import Button from '@common/views/Button.jsx'
import ConnectionBanner from '@common/views/ConnectionBanner.jsx'
import Countdown from '@common/views/Countdown.jsx'
import LeaderboardTable from '@common/views/LeaderboardTable.jsx'
import PlayerAvatar from '@common/views/PlayerAvatar.jsx'
import PrizeBoxRow from '@common/views/PrizeBoxRow.jsx'
import ProgressBar from '@common/views/ProgressBar.jsx'
import QuizImage from '@common/views/QuizImage.jsx'
import StandingsBoard from '@common/views/StandingsBoard.jsx'
import { useDisplayController } from '../controllers/useDisplayController.js'
import BigOption from './components/BigOption.jsx'
import DisplayShell from './components/DisplayShell.jsx'
import LobbyCodes from './components/LobbyCodes.jsx'
import PlayerWall from './components/PlayerWall.jsx'

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
            {display.wifiSsid
              ? 'Wi-Fi first, then scan to join'
              : 'Scan the QR code to join'}
          </h1>

          <LobbyCodes
            joinUrl={display.joinUrl}
            ssid={display.wifiSsid}
            password={display.wifiPassword}
          />

          <p className="text-text-h flex items-center gap-3 text-4xl font-medium">
            <Users className="size-9" aria-hidden="true" />
            <span className="tabular-nums">{display.playerCount}</span>
            <span className="text-2xl font-normal">joined</span>
          </p>

          <PlayerWall players={display.players} />

          {/* Starting from the big screen saves the host walking back to the
              laptop. Disabled until the lobby holds enough people: a round
              started in front of a near-empty hall cannot be rewound, only
              cancelled from the desk. */}
          <Button
            variant="primary"
            className="px-10 py-5 text-3xl"
            disabled={!display.canStart}
            onClick={display.start}
          >
            <Play className="size-8" aria-hidden="true" />
            Start the quiz
          </Button>

          {!display.canStart && (
            <p className="text-xl">
              Waiting for {display.minPlayers} players to join.
            </p>
          )}
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

  // The standings have the screen to themselves: the answer has been read by
  // now, and a ranking that moves is worth looking at on its own.
  if (display.state === SESSION_STATES.STANDINGS) {
    return (
      <DisplayShell
        header={
          <>
            <p className="font-mono text-2xl">
              After question {display.questionNumber} / {display.total}
            </p>
            <p className="font-mono text-2xl tabular-nums">
              {display.playerCount} players
            </p>
          </>
        }
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <h1 className="text-text-h flex items-center gap-4 text-4xl tracking-tight">
            <ListOrdered className="size-10" strokeWidth={1.5} aria-hidden="true" />
            Top 10
          </h1>
          <StandingsBoard rows={display.standings} variant="display" />
        </div>

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
            Top 10
          </h1>
          <LeaderboardTable rows={display.topTen} variant="display" />
        </div>
      </DisplayShell>
    )
  }

  // What is left: prize and prizeRevealed. Every winner is on screen at once,
  // each with their own three boxes: they open them one at a time, and a box
  // that has been opened has to stay up while the next winner takes their turn.
  const columns =
    display.winnerCount === 1
      ? 'grid-cols-1'
      : display.winnerCount === 2
        ? 'lg:grid-cols-2'
        : 'lg:grid-cols-3'

  return (
    <DisplayShell>
      <div className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-text-h flex items-center gap-4 text-5xl tracking-tight lg:text-6xl">
          <Gift className="size-12" strokeWidth={1.5} aria-hidden="true" />
          {display.isPrizeDone
            ? display.winnerCount === 1
              ? 'The prize'
              : 'The prizes'
            : 'Pick a prize box'}
        </h1>

        <ul className={`grid w-full list-none gap-10 p-0 ${columns}`}>
          {display.prizeRows.map((row) => {
            // Whose turn it is: said in words and dimmed when it is not, never
            // by colour.
            const isWaiting = !row.boxes.isPicked && !row.isPicking

            return (
              <li
                key={row.playerId}
                className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${
                  isWaiting ? 'opacity-40' : ''
                }`}
              >
                <p className="flex items-center justify-center gap-3 text-3xl">
                  <PlayerAvatar avatarId={row.avatarId} className="size-14" />
                  <span className="text-text-h font-medium">{row.name}</span>
                </p>

                {!row.boxes.isPicked && (
                  <p className="text-2xl">
                    {row.isPicking ? 'is picking now' : 'waiting their turn'}
                  </p>
                )}

                <PrizeBoxRow boxes={row.boxes} variant="display" />
              </li>
            )
          })}
        </ul>
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
