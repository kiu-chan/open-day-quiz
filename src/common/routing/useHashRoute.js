/**
 * Minimal router built on `location.hash`.
 *
 * Hash instead of real paths because the QR code points straight at the player
 * page: with a hash every URL is `index.html`, no SPA fallback to configure on
 * the server, and scanning the QR never lands on a 404.
 *
 * Public API: ROUTES, useHashRoute() → { pattern, params }, navigate(path).
 */
import { useEffect, useState } from 'react'

export const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
  ADMIN_QUIZ: '/admin/quiz/:id',
  ADMIN_LIVE: '/admin/live',
  ADMIN_HOME: '/admin/home',
  PLAY: '/play',
  DISPLAY: '/display',
}

const PATTERNS = Object.values(ROUTES)

/** Returns params when path matches the pattern, null when it does not. */
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
  return { pattern: ROUTES.HOME, params: {} }
}

function currentPath() {
  return window.location.hash.slice(1) || ROUTES.HOME
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
