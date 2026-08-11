import { ROUTES, useHashRoute } from '@common/routing/useHashRoute.js'
import AdminGate from '@features/admin/views/AdminGate.jsx'
import { ROUTE_PAGES } from './routes.jsx'

/**
 * App shell: matches the hash against the route table in
 * [routes.jsx](routes.jsx) and draws the one page it names. Adding a page is a
 * line in that table — there is nothing to change here.
 *
 * A pattern with no page falls back to the home page rather than a blank screen:
 * the two lines a new route needs can be written one at a time, and half-added
 * is not worth a white page in the middle of an event.
 */
function App() {
  const { pattern, params } = useHashRoute()
  const { Page, admin } = ROUTE_PAGES[pattern] ?? ROUTE_PAGES[ROUTES.HOME]

  // The URL parameters become props, named as the pattern names them.
  const page = <Page {...params} />

  return admin ? <AdminGate>{page}</AdminGate> : page
}

export default App
