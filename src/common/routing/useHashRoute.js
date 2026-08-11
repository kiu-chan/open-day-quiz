/**
 * Minimal router built on `location.hash`.
 *
 * Hash instead of real paths because the QR code points straight at the player
 * page: with a hash every URL is `index.html`, no SPA fallback to configure on
 * the server, and scanning the QR never lands on a 404.
 *
 * Public API: ROUTES, joinUrl(), homeUrl(), useHashRoute() → { pattern, params },
 * navigate(path).
 */
import { useEffect, useState } from 'react'

/**
 * Every address in the app, and nothing else — no components, so any view may
 * import this to link to another page. Which page each of these draws is
 * [src/routes.jsx](../../routes.jsx); adding a route means a line in both.
 *
 * A `:name` segment is a parameter, and the shell hands it to the page as a prop
 * of that name, so it is worth naming it the way the page wants to read it.
 */
export const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
  ADMIN_QUIZ: '/admin/quiz/:quizId',
  ADMIN_LIVE: '/admin/live',
  ADMIN_HOME: '/admin/home',
  ADMIN_WIFI: '/admin/wifi',
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

/**
 * The address that drops a phone straight into the join form — what the control
 * desk and the big screen print into their QR codes, worked out here rather than
 * a second time in a second controller.
 *
 * Both this and `homeUrl` are built from wherever the page is being served,
 * which is the whole point: on the laptop running the round that is the LAN
 * address a phone can actually reach. Open the page on `localhost` and the code
 * says `localhost`, which no phone can scan its way to — see docs/usage.md.
 */
export function joinUrl() {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#${ROUTES.PLAY}`
}

/**
 * The address of the home page — what the home page's own QR code carries, so a
 * visitor who scans it off the projector gets the page in their hand and walks
 * into the round from there rather than landing in a join form with no idea
 * what they have joined.
 *
 * No `#/` on the end: an empty hash already routes home, and every character
 * left out is one less module in the code, which is what makes it scannable from
 * the back of a hall.
 */
export function homeUrl() {
  const { origin, pathname } = window.location
  return `${origin}${pathname}`
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
