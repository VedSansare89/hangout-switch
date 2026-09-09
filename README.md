# Hangout Switch

A conversation-first party game for friends and couples. Pick a mode, set the intensity, take turns as Host, and play through a deck of mini-games — solo on one phone, or together in a synced multiplayer Room.

## Features

- **Two modes** — Friends Mode and Couples Mode, each with their own mini-game lineup and color theme.
- **Three intensity levels** — Chill, Fun, and Spicy, filtering which prompts show up. Switch anytime, mid-game.
- **Nine mini-games** across both modes — Would You Rather, Two Truths and a Lie, Never Have I Ever, Most Likely To, Rapid Fire, Charades, Truth or Dare, How Well Do You Know Me, and Intimate Questions.
- **A large question bank** (1,000+ prompts, seeded into Postgres) organized by mode × mini-game × intensity, structured so more can be added with a plain SQL insert.
- **Player names + avatars** — pick a name and one of 12 avatars; it shows up everywhere you play, solo or in a Room.
- **Session history** — every question shown this session is tracked so nothing repeats until you reset it, with a "Previously Played" view.
- **Create Room + share link** — a Host creates a room, gets a short code and link (`/r/ABCDE`), and everyone who joins sees the same question at the same time, synced in real time over **Supabase Realtime**. Only the Host can change mode, intensity, or the mini-game — enforced server-side by Postgres functions, not just hidden in the UI. Rooms can be locked with a 4-digit passcode (stored hashed).
- **Mood Selector & Random Mode** — one-tap presets (Chill Night, Party Night, Date Night) or a full "Surprise Me" that randomizes mode, intensity, and mini-game.
- **Daily Featured Pack** — five prompts that are the same for everyone on a given day, and change the next.
- **Confetti + optional sound effects** — a burst when you switch to Spicy, and lightweight click/new-question tones with an on/off toggle.
- **PWA-ready** — installable to a phone home screen (manifest, icons, offline-friendly service worker, install prompt).
- **Local-first solo play** — solo mode reads its question bank from a bundled TypeScript file, so it works instantly and offline; only the Room feature talks to Supabase.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui-style components · Framer Motion · Lucide React · **Supabase** (Postgres + Realtime) via `@supabase/supabase-js`

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3040](http://localhost:3040).

Solo play, Mood Selector, Random Mode, the question bank, avatars, and session history all work immediately — no backend setup needed.

### Setting up Supabase for the Room feature

Create Room / Join Room needs a Supabase project. Everything below fits comfortably in the **Free** plan.

1. Create a project at [supabase.com](https://supabase.com) (or via `npx supabase projects create`).
2. Run the schema against it — from the Supabase SQL Editor, paste and run, in order:
   - `supabase/migrations/0001_init.sql` (tables, RLS, realtime)
   - `supabase/migrations/0002_functions.sql` (the RPC functions that own every write)
   - `supabase/seed.sql` (the question bank — 1,215 rows)

   Or, with the Supabase CLI linked to your project (`npx supabase link --project-ref <ref>`):
   ```bash
   npx supabase db push               # applies the migrations
   npx supabase db execute -f supabase/seed.sql
   ```
3. Copy `.env.example` to `.env.local` and fill in your project's URL and anon key (Settings → API in the dashboard):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart `npm run dev`. Tap **Create Room** and share the code or link with another tab/device.

For production, add the same two environment variables to your Vercel project settings and redeploy — no separate backend deploy step, since Supabase is already hosted.

### Regenerating the seed file

If you edit `src/lib/questions-data/friends.ts` or `couples.ts`, regenerate `supabase/seed.sql` from them (rather than hand-editing the SQL) and re-run it against your project — see the generator pattern used originally, or just hand-write new `insert into public.questions (...) values (...)` rows for the additions.

## Project structure

```
supabase/
  migrations/
    0001_init.sql        Tables (questions, rooms, players), RLS policies, realtime
    0002_functions.sql   RPC functions — every room mutation goes through one of
                          these (SECURITY DEFINER), which enforce host-only actions
                          and passcode checks server-side
  seed.sql                The question bank, generated from src/lib/questions-data/

src/
  app/                   Routes, layout, metadata, PWA manifest
    r/[code]/            Deep link for joining a room by URL
  components/
    screens/             Home, Setup, Game, Create Room, Join Room, Room screens
    ui/                  Reusable button/card/dialog/badge primitives
    *.tsx                Domain components (question card, mini-game picker,
                          avatar picker, player list, top bar, etc.)
  hooks/
    use-room.ts          Subscribes to a room's realtime Postgres changes,
                          plus a heartbeat + host-failover watchdog
  lib/
    supabase-client.ts    The Supabase JS client (browser-safe anon key)
    room-actions.ts         Typed wrappers around every room RPC call
    room-types.ts             `RoomRow` / `PlayerRow` — mirror the DB schema
    room-code.ts                Room code generation
    types.ts                     Core TypeScript types
    mini-games.ts                  Mini-game metadata
    questions-data/                  The local question bank (solo play), split by
                                      mode (friends.ts / couples.ts) — also the
                                      source seed.sql is generated from
    questions.ts                       Pool lookup + no-repeat-this-session helpers
    daily-pack.ts                        Deterministic "question of the day" picker
    avatars.ts, player.ts                  Avatar options + persistent player identity
    intensity.ts, mode-theme.ts              Color themes
```

To add more prompts to **solo play**, extend the arrays in `src/lib/questions-data/friends.ts` or `couples.ts`. To add them to **Room play** too, insert matching rows into the `questions` table in Supabase (or regenerate and re-run `seed.sql`).
