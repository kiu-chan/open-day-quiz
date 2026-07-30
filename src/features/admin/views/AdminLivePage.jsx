import {
  ArrowRight,
  Eye,
  Gift,
  ListChecks,
  MessageCircleQuestion,
  Play,
  RotateCcw,
  Timer,
  Trophy,
  Users,
  X,
} from 'lucide-react'
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
import JoinLinkCard from './components/JoinLinkCard.jsx'
import Panel from './components/Panel.jsx'
import PlayerList from './components/PlayerList.jsx'
import QuestionPreview from './components/QuestionPreview.jsx'
import StateBadge from './components/StateBadge.jsx'
import StatTile from './components/StatTile.jsx'

/**
 * Hàng nút của bước đang chạy. Nút đi tiếp luôn nằm bên trái và to hơn hẳn —
 * MC bấm nó hàng chục lần trong một trận, không nên phải tìm.
 */
function ActionBar({ children }) {
  return (
    <div className="border-border bg-bg sticky bottom-0 -mx-5 flex flex-wrap items-center gap-3 border-t px-5 py-4">
      {children}
    </div>
  )
}

function IdlePage() {
  return (
    <AdminShell current="live" title="Bàn điều khiển">
      <Panel dashed className="items-center py-14 text-center">
        <MessageCircleQuestion
          className="text-text-h size-10"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <p className="text-base">Chưa có phiên nào đang mở.</p>
        <a
          href={`#${ROUTES.ADMIN}`}
          className="inline-flex items-center gap-2 no-underline"
        >
          Chọn một bộ quiz rồi bấm “Mở phiên”
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </a>
      </Panel>
    </AdminShell>
  )
}

function LiveBody({ live }) {
  const isPlaying =
    live.state === SESSION_STATES.QUESTION || live.state === SESSION_STATES.REVEAL

  return (
    <AdminShell
      current="live"
      title={live.quiz.title || 'Bộ quiz chưa có tên'}
      subtitle={
        isPlaying
          ? `Câu ${live.questionNumber} trên tổng ${live.total}`
          : 'Trận đang chạy trên màn hình lớn'
      }
      actions={<StateBadge state={live.state} />}
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
              onClick={live.start}
            >
              <Play className="size-5" aria-hidden="true" />
              Bắt đầu
            </Button>
            <span className="text-sm opacity-70">
              {live.playerCount === 0
                ? 'Chờ ít nhất một người vào phòng.'
                : `${live.playerCount} người đã sẵn sàng.`}
            </span>
            <Button variant="quiet" className="ml-auto" onClick={live.cancel}>
              <X className="size-4" aria-hidden="true" />
              Huỷ phiên
            </Button>
          </ActionBar>
        </>
      )}

      {live.state === SESSION_STATES.QUESTION && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile
              label="Câu hỏi"
              Icon={ListChecks}
              value={`${live.questionNumber}/${live.total}`}
            />
            <StatTile
              label="Đã trả lời"
              Icon={Users}
              value={`${live.answeredCount}/${live.playerCount}`}
              hint={
                live.answeredCount === live.playerCount
                  ? 'Cả phòng đã trả lời — chốt được rồi'
                  : 'Đang chờ thêm người'
              }
            />
            <div className="border-border flex flex-col gap-2 rounded-2xl border-2 p-4">
              <span className="flex items-center gap-1.5 text-xs tracking-wide uppercase">
                <Timer className="size-3.5 shrink-0" aria-hidden="true" />
                Còn lại
              </span>
              <Countdown seconds={live.secondsLeft} className="self-start text-2xl" />
            </div>
          </div>

          <Panel title="Câu đang hỏi" Icon={MessageCircleQuestion}>
            <QuestionPreview question={live.question} />
          </Panel>

          <ActionBar>
            <Button
              variant="primary"
              className="px-6 py-3 text-lg"
              onClick={live.reveal}
            >
              <Eye className="size-5" aria-hidden="true" />
              Hiện đáp án
            </Button>
            <span className="text-sm opacity-70">
              Hết giờ thì máy chủ tự chốt, không cần chờ bấm.
            </span>
          </ActionBar>
        </>
      )}

      {live.state === SESSION_STATES.REVEAL && (
        <>
          <Panel
            title={`Câu ${live.questionNumber} / ${live.total}`}
            Icon={MessageCircleQuestion}
            aside={
              <span className="font-mono text-xs">
                {live.answeredCount}/{live.playerCount} đã trả lời
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
              <ArrowRight className="size-5" aria-hidden="true" />
              {live.isLastQuestion ? 'Xem kết quả' : 'Câu tiếp'}
            </Button>
          </ActionBar>
        </>
      )}

      {live.state === SESSION_STATES.PODIUM && (
        <>
          <Panel
            title="Bảng xếp hạng"
            Icon={Trophy}
            aside={
              <span className="text-xs opacity-70">
                Đang chiếu trên màn hình lớn
              </span>
            }
          >
            <LeaderboardTable rows={live.leaderboardRows} />
          </Panel>

          {live.hasTieAtTop ? (
            <Panel title="Chọn người nhận quà" Icon={Gift} dashed>
              <p className="text-sm">
                Có {live.topRows.length} người bằng nhau cả điểm và thời gian —
                bạn chọn giúp:
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
                Công bố người thắng
                {live.leaderboardRows.length > 0 &&
                  `: ${live.leaderboardRows[0].name}`}
              </Button>
            </ActionBar>
          )}
        </>
      )}

      {live.state === SESSION_STATES.PRIZE && (
        <Panel title="Trao quà" Icon={Gift}>
          <p className="text-base">
            Đang chờ{' '}
            <span className="text-text-h font-semibold">{live.winnerName}</span>{' '}
            chọn một trong ba hộp trên điện thoại.
          </p>
        </Panel>
      )}

      {live.state === SESSION_STATES.PRIZE_REVEALED && (
        <Panel title="Đã trao quà" Icon={Gift}>
          <p className="text-base">
            <span className="text-text-h font-semibold">{live.winnerName}</span>{' '}
            nhận{' '}
            <span className="text-text-h font-semibold">{live.pickedPrize}</span>.
          </p>
          <p className="text-sm opacity-70">Kết thúc phiên để chơi lượt mới.</p>
        </Panel>
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

function AdminLivePage() {
  const live = useLiveController()

  return (
    <>
      <ConnectionBanner isOffline={live.isOffline} />
      {live.state === SESSION_STATES.IDLE ? <IdlePage /> : <LiveBody live={live} />}
    </>
  )
}

export default AdminLivePage
