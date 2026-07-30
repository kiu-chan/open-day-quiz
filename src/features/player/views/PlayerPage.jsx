import { Check, Gift, Hourglass, MonitorOff, Trophy, Users, X } from 'lucide-react'
import { SESSION_STATES } from '@common/session/models/SessionModel.js'
import ConnectionBanner from '@common/views/ConnectionBanner.jsx'
import Countdown from '@common/views/Countdown.jsx'
import LeaderboardTable from '@common/views/LeaderboardTable.jsx'
import ProgressBar from '@common/views/ProgressBar.jsx'
import { usePlayerController } from '../controllers/usePlayerController.js'
import AnswerOption from './components/AnswerOption.jsx'
import JoinForm from './components/JoinForm.jsx'
import PlayerShell from './components/PlayerShell.jsx'
import PrizeBoxPicker from './components/PrizeBoxPicker.jsx'
import StatusScreen from './components/StatusScreen.jsx'

/** Nhãn đúng/sai/không kịp — icon đi kèm chữ, không chỉ dựa vào chữ. */
function Verdict({ isCorrect }) {
  if (isCorrect === null) {
    return (
      <p className="text-text-h flex items-center gap-2 text-lg font-medium">
        <Hourglass className="size-5" aria-hidden="true" />
        Bạn không trả lời kịp
      </p>
    )
  }
  return (
    <p className="text-text-h flex items-center gap-2 text-lg font-medium">
      {isCorrect ? (
        <Check className="size-5" strokeWidth={2.5} aria-label="Đúng" />
      ) : (
        <X className="size-5" strokeWidth={2.5} aria-label="Sai" />
      )}
      {isCorrect ? 'Đúng rồi' : 'Chưa đúng'}
    </p>
  )
}

function PlayerBody({ player }) {
  if (player.sessionState === SESSION_STATES.IDLE) {
    return (
      <PlayerShell name="">
        <StatusScreen
          icon={MonitorOff}
          title="Chưa có trận nào"
          note="Chờ ban tổ chức mở phiên rồi tải lại trang."
        />
      </PlayerShell>
    )
  }

  if (!player.hasJoined) {
    return (
      <PlayerShell name="">
        <h1 className="text-text-h text-2xl tracking-tight">Tham gia</h1>
        <JoinForm defaultName={player.name} onJoin={player.join} />
      </PlayerShell>
    )
  }

  if (player.sessionState === SESSION_STATES.LOBBY) {
    return (
      <PlayerShell name={player.name}>
        <StatusScreen
          icon={Users}
          title="Đã vào, chờ bắt đầu"
          note={`${player.playerCount} người đang chờ`}
        />
      </PlayerShell>
    )
  }

  if (player.sessionState === SESSION_STATES.QUESTION) {
    return (
      <PlayerShell name={player.name}>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs">
            Câu {player.questionNumber} / {player.total}
          </p>
          <Countdown seconds={player.secondsLeft} className="text-sm" />
        </div>
        <ProgressBar value={player.progress} />

        <h2 className="text-text-h text-xl leading-snug">
          {player.question.prompt}
        </h2>

        <ul className="flex flex-col gap-3">
          {player.question.options.map((option, i) => (
            <li key={i}>
              <AnswerOption
                label={player.question.labelOf(i)}
                text={option}
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
          <p className="text-center text-sm opacity-70">
            Đã gửi. Chờ mọi người trả lời xong.
          </p>
        )}
      </PlayerShell>
    )
  }

  if (player.sessionState === SESSION_STATES.REVEAL) {
    return (
      <PlayerShell name={player.name}>
        <p className="font-mono text-xs">
          Câu {player.questionNumber} / {player.total}
        </p>
        <Verdict isCorrect={player.isCorrect} />

        {player.myRow && (
          <p className="font-mono text-sm tabular-nums">
            +{player.pointsThisQuestion} điểm · tổng {player.myRow.score}
          </p>
        )}

        <h2 className="text-text-h text-lg leading-snug">
          {player.question.prompt}
        </h2>

        <ul className="flex flex-col gap-3">
          {player.question.options.map((option, i) => (
            <li key={i}>
              <AnswerOption
                label={player.question.labelOf(i)}
                text={option}
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
      <PlayerShell name={player.name}>
        <section className="flex flex-col items-center gap-2 py-4 text-center">
          <Trophy className="text-text-h size-10" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-sm opacity-70">Hạng của bạn</p>
          <p className="text-text-h font-mono text-5xl tabular-nums">
            {player.myRow?.rank ?? '—'}
          </p>
          <p className="text-sm">
            {player.myRow?.score ?? 0} điểm · đúng {player.myRow?.correctCount ?? 0}/
            {player.total} câu
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

  // Còn lại: prize và prizeRevealed — người thắng chọn hộp, người khác ngồi xem.
  if (player.isWinner && player.prizeBoxes) {
    return (
      <PlayerShell name={player.name}>
        <section className="flex flex-col items-center gap-2 text-center">
          <Trophy className="text-text-h size-10" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="text-text-h text-2xl">Bạn thắng!</h2>
          <p className="text-sm opacity-70">
            {player.prizeBoxes.isPicked
              ? 'Phần quà của bạn'
              : 'Chọn một trong ba hộp quà'}
          </p>
        </section>

        <PrizeBoxPicker boxes={player.prizeBoxes} onPick={player.pickBox} />
      </PlayerShell>
    )
  }

  return (
    <PlayerShell name={player.name}>
      <StatusScreen
        icon={Gift}
        title={
          player.prizeBoxes?.isPicked
            ? `${player.winnerName} nhận ${player.prizeBoxes.pickedPrize}`
            : `${player.winnerName} đang chọn quà`
        }
        note="Xem trên màn hình lớn."
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
