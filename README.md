# Hangout Switch

A conversation-first party game for friends and couples. Pick a mode, set the intensity, take turns as Host, and play through a deck of mini-games — solo on one phone, or together in a synced multiplayer Room.

## Features

- **Two modes** — Friends Mode and Couples Mode, each with their own mini-game lineup and color theme.
- **Three intensity levels** — Chill, Fun, and Spicy, filtering which prompts show up. Switch anytime, mid-game.
- **Nine mini-games** across both modes — Would You Rather, Two Truths and a Lie, Never Have I Ever, Most Likely To, Rapid Fire, Charades, Truth or Dare, How Well Do You Know Me, and Intimate Questions.
- **A large, hand-written question bank** (1,000+ prompts) organized by mode × mini-game × intensity, structured so more can be added easily.
- **Player names + avatars** — pick a name and one of 12 avatars; it shows up everywhere you play, solo or in a Room.
- **Session history** — every question shown this session is tracked so nothing repeats until you reset it, with a "Previously Played" view.
- **Create Room + share link** — a Host creates a room, gets a short code and link (`/r/ABCDE`), and everyone who joins sees the same question at the same time, synced in real time over [PartyKit](https://www.partykit.io). Only the Host can change mode, intensity, or the mini-game. Rooms can be locked with a 4-digit passcode.
- **Mood Selector & Random Mode** — one-tap presets (Chill Night, Party Night, Date Night) or a full "Surprise Me" that randomizes mode, intensity, and mini-game.
- **Daily Featured Pack** — five prompts that are the same for everyone on a given day, and change the next.
- **Confetti + optional sound effects** — a burst when you switch to Spicy, and lightweight click/new-question tones with an on/off toggle.
- **PWA-ready** — installable to a phone home screen (manifest, icons, offline-friendly service worker, install prompt).
- **Local-first** — solo play needs no backend at all; progress persists to `localStorage` so a refresh doesn't lose your round.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui-style components · Framer Motion · Lucide React · [PartyKit](https://www.partykit.io) + `partysocket` for realtime rooms

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3040](http://localhost:3040).

Solo play, Mood Selector, Random Mode, the question bank, avatars, and session history all work immediately — no extra setup.

### Running the multiplayer Room feature locally

Create Room / Join Room needs the PartyKit realtime server running alongside Next.js. In a **second terminal**:

```bash
npm run party:dev
```

This starts a local PartyKit server on `ws://127.0.0.1:1999` (already wired up via `.env.local`). With both `npm run dev` and `npm run party:dev` running, open the app, tap **Create Room**, and share the code or link with another tab/device on the same machine or network.

### Deploying the Room feature

The Next.js app can deploy anywhere (e.g. Vercel) on its own — solo play doesn't need the steps below. To make **Create Room** work for real users:

1. `npx partykit login` (one-time; creates a free PartyKit account via GitHub).
2. `npm run party:deploy` — deploys `party/index.ts` to `<project>.<your-partykit-username>.partykit.dev`.
3. Set `NEXT_PUBLIC_PARTYKIT_HOST` in your Next.js deployment's environment variables to that host (see `.env.example`), then redeploy the app.

## Project structure

```
party/
  index.ts              PartyKit realtime server — one Room per room code,
                         owns the shared game state and enforces host-only actions

src/
  app/                   Routes, layout, metadata, PWA manifest
    r/[code]/            Deep link for joining a room by URL
  components/
    screens/             Home, Setup, Game, Create Room, Join Room, Room screens
    ui/                  Reusable button/card/dialog/badge primitives
    *.tsx                Domain components (question card, mini-game picker,
                          avatar picker, player list, top bar, etc.)
  hooks/
    use-room.ts          Client-side realtime room connection (wraps partysocket)
  lib/
    types.ts             Core TypeScript types
    mini-games.ts         Mini-game metadata
    questions-data/        The question bank, split by mode (friends.ts / couples.ts)
    questions.ts            Pool lookup + randomization (no-repeat-this-session) helpers
    daily-pack.ts             Deterministic "question of the day" picker
    room-types.ts               Shared client/server types for the realtime protocol
    room-code.ts                  Room code generation
    avatars.ts, player.ts           Avatar options + persistent player identity
    intensity.ts, mode-theme.ts       Color themes
```

To add more prompts, extend the arrays in `src/lib/questions-data/friends.ts` or `couples.ts` — no other code changes needed.
