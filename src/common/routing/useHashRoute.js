/**
 * Router tối giản chạy trên `location.hash`.
 *
 * Dùng hash chứ không phải đường dẫn thật vì QR trỏ thẳng vào trang người chơi:
 * với hash thì mọi URL đều là `index.html`, không cần cấu hình SPA fallback ở
 * server, và quét QR không bao giờ ra 404.
 *
 * Public API: ROUTES, useHashRoute() → { pattern, params }, navigate(path).
 */
import { useEffect, useState } from 'react'

export const ROUTES = {
  ADMIN: '/admin',
  ADMIN_QUIZ: '/admin/quiz/:id',
  ADMIN_LIVE: '/admin/live',
  PLAY: '/play',
  DISPLAY: '/display',
}

const PATTERNS = Object.values(ROUTES)

/** Trả về params nếu path khớp pattern, null nếu không khớp. */
function matchPattern(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null

  const params = {}
  for (let i = 0; i < patternParts.length; i += 1) {
    const part = patternParts[i]
    if (part.startsWith(':')) {
      params[part.slice(1)] = decodeURIComponent(pathParts[i])
    } else if (part !== pathParts[i]) {
      return null
    }
  }
  return params
}

function matchRoute(path) {
  for (const pattern of PATTERNS) {
    const params = matchPattern(pattern, path)
    if (params) return { pattern, params }
  }
  return { pattern: ROUTES.ADMIN, params: {} }
}

function currentPath() {
  return window.location.hash.slice(1) || ROUTES.ADMIN
}

export function navigate(path) {
  window.location.hash = `#${path}`
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => matchRoute(currentPath()))

  useEffect(() => {
    const onHashChange = () => setRoute(matchRoute(currentPath()))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}
