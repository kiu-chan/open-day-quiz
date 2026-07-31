import { Check, Gift, Hourglass, MonitorOff, Trophy, X } from 'lucide-react'
import { SESSION_STATES } from '@common/session/models/SessionModel.js'
import ConnectionBanner from '@common/views/ConnectionBanner.jsx'
import Countdown from '@common/views/Countdown.jsx'
import LeaderboardTable from '@common/views/LeaderboardTable.jsx'
import ProgressBar from '@common/views/ProgressBar.jsx'
import QuizImage from '@common/views/QuizImage.jsx'
import { usePlayerController } from '../controllers/usePlayerController.js'
import AnswerOption from './components/AnswerOption.jsx'
import JoinForm from './components/JoinForm.jsx'
import PlayerShell from './components/PlayerShell.jsx'
import PrizeBoxPicker from './components/PrizeBoxPicker.jsx'
import StatusScreen from './components/StatusScreen.jsx'
import WaitingAvatar from './components/WaitingAvatar.jsx'

/** The right/wrong/too-late label — an icon alongside the text, never text alone. */
function Verdict({ isCorrect }) {
  if (isCorrect === null) {
    return (
      <p className="text-text-h flex items-center gap-2 text-lg font-medium">
        <Hourglass className="size-5" aria-hidden="true" />
        You ran out of time
      </p>
    )
  }
  return (
    <p className="text-text-h flex items-center gap-2 text-lg font-medium">
      {isCorrect ? (
        <Check className="size-5" strokeWidth={2.5} aria-label="Correct" />
      ) : (
        <X className="size-5" strokeWidth={2.5} aria-label="Wrong" />
      )}
      {isCorrect ? 'Correct!' : 'Not quite'}
    </p>
  )
}

function PlayerBody({ player }) {
  if (player.sessionState === SESSION_STATES.IDLE) {
    return (
      <PlayerShell name="">
        <StatusScreen
          icon={MonitorOff}
          title="No round yet"
          note="Wait for the organisers to open a session, then reload this page."
        />
      </PlayerShell>
    )
  }

  if (!player.hasJoined) {
    return (
      <PlayerShell name="">
        <h1 className="text-text-h text-2xl tracking-tight">Join</h1>
        <JoinForm
          defaultName={player.name}
          defaultAvatarId={player.avatarId}
          onJoin={player.join}
        />
      </PlayerShell>
    )
  }

  if (player.sessionState === SESSION_STATES.LOBBY) {
    return (
      <PlayerShell name={player.name} avatarId={player.avatarId}>
        <StatusScreen
          avatarId={player.avatarId}
          title="You're in, waiting to start"
          note={`${player.playerCount} waiting`}
        />
      </PlayerShell>
    )
  }

  if (player.sessionState === SESSION_STATES.QUESTION) {
    return (
      <PlayerShell name={player.name} avatarId={player.avatarId}>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs">
            Question {player.questionNumber} / {player.total}
          </p>
          <Countdown seconds={player.secondsLeft} className="text-sm" />
        </div>
        <ProgressBar value={player.progress} />

        {player.question.prompt && (
          <h2 className="text-text-h text-xl leading-snug">
            {player.question.prompt}
          </h2>
        )}

        <QuizImage
          src={player.question.image}
          alt="Question image"
          className="max-h-52 w-full"
        />

        <ul className="flex flex-col gap-3">
          {player.question.options.map((option, i) => (
            <li key={i}>
              <AnswerOption
                label={player.question.labelOf(i)}
                text={option}
                image={player.question.imageOf(i)}
                isPicked={player.myAnswer?.optionIndex === i}
                isLocked={player.myAnswer !== null}
                isRevealed={false}
                isAnswer={false}
                onPick={() => player.answer(i)}
              />
            </li>
          ))}
        </ul>

        {player.myAnswer && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-sm opacity-70">
              Answer sent. Waiting for everyone else.
            </p>
            <WaitingAvatar avatarId={player.avatarId} compact />
          </div>
        )}
      </PlayerShell>
    )
  }

  if (player.sessionState === SESSION_STATES.REVEAL) {
    return (
      <PlayerShell name={player.name} avatarId={player.avatarId}>
        <p className="font-mono text-xs">
          Question {player.questionNumber} / {player.total}
        </p>
        <Verdict isCorrect={player.isCorrect} />

        {player.myRow && (
          <p className="font-mono text-sm tabular-nums">
            +{player.pointsThisQuestion} points · total {player.myRow.score}
          </p>
        )}

        {player.question.prompt && (
          <h2 className="text-text-h text-lg leading-snug">
            {player.question.prompt}
          </h2>
        )}

        <ul className="flex flex-col gap-3">
          {player.question.options.map((option, i) => (
            <li key={i}>
              <AnswerOption
                label={player.question.labelOf(i)}
                text={option}
                image={player.question.imageOf(i)}
                isPicked={player.myAnswer?.optionIndex === i}
                isLocked
                isRevealed
                isAnswer={player.question.isCorrect(i)}
              />
            </li>
          ))}
        </ul>
      </PlayerShell>
    )
  }

  if (player.sessionState === SESSION_STATES.PODIUM) {
    return (
      <PlayerShell name={player.name} avatarId={player.avatarId}>
        <section className="flex flex-col items-center gap-2 py-4 text-center">
          <Trophy className="text-text-h size-10" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-sm opacity-70">Your rank</p>
          <p className="text-text-h font-mono text-5xl tabular-nums">
            {player.myRow?.rank ?? '—'}
          </p>
          <p className="text-sm">
            {player.myRow?.score ?? 0} points · {player.myRow?.correctCount ?? 0}/
            {player.total} correct
          </p>
        </section>

        <h2 className="text-text-h text-lg">Top 3</h2>
        <LeaderboardTable
          rows={player.topRows}
          highlightId={player.myRow?.playerId}
        />
      </PlayerShell>
    )
  }

  // What is left: prize and prizeRevealed — the winner picks a box, everyone
  // else watches.
  if (player.isWinner && player.prizeBoxes) {
    return (
      <PlayerShell name={player.name} avatarId={player.avatarId}>
        <section className="flex flex-col items-center gap-2 text-center">
          <Trophy className="text-text-h size-10" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="text-text-h text-2xl">You won!</h2>
          <p className="text-sm opacity-70">
            {player.prizeBoxes.isPicked
              ? 'Your prize'
              : 'Pick one of the three boxes'}
          </p>
        </section>

        <PrizeBoxPicker boxes={player.prizeBoxes} onPick={player.pickBox} />
      </PlayerShell>
    )
  }

  return (
    <PlayerShell name={player.name} avatarId={player.avatarId}>
      <StatusScreen
        icon={Gift}
        title={
          player.prizeBoxes?.isPicked
            ? `${player.winnerName} got ${player.prizeBoxes.pickedPrize}`
            : `${player.winnerName} is picking a prize`
        }
        note="Watch the big screen."
      />
    </PlayerShell>
  )
}

function PlayerPage() {
  const player = usePlayerController()

  return (
    <>
      <ConnectionBanner isOffline={player.isOffline} />
      <PlayerBody player={player} />
    </>
  )
}

export default PlayerPage
