import {
  ArrowRight,
  Eye,
  Gift,
  ListChecks,
  ListOrdered,
  MessageCircleQuestion,
  Play,
  RotateCcw,
  Timer,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { SESSION_STATES } from '@common/session/models/SessionModel.js'
import Button from '@common/views/Button.jsx'
import ConnectionBanner from '@common/views/ConnectionBanner.jsx'
import Countdown from '@common/views/Countdown.jsx'
import LeaderboardTable from '@common/views/LeaderboardTable.jsx'
import ProgressBar from '@common/views/ProgressBar.jsx'
import { useLiveController } from '../controllers/useLiveController.js'
import AdminShell from './components/AdminShell.jsx'
import AnswerTally from './components/AnswerTally.jsx'
import AutoToggle from './components/AutoToggle.jsx'
import JoinLinkCard from './components/JoinLinkCard.jsx'
import Panel from './components/Panel.jsx'
import PlayerList from './components/PlayerList.jsx'
import QuestionPreview from './components/QuestionPreview.jsx'
import StartDialog from './components/StartDialog.jsx'
import StateBadge from './components/StateBadge.jsx'
import StatTile from './components/StatTile.jsx'

/**
 * The button row for the current step. The move-on button is always on the left
 * and noticeably bigger — the host presses it dozens of times per round and
 * should never have to hunt for it.
 */
function ActionBar({ children }) {
  return (
    <div className="border-border bg-bg sticky bottom-0 -mx-5 flex flex-wrap items-center gap-3 border-t px-5 py-4">
      {children}
    </div>
  )
}

function IdlePage({ live }) {
  return (
    <AdminShell
      current="live"
      title="Control desk"
      // Auto mode can be armed before the round starts — it carries into the
      // session the admin is about to open.
      actions={<AutoToggle isOn={live.isAuto} onToggle={live.setAuto} />}
    >
      <Panel dashed className="items-center py-14 text-center">
        <MessageCircleQuestion
          className="text-text-h size-10"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <p className="text-base">No session is open.</p>
        <a
          href={`#${ROUTES.ADMIN}`}
          className="inline-flex items-center gap-2 no-underline"
        >
          Pick a quiz and press “Open session”
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </a>
      </Panel>
    </AdminShell>
  )
}

function LiveBody({ live }) {
  const [isConfirmingStart, setIsConfirmingStart] = useState(false)
  const isPlaying = [
    SESSION_STATES.QUESTION,
    SESSION_STATES.REVEAL,
    SESSION_STATES.STANDINGS,
  ].includes(live.state)

  return (
    <AdminShell
      current="live"
      title={live.quiz.title || 'Untitled quiz'}
      subtitle={
        isPlaying
          ? `Question ${live.questionNumber} of ${live.total}`
          : 'The round is running on the big screen'
      }
      actions={
        <>
          <AutoToggle isOn={live.isAuto} onToggle={live.setAuto} />
          <StateBadge state={live.state} />
        </>
      }
    >
      <ProgressBar value={live.progress} />

      {live.state === SESSION_STATES.LOBBY && (
        <>
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <JoinLinkCard url={live.joinUrl} />
            <PlayerList players={live.players} />
          </div>

          <ActionBar>
            <Button
              variant="primary"
              className="px-6 py-3 text-lg"
              disabled={!live.canStart}
              onClick={() => setIsConfirmingStart(true)}
            >
              <Play className="size-5" aria-hidden="true" />
              Start
            </Button>
            <span className="text-sm opacity-70">
              {live.canStart
                ? `${live.playerCount} player(s) ready.`
                : `Waiting for ${live.minPlayers - live.playerCount} more player(s) — a round needs ${live.minPlayers}.`}
              {live.isAuto &&
                ' Auto is on — the round runs itself to the final results.'}
            </span>
            <Button variant="quiet" className="ml-auto" onClick={live.cancel}>
              <X className="size-4" aria-hidden="true" />
              Cancel session
            </Button>
          </ActionBar>

          {isConfirmingStart && (
            <StartDialog
              quiz={live.quiz}
              playerCount={live.playerCount}
              isAuto={live.isAuto}
              onClose={() => setIsConfirmingStart(false)}
              onConfirm={() => {
                setIsConfirmingStart(false)
                live.start()
              }}
            />
          )}
        </>
      )}

      {live.state === SESSION_STATES.QUESTION && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile
              label="Question"
              Icon={ListChecks}
              value={`${live.questionNumber}/${live.total}`}
            />
            <StatTile
              label="Answered"
              Icon={Users}
              value={`${live.answeredCount}/${live.playerCount}`}
              hint={
                live.answeredCount === live.playerCount
                  ? 'Everyone has answered — safe to close'
                  : 'Waiting for more players'
              }
            />
            <div className="border-border flex flex-col gap-2 rounded-2xl border-2 p-4">
              <span className="flex items-center gap-1.5 text-xs tracking-wide uppercase">
                <Timer className="size-3.5 shrink-0" aria-hidden="true" />
                Time left
              </span>
              <Countdown seconds={live.secondsLeft} className="self-start text-2xl" />
            </div>
          </div>

          <Panel title="Current question" Icon={MessageCircleQuestion}>
            <QuestionPreview question={live.question} />
          </Panel>

          <ActionBar>
            <Button
              variant="primary"
              className="px-6 py-3 text-lg"
              onClick={live.reveal}
            >
              <Eye className="size-5" aria-hidden="true" />
              Reveal answer
            </Button>
            <span className="text-sm opacity-70">
              When time runs out the server closes it automatically — no need to
              wait for a click.
            </span>
          </ActionBar>
        </>
      )}

      {live.state === SESSION_STATES.REVEAL && (
        <>
          <Panel
            title={`Question ${live.questionNumber} / ${live.total}`}
            Icon={MessageCircleQuestion}
            aside={
              <span className="font-mono text-xs">
                {live.answeredCount}/{live.playerCount} answered
              </span>
            }
          >
            <h2 className="text-text-h text-2xl leading-snug font-semibold">
              {live.question.prompt}
            </h2>

            <AnswerTally
              question={live.question}
              distribution={live.distribution}
              playerCount={live.playerCount}
            />
          </Panel>

          <ActionBar>
            <Button
              variant="primary"
              className="px-6 py-3 text-lg"
              onClick={live.goNext}
            >
              <ListOrdered className="size-5" aria-hidden="true" />
              Show standings
            </Button>
            {live.isAuto && (
              <span className="text-sm opacity-70">
                Auto is on — the standings come up in {live.autoSecondsLeft}s.
                Press to go now.
              </span>
            )}
          </ActionBar>
        </>
      )}

      {live.state === SESSION_STATES.STANDINGS && (
        <>
          <Panel
            title={`Top 10 after question ${live.questionNumber} / ${live.total}`}
            Icon={ListOrdered}
          >
            <LeaderboardTable rows={live.standings} />
          </Panel>

          <ActionBar>
            <Button
              variant="primary"
              className="px-6 py-3 text-lg"
              onClick={live.goNext}
            >
              <ArrowRight className="size-5" aria-hidden="true" />
              {live.isLastQuestion ? 'See results' : 'Next question'}
            </Button>
            {live.isAuto && (
              <span className="text-sm opacity-70">
                Auto is on —{' '}
                {live.isLastQuestion
                  ? 'the final results appear'
                  : 'the next question starts'}{' '}
                in {live.autoSecondsLeft}s. Press to go now.
              </span>
            )}
          </ActionBar>
        </>
      )}

      {live.state === SESSION_STATES.PODIUM && (
        <>
          <Panel
            title="Leaderboard"
            Icon={Trophy}
            aside={
              <span className="text-xs opacity-70">
                Showing on the big screen
              </span>
            }
          >
            <LeaderboardTable rows={live.leaderboardRows} />
          </Panel>

          {live.hasTieAtTop ? (
            <Panel title="Choose who gets the prize" Icon={Gift} dashed>
              <p className="text-sm">
                {live.topRows.length} people are tied on both score and time —
                please pick one
                {live.isAuto && ' (auto mode will not choose for you)'}:
              </p>
              <div className="flex flex-wrap gap-2">
                {live.topRows.map((row) => (
                  <Button
                    key={row.playerId}
                    variant="primary"
                    onClick={() => live.announceWinner(row.playerId)}
                  >
                    <Trophy className="size-4" aria-hidden="true" />
                    {row.name}
                  </Button>
                ))}
              </div>
            </Panel>
          ) : (
            <ActionBar>
              <Button
                variant="primary"
                className="px-6 py-3 text-lg"
                disabled={live.leaderboardRows.length === 0}
                onClick={() =>
                  live.announceWinner(live.leaderboardRows[0].playerId)
                }
              >
                <Trophy className="size-5" aria-hidden="true" />
                Announce the winner
                {live.leaderboardRows.length > 0 &&
                  `: ${live.leaderboardRows[0].name}`}
              </Button>
              {live.isAuto && live.leaderboardRows.length > 0 && (
                <span className="text-sm opacity-70">
                  Auto is on — the winner is announced in {live.autoSecondsLeft}
                  s. Press to go now.
                </span>
              )}
            </ActionBar>
          )}
        </>
      )}

      {live.state === SESSION_STATES.PRIZE && (
        <Panel title="Prize giving" Icon={Gift}>
          <p className="text-base">
            Waiting for{' '}
            <span className="text-text-h font-semibold">{live.winnerName}</span>{' '}
            to pick one of the three boxes on their phone.
          </p>
        </Panel>
      )}

      {live.state === SESSION_STATES.PRIZE_REVEALED && (
        <Panel title="Prize awarded" Icon={Gift}>
          <p className="text-base">
            <span className="text-text-h font-semibold">{live.winnerName}</span>{' '}
            got{' '}
            <span className="text-text-h font-semibold">{live.pickedPrize}</span>.
          </p>
          <p className="text-sm opacity-70">End the session to play another round.</p>
        </Panel>
      )}

      <footer className="border-border mt-auto border-t pt-4">
        <Button variant="quiet" onClick={live.reset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          End session
        </Button>
      </footer>
    </AdminShell>
  )
}

function AdminLivePage() {
  const live = useLiveController()

  return (
    <>
      <ConnectionBanner isOffline={live.isOffline} />
      {live.state === SESSION_STATES.IDLE ? (
        <IdlePage live={live} />
      ) : (
        <LiveBody live={live} />
      )}
    </>
  )
}

export default AdminLivePage
