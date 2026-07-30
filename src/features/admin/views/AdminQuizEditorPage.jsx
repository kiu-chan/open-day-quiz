import { Check, Plus, TriangleAlert } from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import Button from '@common/views/Button.jsx'
import { useQuizEditorController } from '../controllers/useQuizEditorController.js'
import AdminShell from './components/AdminShell.jsx'
import QuestionEditor from './components/QuestionEditor.jsx'

function AdminQuizEditorPage({ quizId }) {
  const editor = useQuizEditorController(quizId)

  if (editor.notFound) {
    return (
      <AdminShell current="list">
        <h1 className="text-text-h text-3xl tracking-tight">
          Không tìm thấy bộ quiz
        </h1>
        <p className="text-sm">
          Bộ quiz <span className="font-mono">{quizId}</span> đã bị xoá.{' '}
          <a href={`#${ROUTES.ADMIN}`}>Về danh sách quiz</a>
        </p>
      </AdminShell>
    )
  }

  const { quiz } = editor

  return (
    <AdminShell current="list">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-text-h text-3xl tracking-tight">Soạn quiz</h1>
        <span className="flex items-center gap-1.5 text-xs opacity-70">
          <Check className="size-4" aria-hidden="true" />
          Mọi thay đổi tự lưu
        </span>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        Tên bộ quiz
        <input
          value={quiz.title}
          onChange={(event) => editor.setTitle(event.target.value)}
          placeholder="Ví dụ: Quiz Open Day 2026"
          className="border-border focus:border-accent-border text-text-h rounded-xl border-2 px-4 py-2.5 text-lg outline-none"
        />
      </label>

      {editor.errors.length > 0 && (
        <ul className="border-border flex flex-col gap-1 rounded-xl border border-dashed p-4 text-sm">
          {editor.errors.map((error) => (
            <li key={error} className="flex items-center gap-2">
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              {error}
            </li>
          ))}
        </ul>
      )}

      <ul className="flex flex-col gap-4">
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

      <Button variant="primary" className="self-start" onClick={editor.addQuestion}>
        <Plus className="size-4" aria-hidden="true" />
        Thêm câu hỏi
      </Button>

      <footer className="border-border mt-auto border-t pt-4 text-sm">
        <a href={`#${ROUTES.ADMIN}`}>Về danh sách quiz</a>
      </footer>
    </AdminShell>
  )
}

export default AdminQuizEditorPage
