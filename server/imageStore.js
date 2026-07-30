/**
 * The store for question illustration images.
 *
 * Why images do not sit inside the quiz as data URIs: every session change
 * rebroadcasts a **full snapshot** to every device over SSE. Stuffing a few
 * hundred KB of base64 in there would mean the whole room re-downloads all of it
 * each time one person taps an answer. So the quiz only keeps the path
 * `/api/images/<name>`, and the image bytes travel once, while the admin is
 * writing the question.
 *
 * Images are written to disk (`server/uploads/`) rather than kept in RAM like the
 * session state: quizzes live in the admin machine's localStorage and therefore
 * survive restarts, so the images must survive too — otherwise writing questions
 * one evening and booting the server the next morning leaves every image broken.
 *
 * The filename is the first 32 characters of the sha256 of the content: pasting
 * the same image into ten questions still leaves one file on disk, and since the
 * name is fixed by the content, browsers can cache it forever.
 *
 * Public API: MAX_IMAGE_BYTES, imageStore.save(), imageStore.read()
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = fileURLToPath(new URL('./uploads', import.meta.url))

/** Images are already shrunk on the admin side before sending; 2MB is the junk cutoff. */
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
 * Accept only the exact filename shape that `save()` itself produces. This
 * server is open to the whole LAN, so a filename arriving from a URL must never
 * be joined straight into a path.
 */
const NAME_PATTERN = /^[a-f0-9]{32}\.(jpg|png|webp|gif)$/

export const imageStore = {
  /** Returns the filename, or null when the image type is not accepted. */
  async save(body, contentType) {
    const extension = EXTENSION_OF[contentType]
    if (!extension) return null

    const hash = createHash('sha256').update(body).digest('hex').slice(0, 32)
    const name = `${hash}.${extension}`

    await mkdir(DIR, { recursive: true })
    await writeFile(join(DIR, name), body)
    return name
  },

  /** Returns `{ body, type }`, or null when the name is invalid or the file is gone. */
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
