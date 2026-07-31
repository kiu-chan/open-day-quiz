import { useState } from 'react'
import { LogIn, Users } from 'lucide-react'
import Button from '@common/views/Button.jsx'
import AvatarPicker from './AvatarPicker.jsx'

const MAX_NAME_LENGTH = 24

/**
 * P1 — pick a name and an animal to join.
 *
 * The animal is the awkward part: they are handed out first come, first served,
 * so the one on offer can be claimed by somebody else while this form sits open.
 * Selection is therefore kept as "the one I tapped, or else whatever is free
 * right now" — leave the picker alone and it quietly follows the free animals;
 * tap one and it stays put, and if that one goes, the form says so instead of
 * moving the choice under your finger.
 */
function JoinForm({
  defaultName,
  suggestedAvatarId,
  takenAvatarIds,
  isFull,
  lostTheRace,
  onJoin,
}) {
  const [name, setName] = useState(defaultName)
  const [picked, setPicked] = useState(null)

  const avatarId = picked ?? suggestedAvatarId
  const isTaken = takenAvatarIds.includes(avatarId)

  if (isFull) {
    return (
      <section className="flex flex-col items-center gap-3 py-8 text-center">
        <Users className="text-text-h size-10" strokeWidth={1.5} aria-hidden="true" />
        <h2 className="text-text-h text-xl">This round is full</h2>
        <p className="text-sm opacity-70">
          Every animal has been taken. Wait for the organisers to open the next
          round.
        </p>
      </section>
    )
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        onJoin(name, avatarId)
      }}
    >
      <label className="flex flex-col gap-2 text-sm" htmlFor="player-name">
        Your name
        <input
          id="player-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="off"
          placeholder="For example: Alex"
          className="border-border focus:border-accent-border text-text-h rounded-xl border-2 px-4 py-3 text-lg outline-none"
        />
      </label>

      <AvatarPicker
        value={avatarId}
        takenIds={takenAvatarIds}
        onChange={setPicked}
      />

      {/* Once they have tapped a new animal the race they lost is old news —
          only the state of the current selection is worth a warning. */}
      {(isTaken || (lostTheRace && picked === null)) && (
        <p className="border-accent-border text-text-h rounded-xl border-2 border-dashed px-4 py-3 text-sm">
          Somebody took that animal first. Pick another one.
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={name.trim().length === 0 || isTaken}
        className="py-3 text-base"
      >
        <LogIn className="size-5" aria-hidden="true" />
        Join the game
      </Button>
    </form>
  )
}

export default JoinForm
