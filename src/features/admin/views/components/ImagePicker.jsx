import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, Trash2, TriangleAlert } from 'lucide-react'
import QuizImage from '@common/views/QuizImage.jsx'

/**
 * Ô chọn ảnh cho câu hỏi hoặc cho một đáp án.
 *
 * Nhận `onUpload` từ page chứ không tự gọi repository — view không được chạm
 * I/O. Còn "đang tải" và "tải lỗi" là trạng thái UI của riêng ô này (hai ô cạnh
 * nhau tải hai ảnh cùng lúc vẫn phải độc lập), nên giữ tại chỗ bằng useState.
 *
 * `compact` là bản thu nhỏ dùng cho từng dòng đáp án.
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
      // Xoá giá trị input để chọn lại đúng file vừa rồi vẫn kích hoạt onChange.
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
            ? 'Đang tải…'
            : value
              ? 'Đổi ảnh'
              : compact
                ? 'Thêm ảnh'
                : label}
        </button>

        {value && !isUploading && (
          <button
            type="button"
            className={button}
            onClick={() => onChange(null)}
            aria-label="Bỏ ảnh"
            title="Bỏ ảnh"
          >
            <Trash2 className="size-3.5 shrink-0" aria-hidden="true" />
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs">
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
          Không tải được ảnh: {error}
        </p>
      )}
    </div>
  )
}

export default ImagePicker
