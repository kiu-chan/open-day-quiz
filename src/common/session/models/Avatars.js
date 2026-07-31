/**
 * The catalogue of avatars a player can pick when joining.
 *
 * Content shared by all three surfaces — the phone picks one, the projector and
 * the control desk draw it — so it belongs here rather than inside a feature,
 * for the same reason as scoring and the prize boxes.
 *
 * The animations are Lottie files downloaded from lottiefiles.com and **stored
 * in the repository**: the hall wifi is the one thing that can be relied on
 * least, and an avatar that has to be fetched from a CDN would leave visitors
 * staring at empty circles. They are imported statically rather than fetched
 * from `public/`, which keeps every view a pure function — no loading state, no
 * effect, the animation data is simply there. The price is roughly 600KB in the
 * bundle, which over a LAN is nothing.
 *
 * They play in full colour and never stop looping — the one deliberate exception
 * to this project's black-white-and-grey interface rule. See `PlayerAvatar`.
 *
 * Public API: AVATARS, DEFAULT_AVATAR_ID, avatarById(), isAvatarId()
 */
import bear from './data/avatars/bear.json'
import cat from './data/avatars/cat.json'
import chick from './data/avatars/chick.json'
import duck from './data/avatars/duck.json'
import elephant from './data/avatars/elephant.json'
import fox from './data/avatars/fox.json'
import owl from './data/avatars/owl.json'
import panda from './data/avatars/panda.json'
import rabbit from './data/avatars/rabbit.json'
import shiba from './data/avatars/shiba.json'
import sloth from './data/avatars/sloth.json'
import turtle from './data/avatars/turtle.json'

/**
 * `credit` is the author on lottiefiles.com. The free animations are published
 * under the Lottie Simple License, which asks that the work not be resold as
 * such; crediting the authors is what `docs/credits.md` is for.
 */
export const AVATARS = [
  { id: 'cat', label: 'Cat', animation: cat, credit: 'diane_soko' },
  { id: 'shiba', label: 'Shiba', animation: shiba, credit: '5wyicwd67hwxqfiv' },
  { id: 'bear', label: 'Bear', animation: bear, credit: 'animoox' },
  { id: 'owl', label: 'Owl', animation: owl, credit: 'kamotionstudio' },
  { id: 'panda', label: 'Panda', animation: panda, credit: 'nky302kgozw15jh7' },
  { id: 'fox', label: 'Fox', animation: fox, credit: 'directdesign22' },
  { id: 'turtle', label: 'Turtle', animation: turtle, credit: 'zeffchris' },
  { id: 'rabbit', label: 'Rabbit', animation: rabbit, credit: 'mau' },
  { id: 'sloth', label: 'Sloth', animation: sloth, credit: 'priyanshurijhwani' },
  { id: 'elephant', label: 'Elephant', animation: elephant, credit: 'directdesign22' },
  { id: 'chick', label: 'Chick', animation: chick, credit: 'teef' },
  { id: 'duck', label: 'Duck', animation: duck, credit: 'oshy' },
]

export const DEFAULT_AVATAR_ID = AVATARS[0].id

const BY_ID = new Map(AVATARS.map((avatar) => [avatar.id, avatar]))

export function isAvatarId(id) {
  return BY_ID.has(id)
}

/**
 * Never returns null: an unknown id (an old phone holding a removed avatar, a
 * hand-made intent) falls back to the first one, so nothing anywhere has to
 * handle a player without a picture.
 */
export function avatarById(id) {
  return BY_ID.get(id) ?? BY_ID.get(DEFAULT_AVATAR_ID)
}
