import { ArrowLeft, MapPin } from 'lucide-react'
import { ROUTES } from '@common/routing/useHashRoute.js'
import { useCampusMapController } from '../controllers/useCampusMapController.js'
import AccessNotice from './components/AccessNotice.jsx'
import BuildingDetail from './components/BuildingDetail.jsx'
import CampusBlock from './components/CampusBlock.jsx'
import { CAMPUS_NOTICE, buildingById } from '../models/CampusMap.js'

/**
 * The campus map: the plan of the four blocks, and a card for whichever one is
 * tapped. Each row of `CAMPUS_ROWS` is a flex row of equal blocks, so the row
 * holding the main building on its own draws it wide, the way it stands on the
 * plan.
 */
function MapPage() {
  const { rows, selected, actions } = useCampusMapController()

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-12">
        <header className="flex flex-col gap-3">
          <a
            href={`#${ROUTES.HOME}`}
            className="text-text-h inline-flex w-fit items-center gap-1.5 text-base no-underline"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            Back to the home page
          </a>

          <h1 className="text-text-h font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Explore campus by map
          </h1>
          <p className="max-w-2xl text-lg">
            Here you can explore the campus map. Tap any building to find out
            what is inside it.
          </p>
        </header>

        <div className="border-border bg-bg flex flex-col gap-5 rounded-2xl border-2 p-4 sm:p-8">
          <AccessNotice title="Campus-wide notice:">{CAMPUS_NOTICE}</AccessNotice>

          {rows.map((row, index) => (
            <div key={row.join('-')} className="flex flex-col gap-5">
              {/* The strip between the two rows of blocks: the courtyard the
                  visitor is standing in while they read this. */}
              {index > 0 && (
                <div
                  className="border-border flex items-center justify-center border-y-2 border-dashed py-2 text-sm tracking-wide uppercase"
                  aria-hidden="true"
                >
                  Courtyard &amp; parking
                </div>
              )}

              <div className="flex flex-col gap-5 sm:flex-row">
                {row.map((id) => (
                  <div key={id} className="flex-1">
                    <CampusBlock
                      building={buildingById(id)}
                      selected={selected?.id === id}
                      onSelect={actions.select}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="inline-flex items-center gap-2 text-base">
          <MapPin className="size-5 shrink-0" strokeWidth={2} aria-hidden="true" />
          Tap a block for its details and what is hard to reach inside it.
        </p>
      </section>

      {selected && (
        <BuildingDetail building={selected} onClose={actions.clear} />
      )}
    </main>
  )
}

export default MapPage
