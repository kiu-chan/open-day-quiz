import { ROUTES, useHashRoute } from '@common/routing/useHashRoute.js'
import AdminLivePage from '@features/admin/views/AdminLivePage.jsx'
import AdminQuizEditorPage from '@features/admin/views/AdminQuizEditorPage.jsx'
import AdminQuizListPage from '@features/admin/views/AdminQuizListPage.jsx'
import DisplayPage from '@features/display/views/DisplayPage.jsx'
import HomePage from '@features/home/views/HomePage.jsx'
import PlayerPage from '@features/player/views/PlayerPage.jsx'

/** App shell: the routing table, each route pointing at exactly one *Page.jsx. */
function App() {
  const { pattern, params } = useHashRoute()

  switch (pattern) {
    case ROUTES.ADMIN:
      return <AdminQuizListPage />
    case ROUTES.ADMIN_QUIZ:
      return <AdminQuizEditorPage quizId={params.id} />
    case ROUTES.ADMIN_LIVE:
      return <AdminLivePage />
    case ROUTES.PLAY:
      return <PlayerPage />
    case ROUTES.DISPLAY:
      return <DisplayPage />
    default:
      return <HomePage />
  }
}

export default App
