# Installation guide

## Prerequisites

| Requirement | Version | Notes |
| --- | --- | --- |
| Node.js | 20.19+ or 22.12+ | Vite 8 does not run on anything older |
| npm | ships with Node | |
| Browser | recent Chrome / Edge / Safari | Needs `localStorage` and `EventSource` |
| Wifi | computer and phones on **the same network** | see the last section |

No database, no internet connection, and nothing to configure before the first
run. The game server is a single Node process that ships with the repo and adds
no dependencies.

The one environment variable, `ADMIN_PASSWORD_HASH`, writes itself: the first
time you open `#/admin` the page asks for an admin password, hashes it and puts
the hash into `.env` for you. See [.env.example](../.env.example) and the admin
password section of [usage.md](usage.md).

## Install

```bash
git clone <repo-url>
cd open-day-quiz
npm install
```

## Running while developing

```bash
npm run dev       # http://localhost:5173, reachable from this machine only
```

The session API is already plugged into the dev server, so there is no second
process to start.

One quirk of setting the admin password under `npm run dev`: writing `.env` makes
Vite restart itself, which clears the tokens held in RAM, so the page asks you to
type the password you have just chosen. It happens once, on the first run only.

## Running for real (phones joining by QR code)

```bash
npm run start     # build, then run the server on port 3000
```

It prints the three URLs for you:

```
Game server running.

  Control desk   http://192.168.1.20:3000/#/admin
  Big screen     http://192.168.1.20:3000/#/display
  Player         http://192.168.1.20:3000/#/play
```

Use that IP address on **every** screen, the projector included: the QR code is
generated from whatever address the page was opened with, so opening it via
`localhost` produces a QR code pointing at `localhost`, which no phone can reach.

To change the port: `PORT=8080 npm run serve` (use `serve` when you have already
built, to skip rebuilding).

If you want to edit code and let phones in at the same time, `npm run dev:lan`
works too — HMR still on, still a real server, just on port 5173.

## Other commands

```bash
npm run build     # production build into dist/
npm run serve     # run the server against an existing dist/
npm run preview   # preview the build with Vite
npm run lint      # oxlint
```

## Networking: the hard requirement

The phones and the machine running the server must be **able to talk to each
other on the local network**. No internet needed — no data leaves the room.

"Same wifi" is necessary but not sufficient:

| Situation | Works? |
| --- | --- |
| Laptop on ethernet, phones on wifi, same router | ✅ |
| Hotspot from one phone, laptop and visitors both on it | ✅ — the tidiest fallback |
| Same wifi name but visitors land on the "Guest" network | ❌ different subnet |
| Router has client isolation on (common on venue guest wifi) | ❌ same network, still cannot see each other |
| Visitors on 4G, not on wifi at all | ❌ |

Test it in 30 seconds: run `npm run start`, take a phone (already on that wifi)
and open the `#/play` URL the server printed. If the page loads, you are done.

If it does not, work through these in order:

1. **macOS firewall** — the first time you run it, macOS asks "Do you want the
   application node to accept incoming connections?" You must click **Allow**.
   This is the most commonly forgotten step.
2. **Client isolation** on the router. If you cannot change it, run a hotspot
   from another phone, or bring your own travel router.
3. Use the **IP address**, not `machine-name.local` — mDNS on Android is flaky.

Plain HTTP (no HTTPS) is fine here: visitors scan a QR code with their camera app
rather than typing an address, so no "not secure" warning appears.

## What about putting it on the internet

Possible, but the transport has to change: this server holds state in the RAM of
one process, which suits one machine in one room. To run it on hosting, replace
`server/` with Firebase/Supabase and adapt `SessionRepository` — see the realtime
section of [architecture.md](architecture.md).

`dist/` is a static site, so you can still deploy it to a static host, but then
there is no session server and the three screens will not stay in sync.

## Limitations to know up front

The game state is RAM-only: **stopping the server mid-round loses the round in
progress**. Start it again and open a new session — visitors' phones rejoin by
themselves because their name is stored on their own device.

The admin pages ask for a password (set on first run, hashed into `.env`), and the
server refuses to write a quiz or accept an image without it. The intents that
drive a running round are **not** password-checked — they share the open channel
the phones use — so somebody who knows the address could still interfere with a
live round. Acceptable in a hall, where the QR code only points at `#/play`, but
do not advertise the admin URL.
