## Project Overview

This project is a prototype web application for a university Open Day event.

Visitors scan a QR code to join a live quiz game on their phones, while the game is displayed on a large screen. An administrator manages questions, controls the game flow, and announces winners.

This is a prototype intended for demonstration purposes rather than a production-ready application.

---

# Main Features

## Admin Panel

* Create, edit and delete quiz games
* Manage questions and answers
* Start and stop game sessions
* Display QR code for joining
* Control game flow
* View connected players
* View leaderboard
* Announce winner

---

## Player

* Join via QR Code
* Enter player name
* Wait in lobby
* Answer quiz questions
* Receive score updates
* View leaderboard
* Winner can choose one of three mystery prize boxes

---

## Display Screen

Designed for a projector or large monitor.

Shows:

* Lobby
* QR Code
* Player count
* Current question
* Countdown timer
* Live leaderboard
* Winner screen
* Three mystery prize boxes

---

# Prize Boxes

When the winner is announced:

* Display three mystery boxes.
* The position of each prize should be randomized every game.
* The winner selects one box.
* Reveal the selected prize with a simple animation.

Example prizes:

* Course Magnet
* Personalized FabLab Sticker
* 3D Printed Figure

---

# General Rules

* Keep the UI clean and minimal.
* White background with university-style design.
* Responsive for desktop and mobile.
* Prioritize readability over visual effects.
* Keep animations lightweight.

---

# State Management

Keep state simple.

Only introduce additional complexity when necessary.

---

# Performance

Because this is a prototype:

* Simplicity is preferred over optimization.
* Avoid unnecessary abstractions.
* Do not over-engineer.

---

# Deliverables

The final project should include:

* Source code
* Installation guide — [docs/installation.md](docs/installation.md)
* Usage guide — [docs/usage.md](docs/usage.md)
* Architecture documentation — [docs/architecture.md](docs/architecture.md)

Build plan and open decisions: [docs/plan.md](docs/plan.md).

---

# Development Philosophy

This project values:

* simplicity
* maintainability
* clean architecture
* readable code

When multiple implementations are possible, choose the simplest solution that satisfies the requirements.
