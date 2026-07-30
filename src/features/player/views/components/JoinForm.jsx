import { useState } from 'react'
import { LogIn } from 'lucide-react'
import Button from '@common/views/Button.jsx'
import AvatarPicker from './AvatarPicker.jsx'

const MAX_NAME_LENGTH = 24

/** P1 — pick a name and an avatar to join. Both are prefilled from last time. */
function JoinForm({ defaultName, defaultAvatarId, onJoin }) {
  const [name, setName] = useState(defaultName)
  const [avatarId, setAvatarId] = useState(defaultAvatarId)

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

      <AvatarPicker value={avatarId} onChange={setAvatarId} />

      <Button
        type="submit"
        variant="primary"
        disabled={name.trim().length === 0}
        className="py-3 text-base"
      >
        <LogIn className="size-5" aria-hidden="true" />
        Join the game
      </Button>
    </form>
  )
}

export default JoinForm
