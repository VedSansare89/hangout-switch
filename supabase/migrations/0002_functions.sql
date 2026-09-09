-- Hangout Switch — RPC functions
-- Every write to rooms/players goes through one of these SECURITY DEFINER
-- functions so host authority and passcode checks are enforced server-side,
-- not just in the client UI.

-- ---------------------------------------------------------------------------
-- helper: draw a random unseen question, falling back to the full pool
-- ---------------------------------------------------------------------------
create or replace function public._draw_question(
  p_mode text,
  p_mini_game text,
  p_intensity text,
  p_played uuid[]
) returns table (id uuid, text text)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
    select q.id, q.text from public.questions q
    where q.mode = p_mode and q.mini_game = p_mini_game and q.intensity = p_intensity
      and q.id <> all(p_played)
    order by random()
    limit 1;

  if not found then
    return query
      select q.id, q.text from public.questions q
      where q.mode = p_mode and q.mini_game = p_mini_game and q.intensity = p_intensity
      order by random()
      limit 1;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- create_room
-- ---------------------------------------------------------------------------
create or replace function public.create_room(
  p_code text,
  p_mode text,
  p_intensity text,
  p_host_id uuid,
  p_host_name text,
  p_host_avatar text,
  p_locked boolean default false,
  p_passcode text default null
) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.rooms (code, mode, intensity, host_id, locked, passcode_hash)
  values (
    p_code, p_mode, p_intensity, p_host_id, coalesce(p_locked, false),
    case when p_locked and p_passcode is not null then crypt(p_passcode, gen_salt('bf')) else null end
  );

  insert into public.players (id, room_code, name, avatar_id, is_host, last_seen_at)
  values (p_host_id, p_code, p_host_name, p_host_avatar, true, now());
end;
$$;

grant execute on function public.create_room(text, text, text, uuid, text, text, boolean, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- join_room
-- ---------------------------------------------------------------------------
create or replace function public.join_room(
  p_code text,
  p_player_id uuid,
  p_name text,
  p_avatar_id text,
  p_passcode text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_room public.rooms;
  v_became_host boolean := false;
begin
  select * into v_room from public.rooms where code = p_code;
  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if v_room.locked and v_room.passcode_hash is not null then
    if p_passcode is null or crypt(p_passcode, v_room.passcode_hash) <> v_room.passcode_hash then
      raise exception 'WRONG_PASSCODE';
    end if;
  end if;

  insert into public.players (id, room_code, name, avatar_id, is_host, last_seen_at)
  values (p_player_id, p_code, p_name, p_avatar_id, false, now())
  on conflict (id) do update
    set room_code = excluded.room_code,
        name = excluded.name,
        avatar_id = excluded.avatar_id,
        is_host = false,
        last_seen_at = now();

  if v_room.host_id is null then
    update public.rooms set host_id = p_player_id where code = p_code;
    update public.players set is_host = true where id = p_player_id;
    v_became_host := true;
  elsif v_room.host_id = p_player_id then
    update public.players set is_host = true where id = p_player_id;
    v_became_host := true;
  end if;

  return jsonb_build_object('became_host', v_became_host);
end;
$$;

grant execute on function public.join_room(text, uuid, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- leave_room — deletes the player and hands off host if needed
-- ---------------------------------------------------------------------------
create or replace function public.leave_room(p_code text, p_player_id uuid) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_was_host boolean;
  v_next_host uuid;
begin
  select is_host into v_was_host from public.players where id = p_player_id and room_code = p_code;

  delete from public.players where id = p_player_id and room_code = p_code;

  if v_was_host then
    select id into v_next_host from public.players where room_code = p_code order by joined_at asc limit 1;
    if v_next_host is not null then
      update public.players set is_host = true where id = v_next_host;
      update public.rooms set host_id = v_next_host where code = p_code;
    else
      update public.rooms set host_id = null where code = p_code;
    end if;
  end if;
end;
$$;

grant execute on function public.leave_room(text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- heartbeat + reclaim_host — recovers a room if the host disappears
-- without clicking "Leave" (closed tab, lost connection, etc.)
-- ---------------------------------------------------------------------------
create or replace function public.heartbeat(p_code text, p_player_id uuid) returns void
language sql
security definer
set search_path = public, extensions
as $$
  update public.players set last_seen_at = now() where id = p_player_id and room_code = p_code;
$$;

grant execute on function public.heartbeat(text, uuid) to anon, authenticated;

create or replace function public.reclaim_host(p_code text, p_player_id uuid) returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_host_id uuid;
  v_host_last_seen timestamptz;
begin
  select host_id into v_host_id from public.rooms where code = p_code;

  if v_host_id is null then
    update public.rooms set host_id = p_player_id where code = p_code;
    update public.players set is_host = true where id = p_player_id;
    return true;
  end if;

  if v_host_id = p_player_id then
    return true;
  end if;

  select last_seen_at into v_host_last_seen from public.players where id = v_host_id;

  if v_host_last_seen is null or v_host_last_seen < now() - interval '25 seconds' then
    update public.rooms set host_id = p_player_id where code = p_code;
    update public.players set is_host = false where room_code = p_code;
    update public.players set is_host = true where id = p_player_id;
    return true;
  end if;

  return false;
end;
$$;

grant execute on function public.reclaim_host(text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- update_player_profile
-- ---------------------------------------------------------------------------
create or replace function public.update_player_profile(
  p_player_id uuid,
  p_name text,
  p_avatar_id text
) returns void
language sql
security definer
set search_path = public, extensions
as $$
  update public.players set name = p_name, avatar_id = p_avatar_id where id = p_player_id;
$$;

grant execute on function public.update_player_profile(uuid, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- set_mode — host only; resets the round and history
-- ---------------------------------------------------------------------------
create or replace function public.set_mode(p_code text, p_player_id uuid, p_mode text) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not exists (select 1 from public.rooms where code = p_code and host_id = p_player_id) then
    raise exception 'NOT_HOST';
  end if;

  update public.rooms set
    mode = p_mode,
    current_mini_game = null,
    current_question_id = null,
    current_question_text = null,
    round = 0,
    played_question_ids = '{}',
    played_question_texts = '{}'
  where code = p_code;
end;
$$;

grant execute on function public.set_mode(text, uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- set_intensity — host only; redraws the current question if one is active
-- ---------------------------------------------------------------------------
create or replace function public.set_intensity(p_code text, p_player_id uuid, p_intensity text) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_room public.rooms;
  v_question record;
begin
  select * into v_room from public.rooms where code = p_code;
  if v_room.host_id is distinct from p_player_id then
    raise exception 'NOT_HOST';
  end if;

  update public.rooms set intensity = p_intensity where code = p_code;

  if v_room.current_mini_game is not null then
    select * into v_question from public._draw_question(v_room.mode, v_room.current_mini_game, p_intensity, v_room.played_question_ids);

    update public.rooms set
      current_question_id = v_question.id,
      current_question_text = v_question.text,
      played_question_ids = case when v_question.id is not null
        then array_append(played_question_ids, v_question.id) else played_question_ids end,
      played_question_texts = case when v_question.text is not null
        then array_append(played_question_texts, v_question.text) else played_question_texts end
    where code = p_code;
  end if;
end;
$$;

grant execute on function public.set_intensity(text, uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- pick_mini_game — host only; draws the first question for the chosen game
-- ---------------------------------------------------------------------------
create or replace function public.pick_mini_game(p_code text, p_player_id uuid, p_mini_game text) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_room public.rooms;
  v_question record;
begin
  select * into v_room from public.rooms where code = p_code;
  if v_room.host_id is distinct from p_player_id then
    raise exception 'NOT_HOST';
  end if;

  select * into v_question from public._draw_question(v_room.mode, p_mini_game, v_room.intensity, v_room.played_question_ids);

  update public.rooms set
    current_mini_game = p_mini_game,
    current_question_id = v_question.id,
    current_question_text = v_question.text,
    round = round + 1,
    played_question_ids = case when v_question.id is not null
      then array_append(played_question_ids, v_question.id) else played_question_ids end,
    played_question_texts = case when v_question.text is not null
      then array_append(played_question_texts, v_question.text) else played_question_texts end
  where code = p_code;
end;
$$;

grant execute on function public.pick_mini_game(text, uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- next_question — host only; advances the round
-- ---------------------------------------------------------------------------
create or replace function public.next_question(p_code text, p_player_id uuid) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_room public.rooms;
  v_question record;
begin
  select * into v_room from public.rooms where code = p_code;
  if v_room.host_id is distinct from p_player_id then
    raise exception 'NOT_HOST';
  end if;
  if v_room.current_mini_game is null then
    raise exception 'NO_MINI_GAME';
  end if;

  select * into v_question from public._draw_question(v_room.mode, v_room.current_mini_game, v_room.intensity, v_room.played_question_ids);

  update public.rooms set
    current_question_id = v_question.id,
    current_question_text = v_question.text,
    round = round + 1,
    played_question_ids = case when v_question.id is not null
      then array_append(played_question_ids, v_question.id) else played_question_ids end,
    played_question_texts = case when v_question.text is not null
      then array_append(played_question_texts, v_question.text) else played_question_texts end
  where code = p_code;
end;
$$;

grant execute on function public.next_question(text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- skip_question — host only; same as next_question but doesn't bump round
-- ---------------------------------------------------------------------------
create or replace function public.skip_question(p_code text, p_player_id uuid) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_room public.rooms;
  v_question record;
begin
  select * into v_room from public.rooms where code = p_code;
  if v_room.host_id is distinct from p_player_id then
    raise exception 'NOT_HOST';
  end if;
  if v_room.current_mini_game is null then
    raise exception 'NO_MINI_GAME';
  end if;

  select * into v_question from public._draw_question(v_room.mode, v_room.current_mini_game, v_room.intensity, v_room.played_question_ids);

  update public.rooms set
    current_question_id = v_question.id,
    current_question_text = v_question.text,
    played_question_ids = case when v_question.id is not null
      then array_append(played_question_ids, v_question.id) else played_question_ids end,
    played_question_texts = case when v_question.text is not null
      then array_append(played_question_texts, v_question.text) else played_question_texts end
  where code = p_code;
end;
$$;

grant execute on function public.skip_question(text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- reset_session — host only; clears the no-repeat history
-- ---------------------------------------------------------------------------
create or replace function public.reset_session(p_code text, p_player_id uuid) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not exists (select 1 from public.rooms where code = p_code and host_id = p_player_id) then
    raise exception 'NOT_HOST';
  end if;
  update public.rooms set played_question_ids = '{}', played_question_texts = '{}' where code = p_code;
end;
$$;

grant execute on function public.reset_session(text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- set_room_lock — host only; enables/disables the 4-digit passcode
-- ---------------------------------------------------------------------------
create or replace function public.set_room_lock(
  p_code text,
  p_player_id uuid,
  p_locked boolean,
  p_passcode text default null
) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not exists (select 1 from public.rooms where code = p_code and host_id = p_player_id) then
    raise exception 'NOT_HOST';
  end if;

  update public.rooms set
    locked = p_locked,
    passcode_hash = case when p_locked and p_passcode is not null then crypt(p_passcode, gen_salt('bf')) else null end
  where code = p_code;
end;
$$;

grant execute on function public.set_room_lock(text, uuid, boolean, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- housekeeping — drop rooms (and their players, via cascade) after 24h
-- ---------------------------------------------------------------------------
create or replace function public.cleanup_stale_rooms() returns void
language sql
security definer
set search_path = public, extensions
as $$
  delete from public.rooms where updated_at < now() - interval '24 hours';
$$;
