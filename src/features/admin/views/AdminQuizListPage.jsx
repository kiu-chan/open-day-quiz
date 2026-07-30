import { useState } from 'react'
import { Copy, Play, Plus, SquarePen, Trash2, TriangleAlert } from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import Button from '@common/views/Button.jsx'
import { useQuizListController } from '../controllers/useQuizListController.js'
import AdminShell from './components/AdminShell.jsx'

function AdminQuizListPage() {
  const {
    quizzes,
    isLive,
    openSession,
    createQuiz,
    duplicateQuiz,
    removeQuiz,
  } = useQuizListController()

  // Xoá là việc không lấy lại được, nên bắt bấm hai lần.
  const [confirmingId, setConfirmingId] = useState(null)

  return (
    <AdminShell current="list">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-text-h text-3xl tracking-tight">Bộ quiz</h1>
        <Button variant="primary" onClick={createQuiz}>
          <Plus className="size-4" aria-hidden="true" />
          Tạo bộ quiz
        </Button>
      </div>

      {isLive && (
        <p className="border-text-h flex items-center gap-2 rounded-xl border-2 p-4 text-sm">
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          Đang có một phiên chạy.{' '}
          <a href={`#${ROUTES.ADMIN_LIVE}`}>Về bàn điều khiển</a> — mở phiên mới
          sẽ huỷ phiên này.
        </p>
      )}

      {quizzes.length === 0 ? (
        <p className="text-sm opacity-60">
          Chưa có bộ quiz nào. Bấm “Tạo bộ quiz” để bắt đầu.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {quizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="border-border bg-bg shadow-card flex flex-col gap-4 rounded-2xl border p-5"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-text-h text-xl">
                  {quiz.title || 'Bộ quiz chưa có tên'}
                </h2>
                <p className="font-mono text-xs">
                  {quiz.total} câu · {quiz.totalSeconds}s
                </p>
              </div>

              {!quiz.isPlayable && (
                <ul className="flex flex-col gap-1 text-sm">
                  {quiz.errors.map((error) => (
                    <li key={error} className="flex items-center gap-2">
                      <TriangleAlert
                        className="size-4 shrink-0"
                        aria-label="Chưa chơi được"
                      />
                      {error}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  disabled={!quiz.isPlayable}
                  onClick={() => openSession(quiz)}
                >
                  <Play className="size-4" aria-hidden="true" />
                  Mở phiên
                </Button>

                <Button onClick={() => editQuiz(quiz.id)}>
                  <SquarePen className="size-4" aria-hidden="true" />
                  Sửa
                </Button>

                <Button variant="quiet" onClick={() => duplicateQuiz(quiz.id)}>
                  <Copy className="size-4" aria-hidden="true" />
                  Nhân bản
                </Button>

                {confirmingId === quiz.id ? (
                  <Button
                    className="border-dashed"
                    onClick={() => {
                      removeQuiz(quiz.id)
                      setConfirmingId(null)
                    }}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Xoá thật?
                  </Button>
                ) : (
                  <Button variant="quiet" onClick={() => setConfirmingId(quiz.id)}>
                    <Trash2 className="size-4" aria-hidden="true" />
                    Xoá
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  )
}

export default AdminQuizListPage
