/**
 * The rearranging headline on the home page.
 *
 * "OPEN DAY QUIZ" alternates between a stacked column and a single line, and the
 * words *travel* between the two arrangements instead of snapping. The trick is
 * FLIP: the interval measures where every word sits *before* the layout changes,
 * then a layout effect puts each word back at its old place with a transform and
 * releases it — the transition on `.headline-word` does the rest. The type size
 * is the same in both arrangements, so a translate is all it takes; nothing is
 * scaled.
 *
 * `DWELL_MS` is long on purpose. This sits behind the page's main heading, and a
 * title that rearranges every couple of seconds turns reading the paragraph
 * underneath it into work; six and a half seconds is slow enough to read past and
 * often enough to be noticed while looking at the buttons.
 *
 * Phones never rearrange — three words on one line do not fit a phone at this
 * size, so the row classes are `sm:` only. That costs the hook nothing: the words
 * then measure the same before and after and it finds nothing to move.
 *
 * Public API: useHeadlineLayout() → { isStacked, wordsRef }
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/** How long one arrangement is held before the words move to the other. */
const DWELL_MS = 6500

export function useHeadlineLayout() {
  const [isStacked, setIsStacked] = useState(true)
  const wordsRef = useRef(null)
  const previousRects = useRef(null)

  useEffect(() => {
    // Someone who asked for reduced motion keeps the stacked headline and no
    // rearranging at all. This is decoration, so the honest answer is to skip it
    // rather than to play it faster.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = setInterval(() => {
      previousRects.current = measureWords(wordsRef.current)
      setIsStacked((stacked) => !stacked)
    }, DWELL_MS)

    return () => clearInterval(id)
  }, [])

  useLayoutEffect(() => {
    const previous = previousRects.current
    previousRects.current = null
    // Nothing to compare against on the first render, and nothing to do on a
    // phone, where both arrangements lay out identically.
    if (!previous) return

    for (const [index, word] of [...wordsRef.current.children].entries()) {
      const from = previous[index]
      // The admin can retitle the page, so the words are not a fixed set: a
      // title that arrived between the measurement and here has nothing to be
      // moved from, and simply appears in its new arrangement.
      if (!from) continue

      const to = word.getBoundingClientRect()
      const dx = from.left - to.left
      const dy = from.top - to.top
      if (!dx && !dy) continue

      word.style.transition = 'none'
      word.style.transform = `translate(${dx}px, ${dy}px)`
      // Reading a layout value forces the browser to take the line above as a
      // state of its own; without it the only transform it ever sees is the one
      // being cleared below, and the word arrives with no movement at all.
      void word.offsetWidth
      word.style.transition = ''
      word.style.transform = ''
    }
  }, [isStacked])

  return { isStacked, wordsRef }
}

function measureWords(container) {
  return [...container.children].map((word) => word.getBoundingClientRect())
}
