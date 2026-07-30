import { useState } from 'react'
import {
  Check,
  Copy,
  FileQuestion,
  ListChecks,
  Play,
  Plus,
  Radio,
  SquarePen,
  Timer,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import Button from '@common/views/Button.jsx'
import { useQuizListController } from '../controllers/useQuizListController.js'
import AdminShell from './components/AdminShell.jsx'
import Panel from './components/Panel.jsx'

/** A small info chip on a quiz card: icon + text, thin border. */
function Meta({ Icon, children }) {
  return (
    <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </span>
  )
}

function AdminQuizListPage() {
  const {
    quizzes,
    isLive,
    openSession,
    editQuiz,
    createQuiz,
    duplicateQuiz,
    removeQuiz,
  } = useQuizListController()

  // Deleting cannot be undone, so it takes two clicks.
  const [confirmingId, setConfirmingId] = useState(null)

  return (
    <AdminShell
      current="list"
      title="Quizzes"
      subtitle={`${quizzes.length} question set(s) saved on this machine`}
      actions={
        <Button variant="primary" onClick={createQuiz}>
          <Plus className="size-4" aria-hidden="true" />
          New quiz
        </Button>
      }
    >
      {isLive && (
        <p className="border-accent-border text-text-h flex flex-wrap items-center gap-2 rounded-2xl border-2 px-5 py-4 text-sm">
          <Radio className="size-4 shrink-0 animate-pulse" aria-hidden="true" />
          <span className="font-medium">A session is currently running.</span>
          <a href={`#${ROUTES.ADMIN_LIVE}`}>Back to the control desk</a>
          <span className="opacity-70">— opening a new session cancels this one.</span>
        </p>
      )}

      {quizzes.length === 0 ? (
        <Panel dashed className="items-center py-14 text-center">
          <FileQuestion
            className="text-text-h size-10"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-base">No quizzes yet.</p>
          <Button variant="primary" onClick={createQuiz}>
            <Plus className="size-4" aria-hidden="true" />
            Create the first quiz
          </Button>
        </Panel>
      ) : (
        <ul className="grid list-none gap-5 p-0 lg:grid-cols-2">
          {quizzes.map((quiz, index) => (
            <li
              key={quiz.id}
              style={{ animationDelay: `${index * 60}ms` }}
              className="animate-rise border-border bg-bg hover:border-accent-border hover:shadow-card flex flex-col gap-4 rounded-2xl border-2 p-5 transition duration-300"
            >
              <div className="flex flex-col gap-3">
                <h2 className="text-text-h text-2xl leading-snug font-semibold">
                  {quiz.title || 'Untitled quiz'}
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  <Meta Icon={ListChecks}>{quiz.total} questions</Meta>
                  <Meta Icon={Timer}>{quiz.totalSeconds}s</Meta>
                  {quiz.isPlayable && (
                    <span className="border-accent-border text-text-h inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-xs font-medium">
                      <Check
                        className="size-3.5 shrink-0"
                        strokeWidth={2.5}
                        aria-label="Ready to play"
                      />
                      Ready
                    </span>
                  )}
                </div>
              </div>

              {!quiz.isPlayable && (
                <ul className="border-border flex list-none flex-col gap-1.5 rounded-xl border border-dashed p-3 text-sm">
                  {quiz.errors.map((error) => (
                    <li key={error} className="flex items-center gap-2">
                      <TriangleAlert
                        className="size-4 shrink-0"
                        aria-label="Not playable yet"
                      />
                      {error}
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-border mt-auto flex flex-wrap gap-2 border-t pt-4">
                <Button
                  variant="primary"
                  disabled={!quiz.isPlayable}
                  onClick={() => openSession(quiz)}
                >
                  <Play className="size-4" aria-hidden="true" />
                  Open session
                </Button>

                <Button onClick={() => editQuiz(quiz.id)}>
                  <SquarePen className="size-4" aria-hidden="true" />
                  Edit
                </Button>

                <Button variant="quiet" onClick={() => duplicateQuiz(quiz.id)}>
                  <Copy className="size-4" aria-hidden="true" />
                  Duplicate
                </Button>

                {confirmingId === quiz.id ? (
                  <Button
                    className="border-accent-border ml-auto border-dashed"
                    onClick={() => {
                      removeQuiz(quiz.id)
                      setConfirmingId(null)
                    }}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Really delete?
                  </Button>
                ) : (
                  <Button
                    variant="quiet"
                    className="ml-auto"
                    onClick={() => setConfirmingId(quiz.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete
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
