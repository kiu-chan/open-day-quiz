import { Check, LoaderCircle, PencilLine, TriangleAlert } from 'lucide-react'

/**
 * Whether what is on screen is what the server holds. Both editors write only
 * when Save is pressed, so this badge is the only thing telling an admin their
 * work is still just in this tab — the icon carries the meaning, never a colour.
 */
const STATES = {
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
  const { Icon, label, iconClass } = STATES[state]
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

export default SaveBadge
