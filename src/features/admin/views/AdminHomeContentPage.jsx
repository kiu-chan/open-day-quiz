import {
  ExternalLink,
  Home,
  LoaderCircle,
  RotateCcw,
  Save,
  TriangleAlert,
} from 'lucide-react'
import {
  DEFAULT_HOME_CONTENT,
  HOME_SECTIONS,
} from '@common/home/models/HomeContent.js'
import { ROUTES } from '@common/routing/useHashRoute.js'
import Button from '@common/views/Button.jsx'
import { useHomeContentController } from '../controllers/useHomeContentController.js'
import AdminShell from './components/AdminShell.jsx'
import Panel from './components/Panel.jsx'
import SaveBadge from './components/SaveBadge.jsx'

const FIELD_CLASS =
  'border-border focus:border-accent-border text-text-h w-full rounded-xl border-2 px-4 py-2.5 text-base outline-none'

/**
 * One editable line of the home page. The default is the placeholder rather than
 * a hint in prose: emptying the box is how the original text comes back, so
 * seeing it greyed out in the empty box is the shortest way to say that.
 */
function Field({ field, value, onChange }) {
  const placeholder = DEFAULT_HOME_CONTENT[field.key]

  return (
    <label className="flex flex-col gap-2 text-sm" htmlFor={`home-${field.key}`}>
      {field.label}
      {field.rows ? (
        <textarea
          id={`home-${field.key}`}
          rows={field.rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${FIELD_CLASS} resize-y leading-relaxed`}
        />
      ) : (
        <input
          id={`home-${field.key}`}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={FIELD_CLASS}
        />
      )}
      {field.hint && <span className="text-xs opacity-70">{field.hint}</span>}
    </label>
  )
}

function AdminHomeContentPage() {
  const editor = useHomeContentController()

  if (editor.loadError) {
    return (
      <AdminShell current="home" title="Cannot reach the server">
        <Panel dashed className="items-start">
          <p className="flex items-center gap-2 text-base">
            <TriangleAlert className="size-5 shrink-0" aria-label="Error" />
            {editor.loadError}
          </p>
          <p className="text-sm opacity-70">
            The home page text lives on the game server — check that it is
            running, then reload the page.
          </p>
        </Panel>
      </AdminShell>
    )
  }

  if (editor.isLoading) {
    return (
      <AdminShell current="home" title="Home page text">
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

  return (
    <AdminShell
      current="home"
      title="Home page text"
      subtitle="Every word visitors read before they play. Changes stay in this tab until you save them."
      actions={
        <>
          <SaveBadge state={editor.saveState} />
          <Button variant="quiet" onClick={editor.restoreDefaults}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Restore the original text
          </Button>
          <Button
            variant="primary"
            disabled={!editor.hasUnsavedChanges}
            onClick={editor.save}
          >
            <Save className="size-4" aria-hidden="true" />
            Save
          </Button>
        </>
      }
    >
      <p className="border-border flex flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed px-5 py-4 text-sm">
        <Home className="size-4 shrink-0" aria-hidden="true" />
        <span>
          Saving publishes straight away — the next visitor to open the home page
          reads the new text. Empty a box to put its original wording back.
        </span>
        <a
          href={`#${ROUTES.HOME}`}
          target="_blank"
          rel="noreferrer"
          className="text-text-h inline-flex items-center gap-1.5 no-underline"
        >
          Open the home page
          <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
        </a>
      </p>

      {HOME_SECTIONS.map((section) => (
        <Panel key={section.key} title={section.title}>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div
                key={field.key}
                className={field.rows ? 'sm:col-span-2' : undefined}
              >
                <Field
                  field={field}
                  value={editor.content[field.key]}
                  onChange={(value) => editor.setField(field.key, value)}
                />
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </AdminShell>
  )
}

export default AdminHomeContentPage
