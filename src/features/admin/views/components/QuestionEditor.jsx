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

const INPUT =
  'border-border focus:border-accent-border text-text-h w-full rounded-lg border px-3 py-2 text-sm outline-none'

function IconButton({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="border-border text-text-h hover:border-accent-border inline-flex size-8 items-center justify-center rounded-lg border bg-transparent transition enabled:cursor-pointer disabled:opacity-25"
    >
      {children}
    </button>
  )
}

/**
 * Soạn một câu hỏi. Đáp án đúng chọn bằng radio thật (`accent-black`) để bàn
 * phím và trình đọc màn hình vẫn dùng được, không phải nút tự vẽ.
 */
function QuestionEditor({
  question,
  number,
  canMoveUp,
  canMoveDown,
  onPrompt,
  onOption,
  onCorrect,
  onDuration,
  onAddOption,
  onRemoveOption,
  onMove,
  onDuplicate,
  onRemove,
}) {
  return (
    <li className="border-border bg-bg flex flex-col gap-4 rounded-2xl border p-5">
      <header className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs">Câu {number}</span>

        <div className="flex items-center gap-1.5">
          <IconButton label="Đưa lên trên" disabled={!canMoveUp} onClick={() => onMove(-1)}>
            <ChevronUp className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton
            label="Đưa xuống dưới"
            disabled={!canMoveDown}
            onClick={() => onMove(1)}
          >
            <ChevronDown className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton label="Nhân bản câu hỏi" onClick={onDuplicate}>
            <Copy className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton label="Xoá câu hỏi" onClick={onRemove}>
            <Trash2 className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
      </header>

      <textarea
        value={question.prompt}
        onChange={(event) => onPrompt(event.target.value)}
        rows={2}
        placeholder="Nội dung câu hỏi"
        className={`${INPUT} resize-y`}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-xs opacity-70">
          Đáp án — chọn ô tròn ở đáp án đúng
        </legend>

        {question.options.map((option, i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              type="radio"
              name={`correct-${question.id}`}
              checked={question.correctIndex === i}
              onChange={() => onCorrect(i)}
              aria-label={`Đáp án ${question.labelOf(i)} là đáp án đúng`}
              className="size-4 shrink-0 accent-black"
            />
            <span className="font-mono w-4 shrink-0 text-xs">
              {question.labelOf(i)}
            </span>
            <input
              value={option}
              onChange={(event) => onOption(i, event.target.value)}
              placeholder={`Đáp án ${question.labelOf(i)}`}
              className={INPUT}
            />
            <IconButton
              label={`Bỏ đáp án ${question.labelOf(i)}`}
              disabled={!question.canRemoveOption}
              onClick={() => onRemoveOption(i)}
            >
              <Minus className="size-4" aria-hidden="true" />
            </IconButton>
          </div>
        ))}
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          Thời gian
          <input
            type="number"
            value={question.durationSeconds}
            min={MIN_DURATION_SECONDS}
            max={MAX_DURATION_SECONDS}
            onChange={(event) => onDuration(Number(event.target.value))}
            className="border-border focus:border-accent-border text-text-h font-mono w-20 rounded-lg border px-3 py-1.5 text-sm outline-none"
          />
          giây
        </label>

        <button
          type="button"
          onClick={onAddOption}
          disabled={!question.canAddOption}
          className="border-border text-text-h hover:border-accent-border inline-flex items-center gap-1.5 rounded-lg border bg-transparent px-3 py-1.5 text-sm transition enabled:cursor-pointer disabled:opacity-25"
        >
          <Plus className="size-4" aria-hidden="true" />
          Thêm đáp án
        </button>
      </div>

      {!question.isValid && (
        <p className="flex items-center gap-2 text-xs">
          <TriangleAlert
            className="size-4 shrink-0"
            aria-label="Câu hỏi chưa dùng được"
          />
          Câu này còn thiếu nội dung hoặc đáp án.
        </p>
      )}
    </li>
  )
}

export default QuestionEditor
