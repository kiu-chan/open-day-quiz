import { useState } from 'react'
import {
  Check,
  LoaderCircle,
  RefreshCw,
  Search,
  TriangleAlert,
  Wifi,
} from 'lucide-react'
import Button from '@common/views/Button.jsx'
import Panel from './Panel.jsx'

const SOURCE_TITLES = {
  'in-range': 'Networks in range of this computer',
  remembered: 'Networks this computer has joined before',
  none: 'Networks',
}

/**
 * The list of networks to pick from, next to the box the name is typed into.
 *
 * Picking only fills the name in — the password still has to be typed, because
 * no operating system hands a stored one back to a program that asks.
 *
 * A remembered list can run to a couple of hundred entries (a laptop carried
 * around a city for a year), so it filters and it scrolls. The filter is local
 * UI state of this one component: nobody else needs to know what is typed in it.
 *
 * The list is never the only way in. Scanning fails on a machine with no
 * wireless card, and a hidden network appears in no list at all, so the page
 * works with this panel empty.
 */
function NetworkPicker({
  networks,
  current,
  source,
  isScanning,
  scanError,
  selected,
  onPick,
  onRescan,
}) {
  const [filter, setFilter] = useState('')

  const needle = filter.trim().toLowerCase()
  const shown = needle
    ? networks.filter((ssid) => ssid.toLowerCase().includes(needle))
    : networks

  return (
    <Panel
      title={SOURCE_TITLES[source] ?? SOURCE_TITLES.none}
      Icon={Wifi}
      aside={
        <Button variant="quiet" className="text-sm" onClick={onRescan} disabled={isScanning}>
          <RefreshCw
            className={`size-4 ${isScanning ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          {isScanning ? 'Reading…' : 'Read again'}
        </Button>
      }
    >
      {scanError ? (
        <p className="flex items-start gap-2 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-label="Error" />
          <span>
            The list could not be read ({scanError}). Type the network name in
            the box above instead — it works exactly the same.
          </span>
        </p>
      ) : isScanning ? (
        <p className="flex items-center gap-2 text-sm">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Asking the computer running the server…
        </p>
      ) : networks.length === 0 ? (
        <p className="text-sm">
          This computer listed no networks. Type the name in the box above — a
          hidden network never appears in a list anyway.
        </p>
      ) : (
        <>
          <label
            htmlFor="wifi-filter"
            className="border-border focus-within:border-accent-border flex items-center gap-2 rounded-xl border-2 px-3.5 py-2"
          >
            <Search className="size-4 shrink-0 opacity-60" aria-hidden="true" />
            <input
              id="wifi-filter"
              value={filter}
              placeholder={`Filter ${networks.length} networks`}
              onChange={(event) => setFilter(event.target.value)}
              className="text-text-h w-full bg-transparent text-base outline-none"
            />
          </label>

          <ul className="border-border max-h-72 list-none overflow-y-auto rounded-xl border p-1.5">
            {shown.map((ssid) => {
              const isSelected = ssid === selected

              return (
                <li key={ssid}>
                  <button
                    type="button"
                    onClick={() => onPick(ssid)}
                    aria-current={isSelected ? 'true' : undefined}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border-2 px-3 py-2 text-left transition ${
                      isSelected
                        ? 'border-accent-border font-medium'
                        : 'hover:border-border border-transparent'
                    }`}
                  >
                    {/* The tick is the mark of choice, not a fill or a colour;
                        the empty span keeps every row's text on one line. */}
                    {isSelected ? (
                      <Check className="size-4 shrink-0" aria-label="Chosen" strokeWidth={2.5} />
                    ) : (
                      <span className="size-4 shrink-0" aria-hidden="true" />
                    )}

                    <span className="text-text-h flex-1 truncate">{ssid}</span>

                    {ssid === current && (
                      <span className="border-border shrink-0 rounded-full border px-2 py-0.5 text-xs">
                        this computer is on it
                      </span>
                    )}
                  </button>
                </li>
              )
            })}

            {shown.length === 0 && (
              <li className="px-3 py-2 text-sm">Nothing matches “{filter}”.</li>
            )}
          </ul>

          {source === 'remembered' && (
            <p className="text-xs opacity-70">
              These are the networks this computer remembers, not the ones it can
              see right now — macOS only tells a program the names of networks
              nearby if it has been granted Location Services, so the reliable
              list is this one. A network in it may be nowhere near the hall.
            </p>
          )}
        </>
      )}
    </Panel>
  )
}

export default NetworkPicker
