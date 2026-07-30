import {
  ArrowLeft,
  Check,
  ListChecks,
  Plus,
  Timer,
  TriangleAlert,
} from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { useQuizEditorController } from '../controllers/useQuizEditorController.js'
import AdminShell from './components/AdminShell.jsx'
import Panel from './components/Panel.jsx'
import QuestionEditor from './components/QuestionEditor.jsx'

function AdminQuizEditorPage({ quizId }) {
  const editor = useQuizEditorController(quizId)

  if (editor.notFound) {
    return (
      <AdminShell current="list" title="Không tìm thấy bộ quiz">
        <Panel dashed className="items-start">
          <p className="text-base">
            Bộ quiz <span className="font-mono">{quizId}</span> đã bị xoá.
          </p>
          <a
            href={`#${ROUTES.ADMIN}`}
            className="inline-flex items-center gap-2 no-underline"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            Về danh sách quiz
          </a>
        </Panel>
      </AdminShell>
    )
  }

  const { quiz } = editor

  return (
    <AdminShell
      current="list"
      title="Soạn quiz"
      subtitle="Mọi thay đổi được lưu ngay trên máy này"
      actions={
        <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs">
          <Check className="size-4 shrink-0" aria-hidden="true" />
          Đã lưu
        </span>
      }
    >
      <Panel>
        <label className="flex flex-col gap-2 text-sm" htmlFor="quiz-title">
          Tên bộ quiz
          <input
            id="quiz-title"
            value={quiz.title}
            onChange={(event) => editor.setTitle(event.target.value)}
            placeholder="Ví dụ: Quiz Open Day 2026"
            className="border-border focus:border-accent-border text-text-h rounded-xl border-2 px-4 py-3 text-2xl font-semibold outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs">
            <ListChecks className="size-3.5 shrink-0" aria-hidden="true" />
            {quiz.total} câu
          </span>
          <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs">
            <Timer className="size-3.5 shrink-0" aria-hidden="true" />
            {quiz.totalSeconds}s
          </span>
        </div>

        {editor.errors.length > 0 ? (
          <ul className="border-border flex list-none flex-col gap-1.5 rounded-xl border border-dashed p-3 text-sm">
            {editor.errors.map((error) => (
              <li key={error} className="flex items-center gap-2">
                <TriangleAlert
                  className="size-4 shrink-0"
                  aria-label="Chưa chơi được"
                />
                {error}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-h flex items-center gap-2 text-sm font-medium">
            <Check
              className="size-4 shrink-0"
              strokeWidth={2.5}
              aria-label="Sẵn sàng chơi"
            />
            Bộ quiz này đã chơi được.
          </p>
        )}
      </Panel>

      <ul className="flex list-none flex-col gap-5 p-0">
        {quiz.questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            number={index + 1}
            canMoveUp={index > 0}
            canMoveDown={index < quiz.total - 1}
            onPrompt={(text) => editor.setPrompt(index, text)}
            onOption={(optionIndex, text) =>
              editor.setOption(index, optionIndex, text)
            }
            onCorrect={(optionIndex) => editor.setCorrect(index, optionIndex)}
            onDuration={(seconds) => editor.setDuration(index, seconds)}
            onAddOption={() => editor.addOption(index)}
            onRemoveOption={(optionIndex) =>
              editor.removeOption(index, optionIndex)
            }
            onMove={(delta) => editor.moveQuestion(index, delta)}
            onDuplicate={() => editor.duplicateQuestion(index)}
            onRemove={() => editor.removeQuestion(index)}
          />
        ))}
      </ul>

      {/* Nút thêm câu chiếm trọn chiều ngang, nét đứt: nhìn ra ngay là chỗ nối
          tiếp danh sách chứ không phải một câu hỏi nữa. */}
      <button
        type="button"
        onClick={editor.addQuestion}
        className="border-border text-text-h hover:border-accent-border flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-transparent py-6 text-base font-medium transition hover:opacity-85"
      >
        <Plus className="size-5 shrink-0" aria-hidden="true" />
        Thêm câu hỏi
      </button>

      <footer className="border-border mt-auto border-t pt-4 text-sm">
        <a
          href={`#${ROUTES.ADMIN}`}
          className="inline-flex items-center gap-2 no-underline"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
          Về danh sách quiz
        </a>
      </footer>
    </AdminShell>
  )
}

export default AdminQuizEditorPage
