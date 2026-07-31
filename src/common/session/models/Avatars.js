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
 * effect, the animation data is simply there. The price is roughly 3MB in the
 * bundle, which over a LAN is nothing.
 *
 * They play in full colour and never stop looping — the one deliberate exception
 * to this project's black-white-and-grey interface rule. See `PlayerAvatar`.
 *
 * **The size of this list is the player limit of one round.** An avatar belongs
 * to one player per session (see `SessionModel.join`), so the 50th visitor to
 * join takes the last animal and the 51st cannot join at all. Adding avatars
 * raises the ceiling; nothing else does.
 *
 * Public API: AVATARS, DEFAULT_AVATAR_ID, avatarById(), isAvatarId(),
 * firstFreeAvatarId()
 */
import bat from './data/avatars/bat.json'
import bear from './data/avatars/bear.json'
import bee from './data/avatars/bee.json'
import bird from './data/avatars/bird.json'
import butterfly from './data/avatars/butterfly.json'
import camel from './data/avatars/camel.json'
import cat from './data/avatars/cat.json'
import caterpillar from './data/avatars/caterpillar.json'
import chameleon from './data/avatars/chameleon.json'
import chick from './data/avatars/chick.json'
import cow from './data/avatars/cow.json'
import crab from './data/avatars/crab.json'
import dinosaur from './data/avatars/dinosaur.json'
import dolphin from './data/avatars/dolphin.json'
import dragon from './data/avatars/dragon.json'
import duck from './data/avatars/duck.json'
import elephant from './data/avatars/elephant.json'
import flamingo from './data/avatars/flamingo.json'
import fox from './data/avatars/fox.json'
import frog from './data/avatars/frog.json'
import giraffe from './data/avatars/giraffe.json'
import goldfish from './data/avatars/goldfish.json'
import hedgehog from './data/avatars/hedgehog.json'
import horse from './data/avatars/horse.json'
import jellyfish from './data/avatars/jellyfish.json'
import koala from './data/avatars/koala.json'
import lion from './data/avatars/lion.json'
import lizard from './data/avatars/lizard.json'
import llama from './data/avatars/llama.json'
import meerkat from './data/avatars/meerkat.json'
import monkey from './data/avatars/monkey.json'
import octopus from './data/avatars/octopus.json'
import owl from './data/avatars/owl.json'
import panda from './data/avatars/panda.json'
import parrot from './data/avatars/parrot.json'
import pig from './data/avatars/pig.json'
import pigeon from './data/avatars/pigeon.json'
import rabbit from './data/avatars/rabbit.json'
import raccoon from './data/avatars/raccoon.json'
import rooster from './data/avatars/rooster.json'
import shark from './data/avatars/shark.json'
import sheep from './data/avatars/sheep.json'
import shiba from './data/avatars/shiba.json'
import sloth from './data/avatars/sloth.json'
import snail from './data/avatars/snail.json'
import squirrel from './data/avatars/squirrel.json'
import toucan from './data/avatars/toucan.json'
import turkey from './data/avatars/turkey.json'
import turtle from './data/avatars/turtle.json'
import unicorn from './data/avatars/unicorn.json'

/**
 * `credit` is the author on lottiefiles.com. The free animations are published
 * under the Lottie Simple License, which asks that the work not be resold as
 * such; crediting the authors is what `docs/credits.md` is for.
 *
 * The order is the order of the picker, and — because the first free animal is
 * what a new phone starts on — roughly the order in which they get handed out.
 * The familiar pets come first so the early visitors get those.
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
  { id: 'koala', label: 'Koala', animation: koala, credit: 'directdesign22' },
  { id: 'lion', label: 'Lion', animation: lion, credit: 'muammarfaiq' },
  { id: 'monkey', label: 'Monkey', animation: monkey, credit: 'mandysasaaa' },
  { id: 'pig', label: 'Pig', animation: pig, credit: 'spho3u5vg9' },
  { id: 'cow', label: 'Cow', animation: cow, credit: 'directdesign22' },
  { id: 'horse', label: 'Horse', animation: horse, credit: 'vspmvim0jm' },
  { id: 'giraffe', label: 'Giraffe', animation: giraffe, credit: 'directdesign22' },
  { id: 'llama', label: 'Llama', animation: llama, credit: 'directdesign22' },
  { id: 'raccoon', label: 'Raccoon', animation: raccoon, credit: 'bx3piloub1' },
  { id: 'hedgehog', label: 'Hedgehog', animation: hedgehog, credit: 'directdesign22' },
  { id: 'frog', label: 'Frog', animation: frog, credit: '1uhgulyldf' },
  { id: 'snail', label: 'Snail', animation: snail, credit: 'teef' },
  { id: 'crab', label: 'Crab', animation: crab, credit: 'mpz1am1ach18fqww' },
  { id: 'octopus', label: 'Octopus', animation: octopus, credit: 'tanjster' },
  { id: 'dolphin', label: 'Dolphin', animation: dolphin, credit: 'directdesign22' },
  { id: 'shark', label: 'Shark', animation: shark, credit: 'AlexBradt' },
  { id: 'parrot', label: 'Parrot', animation: parrot, credit: 'directdesign22' },
  { id: 'flamingo', label: 'Flamingo', animation: flamingo, credit: 'help2win' },
  { id: 'bee', label: 'Bee', animation: bee, credit: 'iejtbbrdxq' },
  { id: 'butterfly', label: 'Butterfly', animation: butterfly, credit: 'smrony' },
  { id: 'chameleon', label: 'Chameleon', animation: chameleon, credit: 'rockerzz' },
  { id: 'dinosaur', label: 'Dinosaur', animation: dinosaur, credit: 't0neu6hlbs6m2k5n' },
  { id: 'dragon', label: 'Dragon', animation: dragon, credit: 'matheus.mesk' },
  { id: 'unicorn', label: 'Unicorn', animation: unicorn, credit: 'nico' },
  { id: 'squirrel', label: 'Squirrel', animation: squirrel, credit: '9n2tiv92urwjmd92' },
  { id: 'meerkat', label: 'Meerkat', animation: meerkat, credit: 'debbiediaz' },
  { id: 'camel', label: 'Camel', animation: camel, credit: 'directdesign22' },
  { id: 'sheep', label: 'Sheep', animation: sheep, credit: 'avgyhsbmgz' },
  { id: 'rooster', label: 'Rooster', animation: rooster, credit: 'directdesign22' },
  { id: 'turkey', label: 'Turkey', animation: turkey, credit: 'kamotionstudio' },
  { id: 'toucan', label: 'Toucan', animation: toucan, credit: 'iejtbbrdxq' },
  { id: 'bird', label: 'Bird', animation: bird, credit: 'setya182' },
  { id: 'pigeon', label: 'Pigeon', animation: pigeon, credit: 'rr8azqtmvscs6egy' },
  { id: 'bat', label: 'Bat', animation: bat, credit: 'elflacosoyyo' },
  { id: 'lizard', label: 'Lizard', animation: lizard, credit: 'smrony' },
  { id: 'goldfish', label: 'Goldfish', animation: goldfish, credit: 'mandysasaaa' },
  { id: 'jellyfish', label: 'Jellyfish', animation: jellyfish, credit: 'directdesign22' },
  { id: 'caterpillar', label: 'Caterpillar', animation: caterpillar, credit: 'mujahid' },
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

/**
 * The animal a phone that has just opened the join form should start on.
 *
 * Returns **null** when every one of them is spoken for, and that null is not a
 * corner case to paper over: it means the round is full and the form has to say
 * so rather than offer a pick that the server will refuse.
 */
export function firstFreeAvatarId(takenIds) {
  const taken = new Set(takenIds)
  return AVATARS.find((avatar) => !taken.has(avatar.id))?.id ?? null
}
