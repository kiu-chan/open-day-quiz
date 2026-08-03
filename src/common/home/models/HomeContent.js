/**
 * The text of the home page.
 *
 * The home page is the one screen a visitor reads before they play, and its
 * wording is exactly the sort of thing an organiser wants to change on the
 * morning of the event — the name of the faculty, what the prize is, how the
 * steps are phrased. So it is content the admin edits, not code, and it lives on
 * the server next to the quizzes rather than in one browser.
 *
 * The shape is a flat record of strings: nothing nested, nothing to reorder, no
 * ids. `HOME_SECTIONS` describes that same record once more with the labels the
 * admin form prints — the two sit in one file on purpose, because that is what
 * stops a field being added to the page and quietly forgotten in the editor.
 *
 * **An empty field falls back to the default.** A blank home page helps nobody,
 * and "clear it to put the original text back" is a rule that can be written on
 * the form in one line. The consequence is that no piece of the copy can be
 * removed by emptying it — a section that should disappear is a code change.
 *
 * Both the browser and `server/homeStore.js` normalise through
 * `homeContentFromJSON`, so the file on disk and the props the views read hold
 * exactly the same shape.
 *
 * Public API: DEFAULT_HOME_CONTENT, HOME_SECTIONS, homeContentFromJSON(raw),
 * splitLines(text)
 */

export const DEFAULT_HOME_CONTENT = {
  badge: 'Open Day · The campus game',
  headline: 'OPEN DAY QUIZ',
  intro:
    'Scan the QR code, answer on your phone, and watch your name climb the leaderboard on the big screen. Whoever finishes first gets to pick',
  introHighlight: 'one of three mystery prize boxes',
  playCta: 'Play now',
  displayCta: 'Open the big screen',
  marquee:
    'Scan to play\nFaster answers score more\nThe whole hall answers together\nLive leaderboard\nThree mystery prize boxes',
  stepsTitle: 'How do you play?',
  stepsSubtitle: 'Three steps, nothing to install.',
  step1Title: 'Scan the QR code',
  step1Text:
    "The code is right there on the hall's big screen. Your phone camera is enough — no app to download.",
  step2Title: 'Enter your name',
  step2Text:
    'Type the name you want on the leaderboard, then wait for the host to press start.',
  step3Title: 'Answer fast',
  step3Text:
    'Every question has a countdown. Correct answers score points, and the sooner you answer the more you get.',
  prizeTitle: 'And the prize…',
  prizeText:
    'The winners come up and each pick one of three boxes. The boxes are reshuffled for every winner, so nobody can guess what is in which.',
  footerNote: 'Open Day Quiz — a demo that runs on the local network.',
  footerLink: 'Control desk',
}

/** The same fields, grouped and labelled the way the admin form shows them. */
export const HOME_SECTIONS = [
  {
    key: 'hero',
    title: 'Hero',
    fields: [
      { key: 'badge', label: 'Badge above the title' },
      {
        key: 'headline',
        label: 'Title',
        hint: 'One word per line when it is stacked, and the last word gets the black block. Three short words fit best — the title keeps rearranging itself between one line and a column.',
      },
      { key: 'intro', label: 'Opening paragraph', rows: 3 },
      {
        key: 'introHighlight',
        label: 'The bold ending of that paragraph',
        hint: 'Printed in bold right after the paragraph, followed by a full stop.',
      },
      { key: 'playCta', label: 'Button — play' },
      { key: 'displayCta', label: 'Button — big screen' },
    ],
  },
  {
    key: 'marquee',
    title: 'Scrolling band',
    fields: [
      {
        key: 'marquee',
        label: 'Items',
        hint: 'One per line. Each line gets an icon; empty lines are dropped.',
        rows: 5,
      },
    ],
  },
  {
    key: 'steps',
    title: 'How do you play?',
    fields: [
      { key: 'stepsTitle', label: 'Heading' },
      { key: 'stepsSubtitle', label: 'Sub-heading' },
      { key: 'step1Title', label: 'Step 1 — title' },
      { key: 'step1Text', label: 'Step 1 — text', rows: 3 },
      { key: 'step2Title', label: 'Step 2 — title' },
      { key: 'step2Text', label: 'Step 2 — text', rows: 3 },
      { key: 'step3Title', label: 'Step 3 — title' },
      { key: 'step3Text', label: 'Step 3 — text', rows: 3 },
    ],
  },
  {
    key: 'prize',
    title: 'The prize',
    fields: [
      { key: 'prizeTitle', label: 'Heading' },
      { key: 'prizeText', label: 'Text', rows: 3 },
    ],
  },
  {
    key: 'footer',
    title: 'Footer',
    fields: [
      { key: 'footerNote', label: 'Note' },
      { key: 'footerLink', label: 'Link to the control desk' },
    ],
  },
]

/** Unknown keys are dropped and blank ones defaulted, so callers get every field. */
export function homeContentFromJSON(raw) {
  const content = {}
  for (const [key, fallback] of Object.entries(DEFAULT_HOME_CONTENT)) {
    const value = typeof raw?.[key] === 'string' ? raw[key].trim() : ''
    content[key] = value || fallback
  }
  return content
}

/** For the fields holding a list: one item per line, blank lines thrown away. */
export function splitLines(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}
