/**
 * Kho ảnh minh hoạ của câu hỏi.
 *
 * Vì sao ảnh không nằm thẳng trong bộ quiz dưới dạng data URI: mỗi thay đổi của
 * phiên đều phát lại **ảnh chụp đầy đủ** cho mọi máy qua SSE. Nhét vài trăm KB
 * base64 vào đó thì mỗi lần một người bấm đáp án là cả phòng tải lại toàn bộ số
 * ảnh ấy. Nên quiz chỉ giữ đường dẫn `/api/images/<tên>`, còn byte ảnh đi một
 * lần lúc admin soạn câu hỏi.
 *
 * Ảnh ghi ra đĩa (`server/uploads/`) chứ không giữ trong RAM như trạng thái
 * phiên: bộ quiz nằm trong localStorage của máy admin nên sống qua lần khởi động
 * lại: ảnh cũng phải sống theo, không thì soạn câu hỏi tối hôm trước, sáng hôm
 * sau bật máy chủ lên là ảnh vỡ hết.
 *
 * Tên file là 32 ký tự đầu của sha256 nội dung: dán cùng một ảnh vào mười câu
 * thì trên đĩa vẫn chỉ có một file, và tên đã cố định theo nội dung nên trình
 * duyệt cache vĩnh viễn được.
 *
 * Public API: MAX_IMAGE_BYTES, imageStore.save(), imageStore.read()
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = fileURLToPath(new URL('./uploads', import.meta.url))

/** Ảnh đã được thu nhỏ ở phía admin trước khi gửi; 2MB là mức chặn rác. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const EXTENSION_OF = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const TYPE_OF = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

/**
 * Chỉ chấp nhận đúng hình dạng tên do chính `save()` sinh ra. Máy chủ này mở ra
 * cả LAN nên tên file đến từ URL không bao giờ được ghép thẳng vào đường dẫn.
 */
const NAME_PATTERN = /^[a-f0-9]{32}\.(jpg|png|webp|gif)$/

export const imageStore = {
  /** Trả về tên file, hoặc null nếu kiểu ảnh không nhận. */
  async save(body, contentType) {
    const extension = EXTENSION_OF[contentType]
    if (!extension) return null

    const hash = createHash('sha256').update(body).digest('hex').slice(0, 32)
    const name = `${hash}.${extension}`

    await mkdir(DIR, { recursive: true })
    await writeFile(join(DIR, name), body)
    return name
  },

  /** Trả về `{ body, type }`, hoặc null nếu tên sai hoặc file không còn. */
  async read(name) {
    if (!NAME_PATTERN.test(name)) return null

    try {
      const body = await readFile(join(DIR, name))
      return { body, type: TYPE_OF[name.split('.')[1]] }
    } catch {
      return null
    }
  },
}
