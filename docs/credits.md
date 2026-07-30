# Credits

## Avatar animations

The twelve animals a player can pick when joining are free Lottie animations
from [lottiefiles.com](https://lottiefiles.com/free-animations/), published under
the **Lottie Simple License** — free to use, including commercially; they may not
be resold as animations in their own right. The app only ever plays them as
avatars, which is exactly what the licence is for.

The files are committed to the repository at
[src/common/session/models/data/avatars/](../src/common/session/models/data/avatars/)
rather than fetched from a CDN: hall wifi is the least reliable thing on the day,
and an avatar that fails to load leaves a visitor staring at an empty circle. The
app draws them in greyscale, so what you see below in colour looks black and
white in the game.

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

Keep the files small (under ~150KB) and prefer vector-only animations: the ones
built from embedded PNG frames run to several hundred KB each and every device in
the hall downloads all of them.

## Libraries

- [lottie-web](https://github.com/airbnb/lottie-web) (MIT) — plays the avatars
- [lucide-react](https://lucide.dev) (ISC) — every icon in the interface
- [qrcode.react](https://github.com/zpao/qrcode.react) (ISC) — the join QR code
