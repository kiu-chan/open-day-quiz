import { ArrowLeft, Check, Gift, Hourglass, MonitorOff, X } from 'lucide-react'
import { SESSION_STATES } from '@common/session/models/SessionModel.js'
import Button from '@common/views/Button.jsx'
import ConnectionBanner from '@common/views/ConnectionBanner.jsx'
import Countdown from '@common/views/Countdown.jsx'
import CountdownBar from '@common/views/CountdownBar.jsx'
import LeaderboardTable from '@common/views/LeaderboardTable.jsx'
import PlayerAvatar from '@common/views/PlayerAvatar.jsx'
import PrizeBoxRow from '@common/views/PrizeBoxRow.jsx'
import QuizImage from '@common/views/QuizImage.jsx'
import ScoreCounter from '@common/views/ScoreCounter.jsx'
import StandingsBoard from '@common/views/StandingsBoard.jsx'
import { usePlayerController } from '../controllers/usePlayerController.js'
import AnswerOption from './components/AnswerOption.jsx'
import JoinForm from './components/JoinForm.jsx'
import PlayerShell from './components/PlayerShell.jsx'
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
          suggestedAvatarId={player.avatarId}
          takenAvatarIds={player.takenAvatarIds}
          isFull={player.isFull}
          lostTheRace={player.avatarTaken}
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

        {/* The only way back, and only while it costs nothing: once the first
            question is out there is a score attached to this seat. */}
        {player.canLeave && (
          <Button
            variant="quiet"
            onClick={player.leave}
            className="self-center text-sm"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Change name or animal
          </Button>
        )}
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
        <CountdownBar
          percent={player.timeLeftPercent}
          seconds={player.secondsLeft}
        />

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
          <p className="flex items-center gap-1 font-mono text-sm tabular-nums">
            +{player.pointsThisQuestion} points · total
            <ScoreCounter
              from={player.myPreviousScore}
              to={player.myRow.score}
            />
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

  // The standings step, on its own screen — the phone shows the same ten the
  // big screen does, with this player's row marked.
  if (player.sessionState === SESSION_STATES.STANDINGS) {
    return (
      <PlayerShell name={player.name} avatarId={player.avatarId}>
        <p className="font-mono text-xs">
          After question {player.questionNumber} / {player.total}
        </p>
        <h2 className="text-text-h text-lg">Top 10</h2>

        {/* Spelled out because a player outside the ten finds no row of their
            own on the board below. */}
        {player.myRow && (
          <p className="font-mono text-sm tabular-nums">
            You are {player.myRow.rank} of {player.playerCount} ·{' '}
            {player.myRow.score} points
          </p>
        )}

        <StandingsBoard
          rows={player.standings}
          highlightId={player.myRow?.playerId}
        />
      </PlayerShell>
    )
  }

  if (player.sessionState === SESSION_STATES.PODIUM) {
    return (
      <PlayerShell name={player.name} avatarId={player.avatarId}>
        <section className="flex flex-col items-center gap-2 py-4 text-center">
          <PlayerAvatar avatarId={player.avatarId} className="size-16 border-2" />
          <p className="text-sm opacity-70">Your rank</p>
          <p className="text-text-h font-mono text-5xl tabular-nums">
            {player.myRow?.rank ?? '—'}
          </p>
          <p className="text-sm">
            {player.myRow?.score ?? 0} points · {player.myRow?.correctCount ?? 0}/
            {player.total} correct
          </p>
          <p className="text-xs opacity-70">of {player.playerCount} players</p>
        </section>

        {/* The board stops at ten; anyone below it reads their own rank above
            and nobody else's. */}
        <h2 className="text-text-h text-lg">Top 10</h2>
        <LeaderboardTable
          rows={player.topTen}
          highlightId={player.myRow?.playerId}
        />
      </PlayerShell>
    )
  }

  // What is left: prize and prizeRevealed — the winners open a box each, in rank
  // order, and everyone else watches.
  if (player.isWinner && player.myBoxes) {
    return (
      <PlayerShell name={player.name} avatarId={player.avatarId}>
        <section className="flex flex-col items-center gap-2 text-center">
          <PlayerAvatar avatarId={player.avatarId} className="size-20 border-2" />
          <h2 className="text-text-h text-2xl">You won!</h2>
          <p className="text-sm opacity-70">
            {player.myBoxes.isPicked
              ? 'Your prize'
              : player.isMyTurn
                ? 'Pick one of the three boxes'
                : `Wait for ${player.pickingName} to open theirs first`}
          </p>
        </section>

        {/* The boxes only become tappable on this phone's turn: handing `onPick`
            over early would offer a tap the server is going to refuse. */}
        <PrizeBoxRow
          boxes={player.myBoxes}
          onPick={player.isMyTurn ? player.pickBox : undefined}
        />
      </PlayerShell>
    )
  }

  return (
    <PlayerShell name={player.name} avatarId={player.avatarId}>
      <StatusScreen
        icon={Gift}
        title={
          player.pickingName
            ? `${player.pickingName} is picking a prize`
            : 'The prizes are out'
        }
        note={
          player.pickingName
            ? 'Watch the big screen.'
            : `Winners: ${player.winnerNames.join(', ')}`
        }
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
