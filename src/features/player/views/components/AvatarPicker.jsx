import { useState } from 'react'
import { Check, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { AVATARS } from '@common/session/models/Avatars.js'
import Button from '@common/views/Button.jsx'
import PlayerAvatar from '@common/views/PlayerAvatar.jsx'

/** Three rows of four: enough choice to feel spoilt for, short enough to see the join button. */
const PREVIEW_COUNT = 12

/**
 * Pick the animal that stands for you on the projector. Every animal belongs to
 * one player per round, so the ones already claimed are shown locked rather than
 * hidden — a visitor should see that the panda went to somebody else, not
 * wonder where the panda went.
 *
 * All three states have to read without colour, since the avatars themselves are
 * the one colourful thing on screen: chosen is a thick border and a tick, taken
 * is a dashed border, a padlock and half opacity, free is a plain thin border.
 *
 * Fifty of them is a long scroll on a phone, and someone who is happy with the
 * animal already selected should not have to wade past nine rows to reach the
 * join button, so only the first twelve are shown until asked. The slice is off
 * the front of the list rather than off the free ones on purpose: the tiles must
 * not reshuffle under a finger that is already on its way down, and joining as
 * the wrong animal cannot be undone.
 */
function AvatarPicker({ value, takenIds, onChange }) {
  const taken = new Set(takenIds)
  const [showAll, setShowAll] = useState(false)

  /**
   * Expanding is also forced when the selection sits past the preview, which
   * happens exactly when the first twelve animals have all been claimed — the
   * one case where a preview of twelve padlocks would be no use to anybody.
   */
  const selectedIndex = AVATARS.findIndex((avatar) => avatar.id === value)
  const isExpanded = showAll || selectedIndex >= PREVIEW_COUNT
  const shown = isExpanded ? AVATARS : AVATARS.slice(0, PREVIEW_COUNT)

  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="mb-2 text-sm">Your avatar</legend>

      <ul className="grid list-none grid-cols-4 gap-2 p-0">
        {shown.map((avatar) => {
          const isTaken = taken.has(avatar.id)
          const isPicked = avatar.id === value && !isTaken

          return (
            <li key={avatar.id}>
              <button
                type="button"
                disabled={isTaken}
                onClick={() => onChange(avatar.id)}
                aria-pressed={isPicked}
                className={`flex w-full flex-col items-center gap-1 rounded-xl bg-transparent p-2 transition ${
                  isTaken
                    ? 'border-border cursor-not-allowed border border-dashed opacity-50'
                    : isPicked
                      ? 'border-text-h text-text-h cursor-pointer border-2 font-medium'
                      : 'border-border cursor-pointer border'
                }`}
              >
                <PlayerAvatar avatarId={avatar.id} className="size-12" />
                <span className="flex items-center gap-0.5 text-xs">
                  {isPicked && (
                    <Check
                      className="size-3 shrink-0"
                      strokeWidth={3}
                      aria-label="Selected"
                    />
                  )}
                  {isTaken && (
                    <Lock
                      className="size-3 shrink-0"
                      strokeWidth={2.5}
                      aria-label="Already taken"
                    />
                  )}
                  {avatar.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* No toggle while the selection itself is what forced the list open —
          collapsing would hide the animal the visitor is about to join as. */}
      {selectedIndex < PREVIEW_COUNT && (
        <Button
          variant="quiet"
          onClick={() => setShowAll(!showAll)}
          className="mt-1 self-center text-sm"
        >
          {showAll ? (
            <>
              <ChevronUp className="size-4" aria-hidden="true" />
              Show fewer
            </>
          ) : (
            <>
              <ChevronDown className="size-4" aria-hidden="true" />
              Show all {AVATARS.length} animals
            </>
          )}
        </Button>
      )}
    </fieldset>
  )
}

export default AvatarPicker
