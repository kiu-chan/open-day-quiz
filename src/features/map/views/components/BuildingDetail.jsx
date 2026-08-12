import { X } from 'lucide-react'
import AccessNotice from './AccessNotice.jsx'

/** The card that opens over the plan once a block is tapped. */
function BuildingDetail({ building, onClose }) {
  const { letter, name, subtitle, description, notice, Icon } = building

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={name}
        onClick={(event) => event.stopPropagation()}
        className="animate-rise bg-bg border-accent-border shadow-card flex w-full max-w-lg flex-col gap-4 rounded-2xl border-2 p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="border-border text-text-h font-heading flex size-14 shrink-0 items-center justify-center rounded-xl border-2 text-3xl font-bold">
              {letter}
            </span>
            <div className="flex flex-col">
              <h2 className="inline-flex items-center gap-2 text-2xl font-bold">
                <Icon className="size-6 shrink-0" strokeWidth={2} aria-hidden="true" />
                {name}
              </h2>
              <p className="text-base">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="border-border hover:border-accent-border text-text-h shrink-0 cursor-pointer rounded-lg border-2 p-2 transition"
          >
            <X className="size-5 shrink-0" strokeWidth={2.5} aria-label="Close" />
          </button>
        </div>

        <p className="text-base sm:text-lg">{description}</p>

        <AccessNotice>{notice}</AccessNotice>
      </div>
    </div>
  )
}

export default BuildingDetail
