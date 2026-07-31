import { Zap, ZapOff } from 'lucide-react'
import Button from '@common/views/Button.jsx'

/**
 * Switches auto mode on and off. On is filled black with a lightning icon, off
 * is an outline with the struck-through one — fill, icon and label all change,
 * so the state never rests on colour alone.
 */
function AutoToggle({ isOn, onToggle }) {
  const Icon = isOn ? Zap : ZapOff

  return (
    <Button
      variant={isOn ? 'primary' : 'secondary'}
      aria-pressed={isOn}
      title={
        isOn
          ? 'The round moves on by itself; press to take over'
          : 'Let the round move on by itself, up to the final results'
      }
      onClick={() => onToggle(!isOn)}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      Auto {isOn ? 'on' : 'off'}
    </Button>
  )
}

export default AutoToggle
