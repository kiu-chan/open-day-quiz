/**
 * The home page headline, which keeps rearranging itself between a stacked
 * column and one line (see `useHeadlineLayout`).
 *
 * The words are the *direct* children of the `<h1>` because the hook walks
 * `children` to measure them — do not wrap them in anything. For the same reason
 * the tilt of the last word lives on an inner span: the outer one has to stay
 * free for the transform that moves it.
 *
 * The size is one fluid `clamp()` rather than a per-breakpoint ladder, so the
 * same type fits both arrangements at every width — which is what lets the words
 * simply travel, with nothing resizing on the way. It is sized for three short
 * words; a longer title the admin types wraps rather than running off the page.
 */
function HeroTitle({ headline, isStacked, wordsRef }) {
  const words = headline.split(/\s+/)

  return (
    <h1
      ref={wordsRef}
      className={`animate-rise text-text-h flex min-h-[3em] flex-col items-start justify-center gap-y-[0.08em] text-[clamp(3.75rem,10vw,7rem)] leading-[0.85] font-black tracking-tighter ${
        isStacked ? '' : 'sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-[0.22em]'
      }`}
      style={{ animationDelay: '80ms' }}
    >
      {words.map((word, index) =>
        index === words.length - 1 ? (
          /* The last word gets the tilted black block: the "festive" accent made
             out of shape rather than colour. It rocks slowly around that tilt,
             which is the one bit of movement playing while the words sit still. */
          <span
            key={word + index}
            className="headline-word"
            style={{ '--stagger': `${index * 70}ms` }}
          >
            <span className="inline-block -rotate-2">
              <span className="bg-accent animate-tilt inline-block px-[0.12em] pt-[0.04em] pb-[0.1em] text-white">
                {word}
              </span>
            </span>
          </span>
        ) : (
          <span
            key={word + index}
            className="headline-word"
            style={{ '--stagger': `${index * 70}ms` }}
          >
            {word}
          </span>
        ),
      )}
    </h1>
  )
}

export default HeroTitle
