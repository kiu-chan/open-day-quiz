/**
 * Controller of the campus map page: which block is open, and the two ways to
 * close it again.
 *
 * The rows and the buildings come straight from the model — the controller adds
 * nothing to them beyond resolving the selected id, which it does here so the
 * view never has to search a list.
 *
 * Escape closes the card. It is an effect and therefore lives here rather than
 * in the dialog: a card that can only be dismissed by hitting a small cross is
 * a trap on a laptop being driven by somebody standing next to the screen.
 *
 * Public API: useCampusMapController() → { rows, buildings, selected, actions }
 */
import { useCallback, useEffect, useState } from 'react'
import {
  CAMPUS_BUILDINGS,
  CAMPUS_ROWS,
  buildingById,
} from '../models/CampusMap.js'

export function useCampusMapController() {
  const [selectedId, setSelectedId] = useState(null)

  const select = useCallback((id) => setSelectedId(id), [])
  const clear = useCallback(() => setSelectedId(null), [])

  useEffect(() => {
    if (!selectedId) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedId])

  return {
    rows: CAMPUS_ROWS,
    buildings: CAMPUS_BUILDINGS,
    selected: buildingById(selectedId),
    actions: { select, clear },
  }
}
