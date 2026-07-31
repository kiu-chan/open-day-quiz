/**
 * Uploads an image from the admin machine to the server and returns the path to
 * put into a question. It is a repository, so it is allowed to touch I/O — that
 * is exactly why it exists.
 *
 * Shrinks before sending: photos taken on a phone are usually 3–5MB with a long
 * edge of 4000px, while the widest place they are ever shown is a ~1200px
 * projector. Sending the original only blows past the server limit and makes
 * visitors' phones download for ages.
 *
 * Public API: imageRepository.upload(file) → url
 */
import { adminAuthRepository } from './AdminAuthRepository.js'

const UPLOAD_URL = '/api/images'

/** Sharp enough for a projector, still light enough to load fast over venue wifi. */
const MAX_EDGE = 1200
const JPEG_QUALITY = 0.82

async function shrink(file) {
  // Redrawing an animated GIF through a canvas would leave only the first frame,
  // so keep the original.
  if (file.type === 'image/gif') return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)

  const context = canvas.getContext('2d')
  // White background before drawing: a PNG with transparent areas converted
  // straight to JPEG turns those areas pitch black. The app background is white
  // too, so it blends in seamlessly.
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
      // Uploading is admin-only, so the token from the password goes along.
      headers: { 'Content-Type': body.type, ...adminAuthRepository.authHeaders() },
      body,
    })

    if (!response.ok) {
      if (response.status === 401) {
        adminAuthRepository.forget()
        throw new Error('the admin session expired — reload the page and sign in again')
      }

      const { error } = await response.json().catch(() => ({}))
      throw new Error(error ?? 'the server did not accept the image')
    }

    const { url } = await response.json()
    return url
  },
}
