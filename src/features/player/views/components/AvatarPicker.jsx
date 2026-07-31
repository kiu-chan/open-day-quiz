import { Check, Lock } from 'lucide-react'
import { AVATARS } from '@common/session/models/Avatars.js'
import PlayerAvatar from '@common/views/PlayerAvatar.jsx'

/**
 * Pick the animal that stands for you on the projector. Every animal belongs to
 * one player per round, so the ones already claimed are shown locked rather than
 * hidden — a visitor should see that the panda went to somebody else, not
 * wonder where the panda went.
 *
 * All three states have to read without colour, since the avatars themselves are
 * the one colourful thing on screen: chosen is a thick border and a tick, taken
 * is a dashed border, a padlock and half opacity, free is a plain thin border.
 */
function AvatarPicker({ value, takenIds, onChange }) {
  const taken = new Set(takenIds)

  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="mb-2 text-sm">Your avatar</legend>

      <ul className="grid list-none grid-cols-4 gap-2 p-0">
        {AVATARS.map((avatar) => {
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
    </fieldset>
  )
}

export default AvatarPicker
