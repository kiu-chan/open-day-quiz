import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  ListChecks,
  LoaderCircle,
  PencilLine,
  Plus,
  Save,
  Timer,
  TriangleAlert,
} from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import {
  MAX_DURATION_SECONDS,
  MIN_DURATION_SECONDS,
} from '@common/session/models/Question.js'
import { useQuizEditorController } from '../controllers/useQuizEditorController.js'
import Button from '@common/views/Button.jsx'
import AdminShell from './components/AdminShell.jsx'
import Panel from './components/Panel.jsx'
import QuestionEditor from './components/QuestionEditor.jsx'
import SaveDialog from './components/SaveDialog.jsx'

/**
 * Whether what is on screen is what the server holds. Nothing is written until
 * the Save button is pressed, so this badge is the only thing telling an admin
 * their work is still only in this tab — the icon carries the meaning, the
 * colour never does.
 */
const SAVE_BADGES = {
  unsaved: { Icon: PencilLine, label: 'Unsaved changes', iconClass: '' },
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
  // Anything not safely on the server is marked by a heavier dashed border,
  // not by a colour.
  const border =
    state === 'error' || state === 'unsaved'
      ? 'border-accent-border border-2 border-dashed'
      : 'border-border'

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
  // Whether the save confirmation is up. Purely local: the controller owns what
  // saving *is*, this only owns whether the dialog is on screen.
  const [isConfirming, setIsConfirming] = useState(false)

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
      subtitle="Changes stay in this tab until you save them"
      actions={
        <>
          <SaveBadge state={editor.saveState} />
          <Button
            variant="primary"
            disabled={!editor.hasUnsavedChanges}
            onClick={() => setIsConfirming(true)}
          >
            <Save className="size-4" aria-hidden="true" />
            Save
          </Button>
        </>
      }
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

        {/* One countdown for the whole set. It stays empty while the questions
            disagree, so it never claims a value only some of them have — typing
            in it is what makes them agree. */}
        <label
          className="flex flex-wrap items-center gap-2 text-sm"
          htmlFor="quiz-duration"
        >
          Countdown for every question
          <input
            id="quiz-duration"
            type="number"
            value={quiz.uniformDurationSeconds ?? ''}
            min={MIN_DURATION_SECONDS}
            max={MAX_DURATION_SECONDS}
            placeholder="Mixed"
            disabled={quiz.total === 0}
            onChange={(event) =>
              editor.setDurationForAll(Number(event.target.value))
            }
            className="border-border focus:border-accent-border text-text-h w-24 rounded-lg border-2 px-3 py-1.5 font-mono text-sm outline-none disabled:opacity-25"
          />
          seconds
          <span className="text-xs opacity-70">
            {quiz.uniformDurationSeconds === null && quiz.total > 0
              ? 'The questions run for different times — type here to give them all the same one.'
              : 'A single question can still be set on its own below.'}
          </span>
        </label>

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

      <footer className="border-border mt-auto flex flex-wrap items-center gap-3 border-t pt-4 text-sm">
        <a
          href={`#${ROUTES.ADMIN}`}
          className="inline-flex items-center gap-2 no-underline"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
          Back to the quiz list
        </a>

        {/* Leaving the page throws the edits away, so say so next to the way out. */}
        {editor.hasUnsavedChanges && (
          <span className="flex items-center gap-1.5 text-xs">
            <TriangleAlert
              className="size-4 shrink-0"
              aria-label="Unsaved changes"
            />
            Unsaved changes — leaving now loses them.
          </span>
        )}
      </footer>

      {isConfirming && (
        <SaveDialog
          quiz={quiz}
          state={editor.saveState}
          onConfirm={editor.save}
          onClose={() => setIsConfirming(false)}
        />
      )}
    </AdminShell>
  )
}

export default AdminQuizEditorPage
