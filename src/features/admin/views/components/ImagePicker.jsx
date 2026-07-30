import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, Trash2, TriangleAlert } from 'lucide-react'
import QuizImage from '@common/views/QuizImage.jsx'

/**
 * The image slot for a question or for one option.
 *
 * It receives `onUpload` from the page instead of calling the repository itself
 * — views must not touch I/O. "Uploading" and "upload failed", on the other
 * hand, are UI state belonging to this one slot (two adjacent slots uploading at
 * the same time must stay independent), so they are kept locally with useState.
 *
 * `compact` is the shrunk-down variant used on each option row.
 */
function ImagePicker({ value, onChange, onUpload, label, compact = false }) {
  const inputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  const pick = async (file) => {
    if (!file) return

    setIsUploading(true)
    setError(null)
    try {
      onChange(await onUpload(file))
    } catch (failure) {
      setError(failure.message)
    } finally {
      setIsUploading(false)
      // Clear the input value so picking the very same file again still fires
      // onChange.
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const button =
    'border-border text-text-h hover:border-accent-border inline-flex items-center gap-1.5 rounded-lg border-2 border-dashed bg-transparent px-3 py-1.5 text-xs transition enabled:cursor-pointer disabled:opacity-40'

  return (
    <div className={`flex flex-col gap-2 ${compact ? '' : 'items-start'}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
        onChange={(event) => pick(event.target.files?.[0])}
      />

      {value && (
        <QuizImage
          src={value}
          alt={label}
          className={compact ? 'size-16' : 'max-h-48 w-auto'}
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={button}
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <LoaderCircle
              className="size-3.5 shrink-0 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <ImagePlus className="size-3.5 shrink-0" aria-hidden="true" />
          )}
          {isUploading
            ? 'Uploading…'
            : value
              ? 'Replace image'
              : compact
                ? 'Add image'
                : label}
        </button>

        {value && !isUploading && (
          <button
            type="button"
            className={button}
            onClick={() => onChange(null)}
            aria-label="Remove image"
            title="Remove image"
          >
            <Trash2 className="size-3.5 shrink-0" aria-hidden="true" />
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs">
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
          Could not upload the image: {error}
        </p>
      )}
    </div>
  )
}

export default ImagePicker
