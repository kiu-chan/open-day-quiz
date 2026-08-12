import { TriangleAlert } from 'lucide-react'

/**
 * What is hard to reach in a block, or on the whole site. Drawn as a grey card
 * with a thick left rule and a warning icon: it has to read as a warning without
 * the amber every other site would use for it.
 */
function AccessNotice({ title, children }) {
  return (
    <div className="bg-code-bg border-accent-border flex items-start gap-3 rounded-lg border-l-4 px-4 py-3">
      <TriangleAlert
        className="text-text-h mt-0.5 size-5 shrink-0"
        strokeWidth={2}
        aria-label="Access warning"
      />
      <p className="text-sm sm:text-base">
        {title && <strong className="text-text-h font-semibold">{title} </strong>}
        {children}
      </p>
    </div>
  )
}

export default AccessNotice
