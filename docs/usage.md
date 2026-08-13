# Usage guide

## Three screens, several ways in

| Screen | URL | Runs on |
| --- | --- | --- |
| Quiz list | `#/admin` | the host's laptop |
| Quiz editor | `#/admin/quiz/<id>` | the host's laptop |
| Control desk | `#/admin/live` | the host's laptop |
| Home page text | `#/admin/home` | the host's laptop |
| Wi-Fi | `#/admin/wifi` | **the machine running the server** |
| Feedback | `#/admin/feedback` | the host's laptop |
| Player | `#/play` | visitors' phones (via QR) |
| Big screen | `#/display` | the machine driving the projector |

The admin pages carry two quick links to `#/display` and `#/play` in the top
right, for testing.

The Wi-Fi page is the one worth opening **on the machine running the server**
rather than from another laptop: the list of networks it offers is read on that
machine, since that is the network visitors have to join.

The admin pages are **behind a password**; `#/play` and `#/display` are not,
since those are the two everybody in the room is meant to reach.

## The admin password

The **first** time anybody opens an admin page on a fresh installation, it asks
for a password to set instead of a password to type. Pick one (at least 6
characters) and confirm it. From then on:

- The password is hashed with scrypt and the hash is written to `.env` on the
  machine running the server. The password itself is stored nowhere, and `.env` is
  gitignored.
- Every admin browser types it once. It stays unlocked for 12 hours, or until the
  server is restarted — restarting signs every admin browser out.
- The first-run screen never comes back: once a password exists, the server
  refuses to set another one.
- **Forgotten it?** Delete the `ADMIN_PASSWORD_HASH=` line from `.env`, restart
  the server, and the first-run screen returns.

Writing a quiz and uploading an image are refused by the server without that
password. Driving a running round is not: the play/pause intents travel the same
open channel the phones use, so keep treating the admin URL as something you do
not put on the projector.

## Before the event

1. Run `npm run start` and note the IP address it prints (for example
   `http://192.168.1.20:3000`).
2. Open `#/admin` using that address and write your questions. Nothing reaches
   the server until you press **Save** and confirm it in the dialog that comes
   up; until then the badge next to the button reads "Unsaved changes" and
   closing the tab asks you first.
3. Set the countdown (5–120 seconds). **Countdown for every question** at the top
   of the editor sets the whole set at once; the field under each question sets
   that one alone, and long, wordy questions deserve more time. The quiz-wide
   field shows "Mixed" when the questions no longer agree — typing in it makes
   them agree again. Players see this countdown both as the number and as a bar
   draining under it.
4. Set **Winners per round** (1–5) next to the countdown — how many people the
   round hands a prize to at the end. It is saved with the quiz, so bring as many
   prizes as the number says.
5. A quiz has to be "playable" before a session can open: it needs a title, at
   least one question, and every question needs content plus a correct answer.
   The admin page lists exactly what is missing.
6. Optional: open `#/admin/home` and put the event's own wording on the page
   visitors land on — the title, the paragraph, the three steps, what the prize
   is. It saves the same way as the quiz editor (nothing is written until you
   press **Save**), and emptying a box puts the original wording back. The next
   visitor to open the home page reads the new text; phones already sitting on it
   need a reload.
7. Optional but recommended: open the **Wi-Fi** tab (`#/admin/wifi`), pick the
   network the stand hands out from the list, type its password and save. The
   big screen and the home page then show a second QR code that puts a phone on
   that network with one scan — see below. Leave the network name empty and no
   Wi-Fi code appears anywhere, which is the right setting when everybody in the
   room is already on the network.
8. Open `#/display` on the projector and leave it there.
9. Scan the QR with one phone before visitors arrive — that catches a wifi that
   blocks devices from talking to each other early (see the networking section of
   [installation.md](installation.md)).

Quizzes are stored on the game server (`server/quizzes.json`), so any machine
that can reach the server sees the same list — you no longer have to open the
session from the laptop you wrote them on. The home page text sits next to them
in `server/home.json`, for the same reason.

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
| 2 | Visitors scan the QR, enter a name and pick an animal | "You're in, waiting to start" | their animal appearing on the wall, the count going up |
| 3 | Press **Start** — on the control desk (it asks you to confirm), or **Start the quiz** on the big screen itself. Both stay greyed out until 3 players have joined | 4 option tiles + a clock | the question in large type + a clock |
| 4 | Let the clock run out (auto-closes) or press **Reveal answer** | right/wrong + points earned | the correct answer + how many picked each option |
| 5 | Nothing — auto mode shows the standings after 6s (or press **Show standings**) | the top 10 + their own rank | the top 10, moving |
| 6 | Nothing — auto mode starts the next question after 8s (or press **Next question**) | the new question | the new question |
| 7 | After the last question, nothing again (or press **See results**) | their own rank + the top 10 | the top 10 |
| 8 | Nothing — auto mode announces the winners after 10s (or press **Announce the winners**) | each winner sees their own 3 prize boxes | every winner's 3 boxes |
| 9 | The winners pick a box each, one at a time from the top of the leaderboard down | the prize name | the boxes open one after another, prize names in large type |
| 10 | Press **End session** | back to the waiting screen | back to the waiting screen |

**Visitors struggling to scan?** Click the QR code — on the control desk or on
the big screen — to blow it up full screen. Click anywhere or press `Esc` to
close.

### The Wi-Fi code

The game only exists on the local network, so a phone on mobile data that scans
the join code lands on a browser error, not on the quiz. Once the **Wi-Fi** tab
(`#/admin/wifi`) has a network saved, the lobby screen and the home page stop
showing one code and show two numbered ones instead: **01 · Join the Wi-Fi**,
then **02 · Scan to play**.

On that page:

- **Pick the network from the list at the bottom**, which fills the name in for
  you — the spelling has to be exact, and a hand-typed `open day` will not find
  `Open Day`. The list comes from the **computer running the server**, not from
  the laptop you are reading the admin page on, which is the right one to ask:
  that is the machine visitors have to end up next to on the network.
- On macOS the list is **the networks that computer has joined before**, not the
  ones in range. Since Sonoma, macOS only tells a program the names of nearby
  networks if it has been granted Location Services, and a server started from a
  terminal has not been — every name comes back as `<redacted>`, which is worse
  than useless in a QR code. The remembered list needs no permission and gives
  real names. On Linux and Windows it is a live scan.
- **Type the name yourself** if the network is hidden, or if the list came back
  empty. The box above the list is what actually gets saved; the list only fills
  it in.
- **The password has to be typed.** No operating system hands a stored Wi-Fi
  password back to a program that asks for it. Leave it empty for an open
  network and the code says so instead of asking for one.
- Scanning the finished code connects the phone to the network outright. The
  camera app does it on iOS 11+ and on Android 10+; older phones may need the QR
  reader in the browser, or the name and password, which is why both are printed
  under the code in large type.
- The password is shown in the clear on this page, because two minutes later it
  is on the projector in large letters. Do not put a staff network in there — use
  the guest network the stand hands out anyway.
- **Show no Wi-Fi code** empties both boxes: the screens go back to a single join
  code.
- The codes are drawn from what was saved when the screen was opened, so a
  network changed mid-event needs the projector page reloaded.

Control commands come from the control desk, with one exception: the big screen
has its own **Start the quiz** button under the QR code, so the host standing at
the screen does not have to walk back to the laptop to begin. It is greyed out
until the first player has joined, and it is the only button on the projector —
everything after the start still comes from the desk. Phones only send answers
and the prize pick. Every change goes through the server, so the three screens
always agree — the projector can never be on question 3 while the phones are
still on question 2.

When time runs out the **server** closes the question, not the admin tab. The
admin locking their screen or closing the tab mid-round does not hang the game;
reopening shows the current state.

### Auto mode

**Auto mode is on by default**, because at a stand nobody is watching the
laptop. The round runs itself: the question closes when its clock runs out, the
answer stays up for 6 seconds, the standings for 8, and then the next question
starts — all the way to the final results and the winner being announced.

The **Auto on / Auto off** button sits next to the state badge on the control
desk. Switch it off if you want to talk the hall through each answer yourself.

- It can be switched on and off at any moment, including mid-question, and the
  choice carries over to the next round.
- Steps 4 to 8 of the table above happen by themselves. The buttons keep
  working: pressing **Show standings** or **Next question** during a pause goes
  now instead of waiting.
- **Auto runs to the prizes.** The final results stay up for 10 seconds and then
  the winners are announced by themselves. It stops for two things only: a **tie
  across the winning line**, where the desk asks you to fill the last slots from
  the tied names (auto will not choose for you), and the **prize boxes**, which
  are the winners' to tap. Ending the session is still yours to press.
- The pause is timed by the server, so it is the same on every screen.

## The top 10 after each question

After the answer has been shown, the round stops on its **own screen**: the ten
best players, on the phones and on the big screen at the same moment. It is not a
static list — it appears in the order it had **before** the question, each score
climbs from its old value to the new one, and then the rows slide past each other
into their new places. Next to every rank is how many places that player just
gained or lost and the rank they came from ("was 4"). A player outside the ten
sees their own rank spelled out above the board.

The very first question has no "before" to compare with, so there the rows carry
no move and the scores simply count up from zero. Somebody who joined late, or
who has just climbed into the ten, slides in from the bottom edge with no move
marked either.

In auto mode the board stays up for 8 seconds and the movement takes about 2 of
them, so nobody has to hold anything back. Press **Next question** to go sooner,
or switch auto mode off to talk the hall through the changes.

## Scoring

- Correct answer: **1000 points** plus a speed bonus of up to **500**, decreasing
  linearly with the time used. Answering instantly scores 1500, answering just
  before the buzzer scores about 1000.
- Wrong or too late: **0 points**.
- **Equal scores share a rank.** Two people on 3200 are both 2nd and the row
  under them is 4th; nobody is pushed down a place for a fraction of a second
  they cannot see.
- The list is still **ordered** by total answering time within an equal score,
  and that is what hands out the prizes: of the players sharing a place, the
  faster one takes the winning slot, automatically.
- Equal on score **and** total time, either side of the line between winning and
  not, is the one case the round cannot decide, so the control desk lists those
  names and the admin taps who fills the last slots.
- Every board a visitor sees stops at **ten rows** — on the phone and on the big
  screen. Below tenth place you are shown your own rank and nothing about
  anybody else. The control desk keeps the full list, since the host needs it.

Scoring by speed is deliberate: a round is only about 5 questions, and scoring
1 point per question leaves a crowd of people tied with no way to pick the few
winners a prize is handed to.

## How many people win

Set **Winners per round** in the quiz editor: between 1 and 5, saved with the
quiz. It is a property of the quiz rather than a switch on the control desk, so
whoever runs the stand does not have to remember the number of prizes you brought
while a hall is watching. The top players of the final leaderboard win, in order.

A round never hands out more prizes than it has players, so a quiz asking for 3
winners in front of 3 people simply makes everybody a winner.

## The three prize boxes

Each winner gets **their own three boxes**, reshuffled separately, so nobody can
guess what is in which and nobody is left with whatever the person before them
did not take. They open them **one at a time, from the top of the leaderboard
down**: a winner further down the list sees their boxes but cannot tap until the
winners above them are done, and their phone says whose turn it is.

Tapping a box unwraps it — on the phone and on the big screen at the same time.
The other two boxes disappear, the chosen one slides to the middle of its row and
grows, fireworks go off, and the prize inside comes out with its name and a line
describing it. The big screen keeps every winner on show throughout, so an opened
box stays up while the next winner takes their turn.

Edit the prize list in
[src/common/session/models/PrizeBoxes.js](../src/common/session/models/PrizeBoxes.js),
constant `PRIZES`: three entries of `{ id, name, description }`. The id is what a
box stores, so keep it stable; if you add a prize, give
`PRIZE_ICONS` in [src/common/views/PrizeBox.jsx](../src/common/views/PrizeBox.jsx)
a lucide icon for it (unknown ids fall back to the gift icon).

## What the visitors thought

Once the round reaches the final leaderboard, every phone that played gets a
**How was it?** card at the foot of the screen: five stars and an optional
sentence. It stays there through the prize handing-out, which is when most people
are still holding their phone and waiting, so that is when most answers arrive.

Read them on the **Feedback** tab (`#/admin/feedback`): how many answered, the
average out of five, how the ratings split, and every comment with the name and
animal that left it. The page does not update by itself — press **Refresh** to
pull in what has come in since you opened it.

A phone can send once and change its mind afterwards; the second answer replaces
the first, so nobody can vote twice. Answers survive a restart of the server
(they are kept in `server/feedback.json`), unlike the round in progress. **Clear**
throws the whole lot away — worth doing between two event days, and there is no
copy anywhere else, which is why it asks first.

## Troubleshooting

**A visitor mistyped their name, or wants a different animal.** On the waiting
screen there is a **Change name or animal** button: it hands the seat back and
brings up the join form again, with the animal returned to the pool. Reloading
the page does the same thing. Both only work **before you press Start** — once
the first question is out, the choice is final for that round.

**A visitor's phone locked or got refreshed.** Once the game is running,
reopening the URL brings back the same person with their score intact — as long
as it is still the same session. The identity is stored in that device's
`localStorage` together with the id of the session it belongs to. In the lobby a
reload deliberately does the opposite and starts over, which is what the point
above is about.

**Handing one phone to the next visitor.** Nothing to do: opening a new session
makes every phone ask for a name and an animal again, whatever it played as last
round. This is deliberate — one device at a stand is played by a stream of
different people.

**"I can only see twelve animals."** The join form starts with twelve so that the
whole thing fits on one phone screen. **Show all 50 animals** opens the rest, and
**Show fewer** closes it again.

**"The animal I wanted is greyed out."** Each animal belongs to one player per
round — somebody got there first. The locked ones stay visible with a padlock so
it is obvious what happened; any of the others is free. If the person holding it
is still in the lobby and presses **Change name or animal**, it comes back.

**"Somebody took that animal first. Pick another one."** Two phones tapped the
same animal within the same instant and only one could have it. Tap a different
one and join again — nothing else is lost.

**A phone says the round is full.** There are 50 animals and each of them belongs
to one player, so 50 is the ceiling for a single round. There is no way round it
on the day; the fix is to add more animations before the next one, which
[docs/credits.md](credits.md) explains.

**Change name or animal does nothing, or the animal stays locked after
leaving.** The page is talking to a server that predates the feature. Stop it and
run `npm run dev` (or `npm run start`) again: `npm run dev` reloads the pages
whenever you edit them, but the game server it mounts alongside them is a Node
module loaded once at startup, so changes under `server/` only take effect on a
restart.

**A phone shows the black "Lost connection to the server" banner.** That device
dropped off the wifi, or the server is down. Nothing to do — the page reconnects
and the banner disappears by itself. If the whole room shows it, check the wifi
on the machine running the server.

**The server was stopped mid-round (Ctrl+C, power cut).** The state is RAM-only,
so the round in progress is gone. Run `npm run serve` again and open a new
session from `#/admin`. The new session gets a new id, so every phone shows the
join form again — the scores and the names from the old round cannot be
recovered.

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
