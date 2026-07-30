/**
 * Đưa một tấm ảnh từ máy admin lên máy chủ, trả về đường dẫn để nhét vào câu
 * hỏi. Là repository nên được phép chạm I/O — đây chính là lý do nó tồn tại.
 *
 * Thu nhỏ trước khi gửi: ảnh chụp bằng điện thoại thường 3–5MB và dài cạnh
 * 4000px, trong khi chỗ hiển thị rộng nhất là máy chiếu ~1200px. Gửi nguyên bản
 * chỉ tổ vượt hạn mức của máy chủ và làm điện thoại khách tải lâu.
 *
 * Public API: imageRepository.upload(file) → url
 */
const UPLOAD_URL = '/api/images'

/** Đủ nét cho máy chiếu, mà vẫn nhẹ để điện thoại tải nhanh qua wifi hội trường. */
const MAX_EDGE = 1200
const JPEG_QUALITY = 0.82

async function shrink(file) {
  // GIF động vẽ lại qua canvas sẽ chỉ còn khung hình đầu, nên giữ nguyên bản.
  if (file.type === 'image/gif') return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)

  const context = canvas.getContext('2d')
  // Nền trắng trước khi vẽ: PNG có vùng trong suốt mà chuyển thẳng sang JPEG
  // thì vùng đó thành đen sì. Nền app cũng trắng nên ghép vào là liền mạch.
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  )
  return blob ?? file
}

export const imageRepository = {
  async upload(file) {
    const body = await shrink(file)

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': body.type },
      body,
    })

    if (!response.ok) {
      const { error } = await response.json().catch(() => ({}))
      throw new Error(error ?? 'máy chủ không nhận được ảnh')
    }

    const { url } = await response.json()
    return url
  },
}
