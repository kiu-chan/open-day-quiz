import { Check } from 'lucide-react'
import { AVATARS } from '@common/session/models/Avatars.js'
import PlayerAvatar from '@common/views/PlayerAvatar.jsx'

/**
 * Pick the animal that stands for you on the projector. The chosen one is marked
 * by a thick border plus a tick, never by colour, and it is the only one that
 * moves — so on a washed-out phone screen it is still obvious which is selected.
 */
function AvatarPicker({ value, onChange }) {
  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="mb-2 text-sm">Your avatar</legend>

      <ul className="grid list-none grid-cols-4 gap-2 p-0">
        {AVATARS.map((avatar) => {
          const isPicked = avatar.id === value

          return (
            <li key={avatar.id}>
              <button
                type="button"
                onClick={() => onChange(avatar.id)}
                aria-pressed={isPicked}
                className={`flex w-full cursor-pointer flex-col items-center gap-1 rounded-xl bg-transparent p-2 transition ${
                  isPicked
                    ? 'border-text-h text-text-h border-2 font-medium'
                    : 'border-border border opacity-70'
                }`}
              >
                <PlayerAvatar
                  avatarId={avatar.id}
                  animate={isPicked}
                  className="size-12"
                />
                <span className="flex items-center gap-0.5 text-xs">
                  {isPicked && (
                    <Check
                      className="size-3 shrink-0"
                      strokeWidth={3}
                      aria-label="Selected"
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
