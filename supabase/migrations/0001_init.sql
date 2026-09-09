-- Hangout Switch — core schema
-- Tables: questions (content), rooms (shared game state), players (roster)

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- questions
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('friends', 'couples')),
  mini_game text not null,
  intensity text not null check (intensity in ('low', 'medium', 'high')),
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists questions_lookup_idx
  on public.questions (mode, mini_game, intensity);

-- ---------------------------------------------------------------------------
-- rooms
-- ---------------------------------------------------------------------------
create table if not exists public.rooms (
  code text primary key,
  mode text not null default 'friends' check (mode in ('friends', 'couples')),
  intensity text not null default 'low' check (intensity in ('low', 'medium', 'high')),
  current_mini_game text,
  current_question_id uuid references public.questions(id),
  current_question_text text,
  round integer not null default 0,
  played_question_ids uuid[] not null default '{}',
  played_question_texts text[] not null default '{}',
  host_id uuid,
  locked boolean not null default false,
  passcode_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- players
-- ---------------------------------------------------------------------------
create table if not exists public.players (
  id uuid primary key,
  room_code text not null references public.rooms(code) on delete cascade,
  name text not null,
  avatar_id text not null default 'fox',
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists players_room_idx on public.players (room_code);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.questions enable row level security;
alter table public.rooms enable row level security;
alter table public.players enable row level security;

-- Public read access (required for the app to load questions, and for
-- realtime postgres_changes subscriptions on rooms/players, which are
-- filtered through these same SELECT policies).
drop policy if exists "questions_public_read" on public.questions;
create policy "questions_public_read" on public.questions
  for select using (true);

drop policy if exists "rooms_public_read" on public.rooms;
create policy "rooms_public_read" on public.rooms
  for select using (true);

drop policy if exists "players_public_read" on public.players;
create policy "players_public_read" on public.players
  for select using (true);

-- No insert/update/delete policies are defined for anon/authenticated on
-- rooms or players — with RLS enabled, that means those operations are
-- denied by default. All mutations go through the SECURITY DEFINER
-- functions below, which run with the privileges of their owner and
-- perform their own host/passcode checks.

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;
