import { useState } from 'react'
import { ImageOff } from 'lucide-react'

/**
 * Ảnh của câu hỏi hoặc của một đáp án, dùng chung cho cả ba màn.
 *
 * Có nhánh lỗi riêng vì ảnh nằm trên máy chủ chứ không nằm trong bộ quiz: xoá
 * `server/uploads/` hoặc bê bộ quiz sang máy khác là ảnh 404. Khi đó phải nói
 * rõ "ảnh không tải được" thay vì để lại một ô vỡ không ai hiểu.
 *
 * `object-contain` chứ không `cover`: ảnh câu hỏi hay có chữ và sơ đồ, cắt mất
 * mép là mất luôn thông tin.
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
        Ảnh không tải được
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
