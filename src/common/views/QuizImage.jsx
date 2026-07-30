import { useState } from 'react'
import { ImageOff } from 'lucide-react'

/**
 * The image of a question or of one option, shared by all three screens.
 *
 * It has its own error branch because images live on the server rather than
 * inside the quiz: deleting `server/uploads/` or carrying the quiz to another
 * machine makes them 404. When that happens it has to say "image failed to load"
 * instead of leaving a broken box nobody can interpret.
 *
 * `object-contain` rather than `cover`: question images often contain text and
 * diagrams, and cropping the edges crops away the information.
 */
function QuizImage({ src, alt = '', className = '' }) {
  const [hasFailed, setHasFailed] = useState(false)

  if (!src) return null

  if (hasFailed) {
    return (
      <span
        className={`border-border text-text flex items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-sm ${className}`}
      >
        <ImageOff className="size-4 shrink-0" aria-hidden="true" />
        Image failed to load
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasFailed(true)}
      className={`border-border rounded-xl border bg-white object-contain ${className}`}
    />
  )
}

export default QuizImage
