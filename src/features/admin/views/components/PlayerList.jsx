import { Users } from 'lucide-react'

function PlayerList({ players }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-text-h flex items-center gap-2 text-sm font-medium">
        <Users className="size-4" aria-hidden="true" />
        Người chơi ({players.length})
      </h2>

      {players.length === 0 ? (
        <p className="text-sm opacity-60">Chưa có ai vào.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {players.map((player) => (
            <li
              key={player.id}
              className="border-border rounded-full border px-3 py-1 text-sm"
            >
              {player.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default PlayerList
