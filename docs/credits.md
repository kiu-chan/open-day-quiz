# Credits

## Avatar animations

The thirty-six animals a player can pick when joining are free Lottie animations
from [lottiefiles.com](https://lottiefiles.com/free-animations/), published under
the **Lottie Simple License** — free to use, including commercially; they may not
be resold as animations in their own right. The app only ever plays them as
avatars, which is exactly what the licence is for.

The files are committed to the repository at
[src/common/session/models/data/avatars/](../src/common/session/models/data/avatars/)
rather than fetched from a CDN: hall wifi is the least reliable thing on the day,
and an avatar that fails to load leaves a visitor staring at an empty circle.
They are played in full colour and always looping — the one deliberate exception
to the app's black-and-white interface rule.

**The length of this table is the player limit of a round.** Each animal belongs
to one player per session, so thirty-six visitors can be in a round at once and
the thirty-seventh is turned away. Adding rows is what raises that ceiling.

| Avatar | Animation | Author |
| --- | --- | --- |
| Cat | [Loader cat](https://lottiefiles.com/animations/loader-cat-dWUie0iIVk) | diane_soko |
| Shiba | [Smiling Dog](https://lottiefiles.com/animations/smiling-dog-bIoJyWZIay) | 5wyicwd67hwxqfiv |
| Bear | [Cute bear dancing](https://lottiefiles.com/animations/cute-bear-dancing-AfMGeP3e3h) | animoox |
| Owl | [Smiling Owl](https://lottiefiles.com/animations/smiling-owl-OcZ1bsvLea) | kamotionstudio |
| Panda | [Cute little panda sleeping](https://lottiefiles.com/animations/cute-little-panda-sleeping-uB83zP26Vb) | nky302kgozw15jh7 |
| Fox | [Meditating Fox](https://lottiefiles.com/animations/meditating-fox-paHR98uEZ3) | directdesign22 |
| Turtle | [Turtle](https://lottiefiles.com/animations/turtle-EGKlKm2BZO) | zeffchris |
| Rabbit | [R1_Rabbit](https://lottiefiles.com/animations/r1-rabbit-lQz3ImvPBv) | mau |
| Sloth | [Sloth meditate](https://lottiefiles.com/animations/sloth-meditate-SzNofNFhYY) | priyanshurijhwani |
| Elephant | [Walking Elephant](https://lottiefiles.com/animations/walking-elephant-BEFTzEWInn) | directdesign22 |
| Chick | [Hatch](https://lottiefiles.com/animations/hatch-kcjYbeFvwT) | teef |
| Duck | [Pixel Duck](https://lottiefiles.com/animations/pixel-duck-kdTYIrVxq7) | oshy |
| Koala | [Meditating Koala](https://lottiefiles.com/animations/meditating-koala-3ONXTzPBtT) | directdesign22 |
| Lion | [Lion - Breath](https://lottiefiles.com/animations/lion-breath-nGrXFqJeVb) | muammarfaiq |
| Monkey | [Juggling Monkey](https://lottiefiles.com/animations/juggling-monkey-mtTi5LMVXi) | mandysasaaa |
| Pig | [Cute pig](https://lottiefiles.com/animations/cute-pig-XV5zQspUxS) | spho3u5vg9 |
| Cow | [Meditating Cow](https://lottiefiles.com/animations/meditating-cow-EYrQqIeaMd) | directdesign22 |
| Horse | [mypink horse](https://lottiefiles.com/animations/mypink-horse-D72qvMdHbg) | vspmvim0jm |
| Giraffe | [Moody Giraffe](https://lottiefiles.com/animations/moody-giraffe-AghTQ9BPbT) | directdesign22 |
| Llama | [Moody Llama](https://lottiefiles.com/animations/moody-llama-chohB6bf7f) | directdesign22 |
| Raccoon | [Happy Raccoon](https://lottiefiles.com/animations/happy-raccoon-g4KBIUX5nv) | bx3piloub1 |
| Hedgehog | [Walking Hedgehog](https://lottiefiles.com/animations/walking-hedgehog-zM8txTU06B) | directdesign22 |
| Frog | [Cute Froggy Looking Around](https://lottiefiles.com/animations/cute-froggy-looking-around-s7SJysTR2l) | 1uhgulyldf |
| Snail | [Snail](https://lottiefiles.com/animations/snail-pggRO8FhpT) | teef |
| Crab | [Dancing Crab](https://lottiefiles.com/animations/dancing-crab-yHkD7ID7AX) | mpz1am1ach18fqww |
| Octopus | [Little cute octopus](https://lottiefiles.com/animations/little-cute-octopus-K6FqYppdgZ) | tanjster |
| Dolphin | [Dolphin](https://lottiefiles.com/animations/dolphin-831FWvQWbL) | directdesign22 |
| Shark | [Shark Swim](https://lottiefiles.com/animations/shark-swim-f6MHYLiMLq) | AlexBradt |
| Parrot | [Parrot](https://lottiefiles.com/animations/parrot-ZXo45VTc9K) | directdesign22 |
| Flamingo | [flamingo](https://lottiefiles.com/animations/flamingo-qmKtKn6mZF) | help2win |
| Bee | [Honey bee](https://lottiefiles.com/animations/honey-bee-EfpJTYVU7W) | iejtbbrdxq |
| Butterfly | [Butterfly Lottie Animation](https://lottiefiles.com/animations/butterfly-lottie-animation-b6IeEGLFLF) | smrony |
| Chameleon | [Chameleon](https://lottiefiles.com/animations/chameleon-UZuseMDDi9) | rockerzz |
| Dinosaur | [Dinosaur Running](https://lottiefiles.com/animations/dinosaur-running-xHaKfzjT4A) | t0neu6hlbs6m2k5n |
| Dragon | [Dragon flying](https://lottiefiles.com/animations/dragon-flying-fly-dragao-voador-voando-3QZwbo98oF) | matheus.mesk |
| Unicorn | [Unicorn stretching](https://lottiefiles.com/animations/unicorn-stretching-eoCPYLcpqk) | nico |

### Adding or replacing an avatar

1. Download the animation as a Lottie JSON and drop it in
   `src/common/session/models/data/avatars/`.
2. Add a row to `AVATARS` in
   [Avatars.js](../src/common/session/models/Avatars.js), and a row to the table
   above.
3. Check it uses no expressions and no effects — search the JSON for `"x":"` and
   `"ef":`. If it uses either, remove the `lottie-web` alias from
   [vite.config.js](../vite.config.js), which points at the light player that
   cannot run them.
4. Play it on a loop and watch the moment it restarts. Plenty of these
   animations open by fading in from an empty frame, which as an avatar means
   the visitor's animal blinks out of existence every few seconds.

Keep the files small (under ~150KB) and prefer vector-only animations: the ones
built from embedded PNG frames run to several hundred KB each and every device in
the hall downloads all of them. Avoid the ones drawn on a full-bleed coloured
rectangle too — cropped to a circle they become a solid disc of colour that
shouts over everything else on a page that is otherwise black and white.

## Libraries

- [lottie-web](https://github.com/airbnb/lottie-web) (MIT) — plays the avatars
- [lucide-react](https://lucide.dev) (ISC) — every icon in the interface
- [qrcode.react](https://github.com/zpao/qrcode.react) (ISC) — the join QR code
