import { ArrowRight, Eye, Play, RotateCcw, Trophy, X } from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { SESSION_STATES } from '@common/session/models/SessionModel.js'
import Button from '@common/views/Button.jsx'
import Countdown from '@common/views/Countdown.jsx'
import LeaderboardTable from '@common/views/LeaderboardTable.jsx'
import ProgressBar from '@common/views/ProgressBar.jsx'
import { useLiveController } from '../controllers/useLiveController.js'
import AdminShell from './components/AdminShell.jsx'
import AnswerTally from './components/AnswerTally.jsx'
import JoinLinkCard from './components/JoinLinkCard.jsx'
import PlayerList from './components/PlayerList.jsx'
import QuestionPreview from './components/QuestionPreview.jsx'
import StateBadge from './components/StateBadge.jsx'

function AdminLivePage() {
  const live = useLiveController()

  if (live.state === SESSION_STATES.IDLE) {
    return (
      <AdminShell current="live">
        <h1 className="text-text-h text-3xl tracking-tight">Bàn điều khiển</h1>
        <p className="text-sm">
          Chưa có phiên nào. <a href={`#${ROUTES.ADMIN}`}>Chọn một bộ quiz</a> rồi
          bấm “Mở phiên”.
        </p>
      </AdminShell>
    )
  }

  return (
    <AdminShell current="live">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-text-h text-3xl tracking-tight">
          {live.quiz.title || 'Bộ quiz chưa có tên'}
        </h1>
        <StateBadge state={live.state} />
      </div>

      <ProgressBar value={live.progress} />

      {live.state === SESSION_STATES.LOBBY && (
        <>
          <JoinLinkCard url={live.joinUrl} />
          <PlayerList players={live.players} />
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={live.start}>
              <Play className="size-4" aria-hidden="true" />
              Bắt đầu
            </Button>
            <Button variant="quiet" onClick={live.cancel}>
              <X className="size-4" aria-hidden="true" />
              Huỷ phiên
            </Button>
          </div>
        </>
      )}

      {live.state === SESSION_STATES.QUESTION && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-sm tabular-nums">
              Đã trả lời: {live.answeredCount} / {live.playerCount}
            </p>
            <Countdown seconds={live.secondsLeft} className="text-lg" />
          </div>

          <QuestionPreview
            question={live.question}
            questionNumber={live.questionNumber}
            total={live.total}
          />

          <Button variant="primary" className="self-start" onClick={live.reveal}>
            <Eye className="size-4" aria-hidden="true" />
            Hiện đáp án
          </Button>
        </>
      )}

      {live.state === SESSION_STATES.REVEAL && (
        <>
          <p className="font-mono text-sm">
            Câu {live.questionNumber} / {live.total}
          </p>
          <h2 className="text-text-h text-xl leading-snug">
            {live.question.prompt}
          </h2>

          <AnswerTally
            question={live.question}
            distribution={live.distribution}
            playerCount={live.playerCount}
          />

          <Button variant="primary" className="self-start" onClick={live.goNext}>
            <ArrowRight className="size-4" aria-hidden="true" />
            {live.isLastQuestion ? 'Xem kết quả' : 'Câu tiếp'}
          </Button>
        </>
      )}

      {live.state === SESSION_STATES.PODIUM && (
        <>
          <p className="text-sm">
            Hết câu hỏi. Bảng xếp hạng đang chiếu trên màn hình lớn.
          </p>

          <LeaderboardTable rows={live.leaderboardRows} />

          {live.hasTieAtTop ? (
            <section className="flex flex-col gap-3">
              <p className="text-sm">
                Có {live.topRows.length} người bằng nhau cả điểm và thời gian —
                chọn người nhận quà:
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
            </section>
          ) : (
            <Button
              variant="primary"
              className="self-start"
              disabled={live.leaderboardRows.length === 0}
              onClick={() => live.announceWinner(live.leaderboardRows[0].playerId)}
            >
              <Trophy className="size-4" aria-hidden="true" />
              Công bố người thắng
              {live.leaderboardRows.length > 0 &&
                `: ${live.leaderboardRows[0].name}`}
            </Button>
          )}
        </>
      )}

      {live.state === SESSION_STATES.PRIZE && (
        <p className="text-sm">
          Đang chờ <span className="text-text-h font-medium">{live.winnerName}</span>{' '}
          chọn hộp quà.
        </p>
      )}

      {live.state === SESSION_STATES.PRIZE_REVEALED && (
        <p className="text-sm">
          <span className="text-text-h font-medium">{live.winnerName}</span> nhận{' '}
          <span className="text-text-h font-medium">{live.pickedPrize}</span>. Kết
          thúc phiên để chơi lượt mới.
        </p>
      )}

      <footer className="border-border mt-auto border-t pt-4">
        <Button variant="quiet" onClick={live.reset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Kết thúc phiên
        </Button>
      </footer>
    </AdminShell>
  )
}

export default AdminLivePage
