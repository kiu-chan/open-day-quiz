import PrizeBox from './PrizeBox.jsx'

/**
 * The three prize boxes, on the phone (`onPick` given: the winner taps one) and
 * on the projector (no `onPick`: the room only watches). Both draw the same row
 * so the two screens cannot show the room two different things.
 *
 * Once a box is picked the other two collapse to nothing — width, padding and
 * opacity all transition to zero — and the picked one widens into the space they
 * leave. Because the row is centred and the two empty items sit one on each
 * side, the chosen box slides to the middle of the screen on its own; nothing
 * here has to measure a position. The gap between the boxes is padding on the
 * items rather than `gap`, for the same reason: a `gap` survives an item
 * collapsing and would leave the last box hanging off-centre.
 */
function PrizeBoxRow({ boxes, variant = 'phone', onPick }) {
  return (
    <ul className="flex w-full list-none justify-center p-0">
      {boxes.prizeIds.map((prizeId, i) => {
        const isGone = boxes.isPicked && boxes.pickedIndex !== i

        return (
          <li
            key={prizeId}
            className={`flex transition-all duration-500 ${
              isGone
                ? 'basis-0 scale-50 overflow-hidden px-0'
                : boxes.isPicked
                  ? 'basis-full px-0'
                  : 'basis-1/3 px-1.5'
            }`}
          >
            <PrizeBox boxes={boxes} index={i} variant={variant} onPick={onPick} />
          </li>
        )
      })}
    </ul>
  )
}

export default PrizeBoxRow
