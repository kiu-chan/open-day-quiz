# Usage guide

## Three screens, several ways in

| Screen | URL | Runs on |
| --- | --- | --- |
| Quiz list | `#/admin` | the host's laptop |
| Quiz editor | `#/admin/quiz/<id>` | the host's laptop |
| Control desk | `#/admin/live` | the host's laptop |
| Player | `#/play` | visitors' phones (via QR) |
| Big screen | `#/display` | the machine driving the projector |

The admin pages carry two quick links to `#/display` and `#/play` in the top
right, for testing.

> **There is no password.** Anyone who knows `#/admin/live` can drive the game.
> Do not put the admin URL on the projector.

## Before the event

1. Run `npm run start` and note the IP address it prints (for example
   `http://192.168.1.20:3000`).
2. Open `#/admin` using that address and write your questions. Everything saves
   itself — there is no Save button.
3. Set a duration per question (5–120 seconds). Long, wordy questions deserve
   more time.
4. A quiz has to be "playable" before a session can open: it needs a title, at
   least one question, and every question needs content plus a correct answer.
   The admin page lists exactly what is missing.
5. Open `#/display` on the projector and leave it there.
6. Scan the QR with one phone before visitors arrive — that catches a wifi that
   blocks devices from talking to each other early (see the networking section of
   [installation.md](installation.md)).

Quizzes are stored in the admin machine's browser, so whichever machine you wrote
them on is the machine you must open the session from.

### Questions with images

Every question can carry one image, and **every option can carry one too** —
which makes "which building is this?" questions with four photos to choose from
possible. Press **Add image** on the question or on an individual option row and
pick a jpg/png/webp/gif file.

- An option with an image does **not** need text, and vice versa. The same goes
  for the question itself.
- Images are shrunk to a 1200px long edge on the admin machine before they are
  sent, so you can drag in a phone photo without resizing it yourself.
- Images live on the **server** (`server/uploads/`), not inside the quiz. So if
  you carry the quiz to another machine (or delete that folder), those spots read
  "Image failed to load" — writing the questions on the machine that will run the
  game is the safest approach.
- The server has to be running while you write, or the upload cannot happen.

## Running a round

| Step | What you do | Players see | The big screen shows |
| --- | --- | --- | --- |
| 1 | On `#/admin`, press **Open session** on a quiz | — | a large QR + the join count |
| 2 | Visitors scan the QR and enter a name | "You're in, waiting to start" | the count going up |
| 3 | Press **Start** | 4 option tiles + a clock | the question in large type + a clock |
| 4 | Let the clock run out (auto-closes) or press **Reveal answer** | right/wrong + points earned | the correct answer + how many picked each option |
| 5 | Press **Next question** | the new question | the new question |
| 6 | After the last question, press **See results** | their own rank + the top 3 | the leaderboard |
| 7 | Press **Announce the winner** | the winner sees 3 prize boxes | 3 prize boxes |
| 8 | The winner picks a box | the prize name | the box opens, prize name in large type |
| 9 | Press **End session** | back to the waiting screen | back to the waiting screen |

**Visitors struggling to scan?** Click the QR code — on the control desk or on
the big screen — to blow it up full screen. Click anywhere or press `Esc` to
close.

Only the control desk issues control commands. Phones only send answers and the
prize pick; the projector only reads. Every change goes through the server, so
the three screens always agree — the projector can never be on question 3 while
the phones are still on question 2.

When time runs out the **server** closes the question, not the admin tab. The
admin locking their screen or closing the tab mid-round does not hang the game;
reopening shows the current state.

## Scoring

- Correct answer: **1000 points** plus a speed bonus of up to **500**, decreasing
  linearly with the time used. Answering instantly scores 1500, answering just
  before the buzzer scores about 1000.
- Wrong or too late: **0 points**.
- On equal scores, whoever has the lower **total answering time** ranks higher.
- Equal on both means both share first place, and the control desk shows a list
  so the admin can click who gets the prize.

Scoring by speed is deliberate: a round is only about 5 questions, and scoring
1 point per question leaves a crowd of people tied with no way to pick **one**
winner to hand a prize to.

## The three prize boxes

The prize positions are reshuffled **every time a winner is announced**, so
nobody can guess what is in which. Only the winner can click, and only once.

Edit the prize list in
[src/common/session/models/PrizeBoxes.js](../src/common/session/models/PrizeBoxes.js),
constant `PRIZES`.

## Troubleshooting

**A visitor's phone locked or got refreshed.** Reopening the URL brings back the
same person with their score intact — the identity is stored in that device's
`localStorage`, and the page rejoins the session without retyping a name. As long
as they do not clear browser data or switch devices.

**A phone shows the black "Lost connection to the server" banner.** That device
dropped off the wifi, or the server is down. Nothing to do — the page reconnects
and the banner disappears by itself. If the whole room shows it, check the wifi
on the machine running the server.

**The server was stopped mid-round (Ctrl+C, power cut).** The state is RAM-only,
so the round in progress is gone. Run `npm run serve` again and open a new
session from `#/admin`; visitors' phones rejoin the lobby by themselves, but the
scores from the old round cannot be recovered.

**Pressing "Next question" twice.** Harmless — the state machine blocks the
second press, no question is skipped.

**Scanning the QR lands on an error page.** Two possibilities: either the big
screen was opened via `localhost`, so the QR points at `localhost` — reopen it
with the IP address; or the phone is not on the same network as the server, see
the networking section of [installation.md](installation.md).

**Abandoning a round in progress.** Press **End session** on the control desk, or
**Cancel session** while still in the lobby. Opening a new session from `#/admin`
also cancels the old one.

**Wiping all data.** The game: press **End session**, or restart the server. The
quizzes: delete `server/quizzes.json` and start the server again — it comes back
with the sample set. On visitors' phones, the identity lives under the key
`open-day-quiz:player`.

**Backing the quizzes up.** They are all in `server/quizzes.json`; copy that one
file. It is gitignored, so it is not carried along by a `git pull` on another
machine.

## Current limitations

Every device must be on the **same local network** as the machine running the
server — visitors on 4G cannot join. The state is RAM-only, so stopping the
server loses the round in progress. And there is no password on the control desk.

To let visitors join over 4G from anywhere, the transport has to change to
Firebase/Supabase; the place to change is `SessionRepository`, see
[architecture.md](architecture.md).
