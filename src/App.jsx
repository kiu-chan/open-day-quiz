import { ROUTES, useHashRoute } from '@common/routing/useHashRoute.js'
import AdminGate from '@features/admin/views/AdminGate.jsx'
import AdminHomeContentPage from '@features/admin/views/AdminHomeContentPage.jsx'
import AdminLivePage from '@features/admin/views/AdminLivePage.jsx'
import AdminQuizEditorPage from '@features/admin/views/AdminQuizEditorPage.jsx'
import AdminQuizListPage from '@features/admin/views/AdminQuizListPage.jsx'
import DisplayPage from '@features/display/views/DisplayPage.jsx'
import HomePage from '@features/home/views/HomePage.jsx'
import PlayerPage from '@features/player/views/PlayerPage.jsx'

/**
 * App shell: the routing table, each route pointing at exactly one *Page.jsx.
 *
 * The three admin routes go through `<AdminGate>`, which renders the page only
 * once this browser has typed the event password. The player and display routes
 * stay open — they are the two anybody in the room is meant to reach.
 */
function App() {
  const { pattern, params } = useHashRoute()

  switch (pattern) {
    case ROUTES.ADMIN:
      return (
        <AdminGate>
          <AdminQuizListPage />
        </AdminGate>
      )
    case ROUTES.ADMIN_QUIZ:
      return (
        <AdminGate>
          <AdminQuizEditorPage quizId={params.id} />
        </AdminGate>
      )
    case ROUTES.ADMIN_LIVE:
      return (
        <AdminGate>
          <AdminLivePage />
        </AdminGate>
      )
    case ROUTES.ADMIN_HOME:
      return (
        <AdminGate>
          <AdminHomeContentPage />
        </AdminGate>
      )
    case ROUTES.PLAY:
      return <PlayerPage />
    case ROUTES.DISPLAY:
      return <DisplayPage />
    default:
      return <HomePage />
  }
}

export default App
