/**
 * The route table: which page each route draws, and whether it is behind the
 * admin password.
 *
 * **This is the file to edit when a page is added.** Two lines, in two places,
 * and they are deliberately not the same file:
 *
 * 1. the path itself goes in `ROUTES` in `common/routing/useHashRoute.js`, and
 * 2. the page it draws goes in the table below.
 *
 * The split is not tidiness, it is the import graph. Half the views link to
 * other pages and therefore import `ROUTES`; if the path constants lived in this
 * file, importing one of them would drag every page in the app into that view,
 * and `HomePage → routes.jsx → HomePage` is a cycle that works right up until it
 * silently does not. Paths are strings anybody may import; pages are components
 * only the shell may.
 *
 * **A route's URL parameters arrive as props under the names used in the
 * pattern.** `/admin/quiz/:quizId` renders `<AdminQuizEditorPage quizId="…" />`,
 * so a page with a parameter needs nothing here beyond its line.
 *
 * Public API: ROUTE_PAGES
 */
import { ROUTES } from '@common/routing/useHashRoute.js'
import AdminHomeContentPage from '@features/admin/views/AdminHomeContentPage.jsx'
import AdminLivePage from '@features/admin/views/AdminLivePage.jsx'
import AdminQuizEditorPage from '@features/admin/views/AdminQuizEditorPage.jsx'
import AdminQuizListPage from '@features/admin/views/AdminQuizListPage.jsx'
import AdminWifiPage from '@features/admin/views/AdminWifiPage.jsx'
import DisplayPage from '@features/display/views/DisplayPage.jsx'
import HomePage from '@features/home/views/HomePage.jsx'
import PlayerPage from '@features/player/views/PlayerPage.jsx'

/**
 * `admin: true` wraps the page in `<AdminGate>`, which draws it only once this
 * browser has typed the event password. Leaving it off is a decision, not a
 * default: the player and display routes are open because they are the two
 * anybody in the room is meant to reach, and a new page is open until somebody
 * says otherwise.
 */
export const ROUTE_PAGES = {
  [ROUTES.HOME]: { Page: HomePage },
  [ROUTES.PLAY]: { Page: PlayerPage },
  [ROUTES.DISPLAY]: { Page: DisplayPage },
  [ROUTES.ADMIN]: { Page: AdminQuizListPage, admin: true },
  [ROUTES.ADMIN_QUIZ]: { Page: AdminQuizEditorPage, admin: true },
  [ROUTES.ADMIN_LIVE]: { Page: AdminLivePage, admin: true },
  [ROUTES.ADMIN_HOME]: { Page: AdminHomeContentPage, admin: true },
  [ROUTES.ADMIN_WIFI]: { Page: AdminWifiPage, admin: true },
}
