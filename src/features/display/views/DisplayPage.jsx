import { Gift, MonitorOff, Trophy, Users } from 'lucide-react'
import { SESSION_STATES } from '@common/session/models/SessionModel.js'
import Countdown from '@common/views/Countdown.jsx'
import JoinQr from '@common/views/JoinQr.jsx'
import LeaderboardTable from '@common/views/LeaderboardTable.jsx'
import ProgressBar from '@common/views/ProgressBar.jsx'
import { useDisplayController } from '../controllers/useDisplayController.js'
import BigOption from './components/BigOption.jsx'
import DisplayShell from './components/DisplayShell.jsx'
import PrizeShowcase from './components/PrizeShowcase.jsx'

function DisplayPage() {
  const display = useDisplayController()

  if (display.state === SESSION_STATES.IDLE) {
    return (
      <DisplayShell>
        <div className="flex flex-col items-center gap-6 text-center">
          <MonitorOff className="text-text-h size-20" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="text-text-h text-5xl tracking-tight">Chưa mở phiên</h1>
        </div>
      </DisplayShell>
    )
  }

  if (display.state === SESSION_STATES.LOBBY) {
    return (
      <DisplayShell>
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-text-h text-5xl tracking-tight lg:text-6xl">
            Quét QR để vào chơi
          </h1>

          <JoinQr url={display.joinUrl} size={320} />

          <p className="font-mono text-lg break-all lg:text-xl">{display.joinUrl}</p>

          <p className="text-text-h flex items-center gap-3 text-4xl font-medium">
            <Users className="size-9" aria-hidden="true" />
            <span className="tabular-nums">{display.playerCount}</span>
            <span className="text-2xl font-normal">người đã vào</span>
          </p>
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
              Câu {display.questionNumber} / {display.total}
            </p>
            {isRevealed ? (
              <p className="font-mono text-2xl tabular-nums">
                {display.answeredCount} / {display.playerCount} đã trả lời
              </p>
            ) : (
              <Countdown seconds={display.secondsLeft} className="text-4xl" />
            )}
          </>
        }
      >
        <h1
          className={`text-text-h leading-tight tracking-tight ${
            isRevealed ? 'text-3xl lg:text-4xl' : 'text-4xl lg:text-6xl'
          }`}
        >
          {display.question.prompt}
        </h1>

        <ul className="grid gap-4 lg:grid-cols-2">
          {display.question.options.map((option, i) => (
            <BigOption
              key={i}
              label={display.question.labelOf(i)}
              text={option}
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
            <p className="font-mono text-2xl">Kết quả</p>
            <p className="font-mono text-2xl tabular-nums">
              {display.playerCount} người chơi
            </p>
          </>
        }
      >
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-text-h flex items-center gap-4 text-5xl tracking-tight lg:text-6xl">
            <Trophy className="size-12" strokeWidth={1.5} aria-hidden="true" />
            Bảng xếp hạng
          </h1>
          <LeaderboardTable rows={display.topRows} variant="display" />
        </div>
      </DisplayShell>
    )
  }

  // Còn lại: prize và prizeRevealed.
  return (
    <DisplayShell>
      <div className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-text-h flex items-center gap-4 text-5xl tracking-tight lg:text-6xl">
          <Gift className="size-12" strokeWidth={1.5} aria-hidden="true" />
          {display.prizeBoxes?.isPicked ? 'Phần quà' : 'Chọn một hộp quà'}
        </h1>
        <p className="text-3xl">
          Người thắng:{' '}
          <span className="text-text-h font-medium">{display.winnerName}</span>
        </p>

        {display.prizeBoxes && <PrizeShowcase boxes={display.prizeBoxes} />}
      </div>
    </DisplayShell>
  )
}

export default DisplayPage
