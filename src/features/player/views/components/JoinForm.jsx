import { useState } from 'react'
import { LogIn } from 'lucide-react'
import Button from '@common/views/Button.jsx'

const MAX_NAME_LENGTH = 24

/** P1 — nhập tên để vào phiên. Tên cũ được điền sẵn nếu đã từng chơi. */
function JoinForm({ defaultName, onJoin }) {
  const [name, setName] = useState(defaultName)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        onJoin(name)
      }}
    >
      <label className="flex flex-col gap-2 text-sm" htmlFor="player-name">
        Tên của bạn
        <input
          id="player-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="off"
          placeholder="Ví dụ: Khánh"
          className="border-border focus:border-accent-border text-text-h rounded-xl border-2 px-4 py-3 text-lg outline-none"
        />
      </label>

      <Button
        type="submit"
        variant="primary"
        disabled={name.trim().length === 0}
        className="py-3 text-base"
      >
        <LogIn className="size-5" aria-hidden="true" />
        Vào chơi
      </Button>
    </form>
  )
}

export default JoinForm
