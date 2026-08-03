# Open Day Quiz

A live quiz web app for a university Open Day.

Visitors scan a QR code and join on their phones, the game is shown on a big
screen, and the administrator writes the questions and drives the round. Each
winner picks 1 of 3 mystery prize boxes.

This is a **demo prototype**, not a production product.

**Stack:** Vite 8 + React 19 + plain JavaScript + Tailwind CSS v4, plus a small
Node server written with `node:http` (no express, no socket.io, no database).
The whole interface is **black, white and grey**; the one exception is the
players' animal avatars, which play in full colour.

---

## 1. Installation and running

### 1.1. Prerequisites

| Requirement | Version | Notes |
| --- | --- | --- |
| Node.js | 20.19+ or 22.12+ | Vite 8 does not run on anything older |
| npm | ships with Node | |
| Browser | recent Chrome / Edge / Safari | needs `localStorage` and `EventSource` |
| Wifi | computer and phones on **the same network** | see section 1.5 |

No database to install, no internet connection needed, and nothing to configure
before the first run.

### 1.2. Install

Install Node.js (from the terminal or straight from
[nodejs.org](https://nodejs.org)), then:

```bash
git clone <repo-url>
cd open-day-quiz
npm install          # install the required packages
```

### 1.3. Run

```bash
npm run start        # build, then run the server on port 3000 — use this for a real round
```

The server prints three URLs; **copy these links to reach the app**. For
example:

```
Game server running.

  Control desk   http://192.168.1.20:3000/#/admin
  Big screen     http://192.168.1.20:3000/#/display
  Player         http://192.168.1.20:3000/#/play
```

`192.168.1.20` is only an example — the IP address is looked up at runtime, so
every machine and every network produces a different one. Use the address your
own terminal prints.

> **Important:** use that IP address on **every** screen, the projector
> included. The QR code is generated from whatever address the page was opened
> with — open it via `localhost` and the QR code points at `localhost`, which no
> phone can reach.

### 1.4. Other commands

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server + HMR, reachable from this machine only (port 5173) |
| `npm run dev:lan` | same but open to the LAN — phones can scan the QR, HMR still works |
| `npm run start` | build, then run the game server on port 3000 |
| `npm run serve` | run the server against an existing `dist/` (`PORT=8080` to change the port) |
| `npm run build` | production build into `dist/` |
| `npm run lint` | check the code with oxlint |

The session API is already plugged into the dev server, so `npm run dev` needs no
second process.

### 1.5. Networking

- Visitors' phones must be on **the same wifi** as the machine running the
  server. People on 4G cannot join.
- Some public wifi networks turn on "client isolation" (devices cannot talk to
  each other) — a phone scanning the QR then fails to open the page. Scan it with
  one phone **before** the event to catch that early.
- The round's state lives in RAM only: stopping the server mid-round loses the
  round in progress. The quizzes, images and home page text are written to files,
  so those survive.

---

## 2. The pages

The app routes on `location.hash`, so every URL has the form `#/...`:

| Page | URL | Runs on |
| --- | --- | --- |
| Home | `#/` | any machine |
| Quiz list | `#/admin` | the host's laptop |
| Quiz editor | `#/admin/quiz/<id>` | the host's laptop |
| Control desk | `#/admin/live` | the host's laptop |
| Home page text | `#/admin/home` | the host's laptop |
| Player | `#/play` | visitors' phones (via QR) |
| Big screen | `#/display` | the machine driving the projector |

The four `#/admin/*` pages are **behind a password**; `#/play` and `#/display`
are not, since those are the two everybody in the room is meant to reach.

---

## 3. Using the app

### 3.1. Home page

The home page carries the basic information about the app: the event title, an
intro paragraph, the three steps of how to play, the prize teaser, and the state
of the current session. The links on it lead to the player page and the big
screen.

All of the text on the home page **is editable from the admin area**
(`#/admin/home`) — see section 3.3.

### 3.2. The admin password

The **first** time anybody opens an admin page on a fresh installation, the app
asks you to **set** a password (at least 6 characters) rather than to type one.
From then on:

- The password is hashed with **scrypt** and only the hash is written to the
  `.env` file (the `ADMIN_PASSWORD_HASH` variable) on the machine running the
  server. The password itself is stored nowhere, and `.env` is gitignored.
- Every admin browser types it once. The server hands back a token, which the
  browser keeps in `localStorage` and reuses on later visits. The token is valid
  for **12 hours**, or until the server restarts — restarting the server signs
  every admin browser out.
- The first-run screen never comes back: once a password exists, the server
  refuses to set another one.
- **Forgotten it?** Delete the `ADMIN_PASSWORD_HASH=` line from `.env`, restart
  the server and reload the page — the first-run screen returns so you can set a
  new password.

The server refuses to save a quiz or accept an image without that token. Note
that the commands driving a running round (start / reveal / next) travel the same
channel the phones use and are **not** password-checked — so do not put the admin
URL on the projector.

### 3.3. Admin — writing the content

**Quiz list (`#/admin`)**

- Create a quiz, open one to edit, delete a quiz, see the whole list.
- Each quiz shows its question count, total duration, and whether it is
  "playable" yet.
- From here, **open a session** to start a new round for the chosen quiz.

Quizzes are stored on the server (`server/quizzes.json`), so any machine that can
reach the server sees the same list.

**Quiz editor (`#/admin/quiz/<id>`)**

- Set the quiz title, add / edit / delete questions, reorder them (the order in
  the list is the order they are played in).
- Each question has **2 to 4 options** and one correct answer.
- **Countdown: 5–120 seconds** (20 by default). The "countdown for every
  question" field at the top sets the whole set at once; the field under each
  question sets that one alone. The quiz-wide field reads "Mixed" once the
  questions no longer agree.
- **Winners per round: 1–5** (1 by default) — how many people the round hands a
  prize to at the end.
- **Images:** every question can carry one image, and **so can every option** —
  which makes "which building is this?" questions with four photos to choose from
  possible. jpg / png / webp / gif, up to 2MB, written to `server/uploads/`.
- **Nothing auto-saves.** Data only reaches the server when you press **Save**
  and confirm it in the dialog; until then the badge next to the button reads
  "Unsaved changes" and closing the tab asks you first.
- A quiz has to be "playable" before a session can open: it needs a title, at
  least one question, and every question needs content (text or image) plus a
  correct answer. The admin page lists exactly what is missing.

**Home page text (`#/admin/home`)**

- Edit all of the wording on the home page: the title, the intro, the marquee,
  the three steps, the prize section, the footer.
- Saves the same way as the quiz editor (you have to press Save).
- **Emptying a field puts the original wording back.**
- The text is stored in `server/home.json`; the next visitor to open the home
  page reads the new wording, while phones already sitting on it need a reload.

### 3.4. Control desk (`#/admin/live`)

This is where a running round is driven:

1. **Open the lobby** for a quiz — every open is a completely new session.
2. The page shows the **join link and QR code**, plus the list of players who
   have joined (name + avatar), updating instantly.
3. **Start** once enough people are in. A round needs **at least 3 players** and
   a valid quiz; pressing Start too early brings up a dialog saying so.
4. During play the control desk shows the current question, how many have
   answered, the tally per option, and the buttons **Reveal** (show the answer) →
   **Next** (mid-round standings) → **Next** (next question).
5. After the last question comes the **final leaderboard**. If people are tied
   with no way to separate them right where the prizes run out, the control desk
   lists them so the host can **pick by hand** who fills the last slots.
6. **Prize giving:** each winner picks a box on their own phone, one at a time
   from the top of the leaderboard down, and the prizes appear on the big
   screen.
7. **End the session** to play another round.

**The Auto button** (on by default) lets the round walk itself from step to step
with nobody pressing anything:

| Step | Moves on after |
| --- | --- |
| Question | its own countdown running out |
| Revealed answer | 6 seconds |
| Mid-round standings | 8 seconds |
| Final leaderboard | 10 seconds |

Auto deliberately does **not** do three things: open the lobby, start the round,
or announce the winner when there is an unresolvable tie at the top — those need
a human decision. The prize step also always waits for the winner to tap.

Turn Auto off when the host wants to talk between questions.

### 3.5. Big screen (`#/display`)

The page for a projector or large monitor: very large type, readable from a
distance. Open it on the projector and leave it there — it follows the round by
itself:

- **Idle:** a note that no session is open.
- **Lobby:** a large QR code, the number of players and a wall of their avatars.
- **Question:** the prompt, its image, the options, the countdown plus a bar
  draining next to it, and how many have answered.
- **Reveal:** the correct answer marked, and how many people picked each option.
- **Standings:** the top 10, each row showing how many places that player moved
  since the previous question.
- **Final leaderboard:** the summary and the winners.
- **Prize:** every winner's three mystery boxes, then the prize openings.

### 3.6. Player page (`#/play`)

Where visitors play, on their phones:

1. **Scan the QR code** on the big screen — nothing to install.
2. **Type a name** and **pick an animal** as an avatar. There are 50 animals
   (Lottie animations, animated and in colour). The picker opens with the first
   12 and a "Show all" button for the rest.
3. **One animal belongs to one player per session**, first come first served. An
   animal somebody already holds is shown locked (dashed border + padlock) rather
   than hidden. If two people tap the same one at the same instant, the second is
   sent back to the form to pick again.
4. Then the lobby, waiting for the host to start. In the lobby you can still
   **change your name or animal**; once the round starts you cannot change or
   leave, because by then the player has a score.
5. **Answering:** tap an option — once per question, and before time is up.
6. After each question the phone shows right/wrong, the points just earned, your
   own rank and the top 10.
7. **Each winner** is invited to pick 1 of 3 prize boxes on their own phone,
   when their turn comes round.

**A screen lock, a reload or a wifi drop costs nobody their points:** the phone
remembers the player identity and rejoins in the same seat. But that identity
lives for **one session only** — in a new session that phone starts again from
the join form, so the next visitor does not inherit the previous one's seat.

---

## 4. Game rules and scoring

### 4.1. How a session runs

```
idle → lobby → question → reveal → standings → question → ... → podium → prize → prizeRevealed
                  ↑                                 │
                  └─────────────────────────────────┘
```

- `idle` — no session open.
- `lobby` — the QR code is up and people are joining.
- `question` — a question with its clock running.
- `reveal` — the correct answer plus the tally of what people picked.
- `standings` — the top 10 between two questions.
- `podium` — the final leaderboard.
- `prize` — the winners pick a box each, in rank order.
- `prizeRevealed` — the prize is open.

The server is the single source of truth: every device only sends intents, the
server applies the rules and broadcasts the full state to the whole room over
SSE. That is what keeps the phones and the projector switching screens at the
same moment.

Joining late mid-round is allowed: Open Day visitors turn up in dribs and drabs,
and a latecomer only misses the points of the questions already played.

### 4.2. Scoring

**A correct answer = 1000 base points + up to 500 speed bonus.**

The bonus is proportional to the time left:

```
points = 1000 + round(500 × (1 − time_taken / time_allowed))
```

- A wrong answer or no answer: **0 points**.
- Answering instantly: close to 1500 points. Answering at the last second: about
  1000.

Why not 1 point per question: an Open Day round is only about 5 questions, and
scoring that way leaves a crowd of people tied with no way to pick the few
winners a prize is handed to.

### 4.3. Ranking and ties

- **Equal scores share a rank.** Two people on 3200 are both 2nd, and the row
  under them is 4th (not 3rd).
- In the list the faster player still comes first, but does not get a better rank
  number for it.
- **Total answering time decides the prizes:** among the players sharing a place,
  the faster one takes the winning slot without the admin doing anything.
- Only an exact tie on **score and total time**, falling right where the prizes
  run out, is a real tie — Auto stops there and the admin picks from the control
  desk.
- Every public board (mid-round and final) shows the **top 10**. Players outside
  the top 10 still see their own rank on their phone.

### 4.4. What Start waits for

- A valid quiz: a title, at least one question, and every question with content
  and a correct answer.
- **At least 3 players** in the lobby.

### 4.5. How many people win

The quiz says so: **Winners per round** in the quiz editor, between 1 and 5. The
top of the final leaderboard wins, in order. A round never hands out more prizes
than it has players.

### 4.6. The mystery prize boxes

When the winners are announced, three boxes appear for each of them:

| Prize | Description |
| --- | --- |
| Course Magnet | a fridge magnet with the course logo on it |
| FabLab Sticker | a vinyl sticker cut in the university FabLab |
| 3D Printed Figure | a small mascot printed on a lab 3D printer |

- The positions are **reshuffled for every winner** with the Fisher–Yates
  algorithm, so nobody can guess what is in which.
- Only a winner may pick, only **once** — no changing your mind — and only when
  it is their turn.
- The chosen box opens on that winner's phone and on the big screen alike, and
  the big screen keeps every winner on show while the next one takes their turn.

---

## 5. Documentation

- [docs/installation.md](docs/installation.md) — install, run, deploy
- [docs/usage.md](docs/usage.md) — running a round, troubleshooting
- [docs/architecture.md](docs/architecture.md) — MVC per feature, the state
  machine, the realtime seam
- [docs/plan.md](docs/plan.md) — the phase-by-phase build plan
- [docs/credits.md](docs/credits.md) — sources and authors of the avatar
  animations
