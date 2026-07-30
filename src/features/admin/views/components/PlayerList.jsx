import { Users } from 'lucide-react'
import PlayerAvatar from '@common/views/PlayerAvatar.jsx'
import Panel from './Panel.jsx'

function PlayerList({ players }) {
  return (
    <Panel
      title="Players"
      Icon={Users}
      aside={
        <span className="text-text-h font-mono text-sm font-bold tabular-nums">
          {players.length}
        </span>
      }
    >
      {players.length === 0 ? (
        <p className="text-sm opacity-60">
          Nobody has joined yet. Names appear here the moment someone scans the QR
          code.
        </p>
      ) : (
        <ul className="flex list-none flex-wrap gap-2 p-0">
          {players.map((player) => (
            <li
              key={player.id}
              className="border-border animate-rise flex items-center gap-2 rounded-full border-2 py-1 pr-3 pl-1"
            >
              <PlayerAvatar avatarId={player.avatarId} className="size-6" />
              <span className="text-text-h text-sm">{player.name}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export default PlayerList
