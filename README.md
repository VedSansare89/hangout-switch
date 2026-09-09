# Hangout Switch

A conversation-first party game for friends and couples. Pick a mode, set the intensity, take turns as Host, and play through a deck of mini-games.

## Features

- **Two modes** — Friends Mode and Couples Mode, each with their own mini-game lineup and color theme.
- **Three intensity levels** — Chill, Fun, and Spicy, filtering which prompts show up. Switch anytime, mid-game.
- **Six mini-games per mode** — Would You Rather, Two Truths and a Lie, Never Have I Ever, and mode-specific games like Truth or Dare, Charades, and Intimate Questions.
- **A large, hand-written question bank** — organized by mode × mini-game × intensity, structured so more prompts can be added easily.
- **Local state only** — no backend, no accounts. Progress persists to `localStorage` so a refresh doesn't lose your round.
- **PWA-ready** — installable to a phone home screen, with a manifest, icons, and an offline-friendly service worker.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui-style components · Framer Motion · Lucide React

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/                Routes, layout, metadata, PWA manifest
  components/
    screens/           Home, Setup, and Game screens
    ui/                 Reusable button/card/dialog/badge primitives
    *.tsx               Domain components (question card, mini-game picker, top bar, etc.)
  lib/
    types.ts            Core TypeScript types
    mini-games.ts        Mini-game metadata
    questions-data.ts     The question bank (mode → mini-game → intensity → prompts)
    questions.ts          Pool lookup + randomization helpers
    intensity.ts           Intensity metadata and color theme
    mode-theme.ts            Mode color theme
```

To add more prompts, extend the arrays in `src/lib/questions-data.ts` — no other code changes needed.
