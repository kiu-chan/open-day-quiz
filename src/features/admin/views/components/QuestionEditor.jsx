import {
  ChevronDown,
  ChevronUp,
  Copy,
  Minus,
  Plus,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import {
  MAX_DURATION_SECONDS,
  MIN_DURATION_SECONDS,
} from '@common/session/models/Question.js'
import ImagePicker from './ImagePicker.jsx'

const INPUT =
  'border-border focus:border-accent-border text-text-h w-full rounded-lg border-2 px-3 py-2 text-sm outline-none transition'

function IconButton({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="border-border text-text-h hover:border-accent-border inline-flex size-8 items-center justify-center rounded-lg border-2 bg-transparent transition enabled:cursor-pointer disabled:opacity-25"
    >
      {children}
    </button>
  )
}

/**
 * Editor for one question. The correct answer is chosen with a real radio input
 * (`accent-black`) so the keyboard and screen readers still work, rather than a
 * hand-drawn button; the selected row also gets a heavier border so it is
 * obvious at a glance.
 */
function QuestionEditor({
  question,
  number,
  canMoveUp,
  canMoveDown,
  onPrompt,
  onOption,
  onImage,
  onOptionImage,
  onUploadImage,
  onCorrect,
  onDuration,
  onAddOption,
  onRemoveOption,
  onMove,
  onDuplicate,
  onRemove,
}) {
  return (
    <li className="border-border bg-bg hover:border-accent-border flex flex-col gap-4 rounded-2xl border-2 p-5 transition">
      <header className="flex items-center justify-between gap-3">
        <span className="bg-accent flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold text-white">
          {number}
        </span>

        <div className="flex items-center gap-1.5">
          <IconButton
            label="Move up"
            disabled={!canMoveUp}
            onClick={() => onMove(-1)}
          >
            <ChevronUp className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton
            label="Move down"
            disabled={!canMoveDown}
            onClick={() => onMove(1)}
          >
            <ChevronDown className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton label="Duplicate question" onClick={onDuplicate}>
            <Copy className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton label="Delete question" onClick={onRemove}>
            <Trash2 className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
      </header>

      <textarea
        value={question.prompt}
        onChange={(event) => onPrompt(event.target.value)}
        rows={2}
        placeholder="Question text"
        className={`${INPUT} resize-y text-base`}
      />

      <ImagePicker
        value={question.image}
        onChange={onImage}
        onUpload={onUploadImage}
        label="Add an image to the question"
      />

      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 text-xs tracking-wide uppercase">
          Options — select the radio next to the correct one
        </legend>

        {question.options.map((option, i) => {
          const isCorrect = question.correctIndex === i

          return (
            <div
              key={i}
              className={`flex flex-col gap-2 rounded-xl border-2 px-3 py-2 transition ${
                isCorrect ? 'border-accent-border' : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={isCorrect}
                  onChange={() => onCorrect(i)}
                  aria-label={`Option ${question.labelOf(i)} is the correct answer`}
                  className="size-4 shrink-0 cursor-pointer accent-black"
                />
                <span
                  className={`w-4 shrink-0 font-mono text-xs ${
                    isCorrect ? 'text-text-h font-bold' : ''
                  }`}
                >
                  {question.labelOf(i)}
                </span>
                <input
                  value={option}
                  onChange={(event) => onOption(i, event.target.value)}
                  placeholder={`Option ${question.labelOf(i)}`}
                  className={INPUT}
                />
                <IconButton
                  label={`Remove option ${question.labelOf(i)}`}
                  disabled={!question.canRemoveOption}
                  onClick={() => onRemoveOption(i)}
                >
                  <Minus className="size-4" aria-hidden="true" />
                </IconButton>
              </div>

              {/* Indented to line up with the text field of this very option. */}
              <div className="pl-11">
                <ImagePicker
                  compact
                  value={question.imageOf(i)}
                  onChange={(image) => onOptionImage(i, image)}
                  onUpload={onUploadImage}
                  label={`Image for option ${question.labelOf(i)}`}
                />
              </div>
            </div>
          )
        })}
      </fieldset>

      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <label className="flex items-center gap-2 text-sm">
          Time
          <input
            type="number"
            value={question.durationSeconds}
            min={MIN_DURATION_SECONDS}
            max={MAX_DURATION_SECONDS}
            onChange={(event) => onDuration(Number(event.target.value))}
            className="border-border focus:border-accent-border text-text-h w-20 rounded-lg border-2 px-3 py-1.5 font-mono text-sm outline-none"
          />
          seconds
        </label>

        <button
          type="button"
          onClick={onAddOption}
          disabled={!question.canAddOption}
          className="border-border text-text-h hover:border-accent-border inline-flex items-center gap-1.5 rounded-lg border-2 bg-transparent px-3 py-1.5 text-sm transition enabled:cursor-pointer disabled:opacity-25"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add option
        </button>
      </div>

      {!question.isValid && (
        <p className="flex items-center gap-2 text-xs">
          <TriangleAlert
            className="size-4 shrink-0"
            aria-label="Question not usable yet"
          />
          This question is missing content or an answer.
        </p>
      )}
    </li>
  )
}

export default QuestionEditor
