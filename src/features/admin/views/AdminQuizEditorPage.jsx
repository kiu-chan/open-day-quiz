import {
  ArrowLeft,
  Check,
  ListChecks,
  LoaderCircle,
  Plus,
  Timer,
  TriangleAlert,
} from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { useQuizEditorController } from '../controllers/useQuizEditorController.js'
import AdminShell from './components/AdminShell.jsx'
import Panel from './components/Panel.jsx'
import QuestionEditor from './components/QuestionEditor.jsx'

/**
 * Whether the last change reached the server. Saving is a network round trip
 * now, so this has to be shown rather than assumed — the icon carries the
 * meaning, the colour never does.
 */
const SAVE_BADGES = {
  saving: { Icon: LoaderCircle, label: 'Saving…', iconClass: 'animate-spin' },
  saved: { Icon: Check, label: 'Saved', iconClass: '' },
  error: {
    Icon: TriangleAlert,
    label: 'Not saved — the server did not answer',
    iconClass: '',
  },
}

function SaveBadge({ state }) {
  const { Icon, label, iconClass } = SAVE_BADGES[state]
  // A failed save is marked by a heavier dashed border, not by a colour.
  const border =
    state === 'error' ? 'border-accent-border border-2 border-dashed' : 'border-border'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${border}`}
    >
      <Icon className={`size-4 shrink-0 ${iconClass}`} aria-label={label} />
      {label}
    </span>
  )
}

function AdminQuizEditorPage({ quizId }) {
  const editor = useQuizEditorController(quizId)

  if (editor.loadError) {
    return (
      <AdminShell current="list" title="Cannot reach the server">
        <Panel dashed className="items-start">
          <p className="flex items-center gap-2 text-base">
            <TriangleAlert className="size-5 shrink-0" aria-label="Error" />
            {editor.loadError}
          </p>
          <p className="text-sm opacity-70">
            The quizzes live on the game server — check that it is running, then
            reload the page.
          </p>
          <a
            href={`#${ROUTES.ADMIN}`}
            className="inline-flex items-center gap-2 no-underline"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            Back to the quiz list
          </a>
        </Panel>
      </AdminShell>
    )
  }

  if (editor.isLoading) {
    return (
      <AdminShell current="list" title="Edit quiz">
        <Panel dashed className="items-center py-14 text-center">
          <LoaderCircle
            className="text-text-h size-10 animate-spin"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-base">Loading…</p>
        </Panel>
      </AdminShell>
    )
  }

  if (editor.notFound) {
    return (
      <AdminShell current="list" title="Quiz not found">
        <Panel dashed className="items-start">
          <p className="text-base">
            Quiz <span className="font-mono">{quizId}</span> has been deleted.
          </p>
          <a
            href={`#${ROUTES.ADMIN}`}
            className="inline-flex items-center gap-2 no-underline"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            Back to the quiz list
          </a>
        </Panel>
      </AdminShell>
    )
  }

  const { quiz } = editor

  return (
    <AdminShell
      current="list"
      title="Edit quiz"
      subtitle="Every change is saved on the server right away"
      actions={<SaveBadge state={editor.saveState} />}
    >
      <Panel>
        <label className="flex flex-col gap-2 text-sm" htmlFor="quiz-title">
          Quiz title
          <input
            id="quiz-title"
            value={quiz.title}
            onChange={(event) => editor.setTitle(event.target.value)}
            placeholder="For example: Open Day Quiz 2026"
            className="border-border focus:border-accent-border text-text-h rounded-xl border-2 px-4 py-3 text-2xl font-semibold outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs">
            <ListChecks className="size-3.5 shrink-0" aria-hidden="true" />
            {quiz.total} questions
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
                  aria-label="Not playable yet"
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
              aria-label="Ready to play"
            />
            This quiz is ready to play.
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
            onImage={(image) => editor.setImage(index, image)}
            onOptionImage={(optionIndex, image) =>
              editor.setOptionImage(index, optionIndex, image)
            }
            onUploadImage={editor.uploadImage}
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

      {/* The add-question button spans the full width and uses a dashed border:
          it reads immediately as the continuation of the list rather than as one
          more question. */}
      <button
        type="button"
        onClick={editor.addQuestion}
        className="border-border text-text-h hover:border-accent-border flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-transparent py-6 text-base font-medium transition hover:opacity-85"
      >
        <Plus className="size-5 shrink-0" aria-hidden="true" />
        Add question
      </button>

      <footer className="border-border mt-auto border-t pt-4 text-sm">
        <a
          href={`#${ROUTES.ADMIN}`}
          className="inline-flex items-center gap-2 no-underline"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
          Back to the quiz list
        </a>
      </footer>
    </AdminShell>
  )
}

export default AdminQuizEditorPage
