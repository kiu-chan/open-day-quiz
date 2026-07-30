import { Users } from 'lucide-react'
import Panel from './Panel.jsx'

/** Chữ cái đầu của tên, dùng làm dấu nhận diện thay cho ảnh đại diện. */
function initialOf(name) {
  return name.trim().charAt(0).toUpperCase() || '?'
}

function PlayerList({ players }) {
  return (
    <Panel
      title="Người chơi"
      Icon={Users}
      aside={
        <span className="text-text-h font-mono text-sm font-bold tabular-nums">
          {players.length}
        </span>
      }
    >
      {players.length === 0 ? (
        <p className="text-sm opacity-60">
          Chưa có ai vào. Tên sẽ hiện ở đây ngay khi có người quét QR.
        </p>
      ) : (
        <ul className="flex list-none flex-wrap gap-2 p-0">
          {players.map((player) => (
            <li
              key={player.id}
              className="border-border animate-rise flex items-center gap-2 rounded-full border-2 py-1 pr-3 pl-1"
            >
              <span
                className="bg-accent flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-white"
                aria-hidden="true"
              >
                {initialOf(player.name)}
              </span>
              <span className="text-text-h text-sm">{player.name}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export default PlayerList
