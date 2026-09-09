import { supabase } from "./supabase-client";
import { Intensity, MiniGameId, Mode } from "./types";

export class RoomActionError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

function unwrap<T>(data: T, error: { message: string } | null): T {
  if (error) {
    const code = error.message.match(
      /ROOM_NOT_FOUND|WRONG_PASSCODE|NOT_HOST|NO_MINI_GAME/
    )?.[0];
    throw new RoomActionError(code ?? error.message);
  }
  return data;
}

export async function createRoom(params: {
  code: string;
  mode: Mode;
  intensity: Intensity;
  hostId: string;
  hostName: string;
  hostAvatarId: string;
  locked: boolean;
  passcode?: string;
}): Promise<void> {
  const { error } = await supabase.rpc("create_room", {
    p_code: params.code,
    p_mode: params.mode,
    p_intensity: params.intensity,
    p_host_id: params.hostId,
    p_host_name: params.hostName,
    p_host_avatar: params.hostAvatarId,
    p_locked: params.locked,
    p_passcode: params.passcode ?? null,
  });
  unwrap(undefined, error);
}

export async function joinRoom(params: {
  code: string;
  playerId: string;
  name: string;
  avatarId: string;
  passcode?: string;
}): Promise<{ becameHost: boolean }> {
  const { data, error } = await supabase.rpc("join_room", {
    p_code: params.code,
    p_player_id: params.playerId,
    p_name: params.name,
    p_avatar_id: params.avatarId,
    p_passcode: params.passcode ?? null,
  });
  unwrap(undefined, error);
  return { becameHost: !!(data as { became_host?: boolean } | null)?.became_host };
}

export async function leaveRoom(code: string, playerId: string): Promise<void> {
  const { error } = await supabase.rpc("leave_room", { p_code: code, p_player_id: playerId });
  unwrap(undefined, error);
}

export async function heartbeat(code: string, playerId: string): Promise<void> {
  await supabase.rpc("heartbeat", { p_code: code, p_player_id: playerId });
}

export async function reclaimHost(code: string, playerId: string): Promise<boolean> {
  const { data } = await supabase.rpc("reclaim_host", { p_code: code, p_player_id: playerId });
  return !!data;
}

export async function updatePlayerProfile(
  playerId: string,
  name: string,
  avatarId: string
): Promise<void> {
  const { error } = await supabase.rpc("update_player_profile", {
    p_player_id: playerId,
    p_name: name,
    p_avatar_id: avatarId,
  });
  unwrap(undefined, error);
}

export async function setRoomMode(code: string, playerId: string, mode: Mode): Promise<void> {
  const { error } = await supabase.rpc("set_mode", { p_code: code, p_player_id: playerId, p_mode: mode });
  unwrap(undefined, error);
}

export async function setRoomIntensity(
  code: string,
  playerId: string,
  intensity: Intensity
): Promise<void> {
  const { error } = await supabase.rpc("set_intensity", {
    p_code: code,
    p_player_id: playerId,
    p_intensity: intensity,
  });
  unwrap(undefined, error);
}

export async function pickMiniGame(
  code: string,
  playerId: string,
  miniGame: MiniGameId
): Promise<void> {
  const { error } = await supabase.rpc("pick_mini_game", {
    p_code: code,
    p_player_id: playerId,
    p_mini_game: miniGame,
  });
  unwrap(undefined, error);
}

export async function nextQuestion(code: string, playerId: string): Promise<void> {
  const { error } = await supabase.rpc("next_question", { p_code: code, p_player_id: playerId });
  unwrap(undefined, error);
}

export async function skipQuestion(code: string, playerId: string): Promise<void> {
  const { error } = await supabase.rpc("skip_question", { p_code: code, p_player_id: playerId });
  unwrap(undefined, error);
}

export async function resetSession(code: string, playerId: string): Promise<void> {
  const { error } = await supabase.rpc("reset_session", { p_code: code, p_player_id: playerId });
  unwrap(undefined, error);
}

export async function setRoomLock(
  code: string,
  playerId: string,
  locked: boolean,
  passcode?: string
): Promise<void> {
  const { error } = await supabase.rpc("set_room_lock", {
    p_code: code,
    p_player_id: playerId,
    p_locked: locked,
    p_passcode: passcode ?? null,
  });
  unwrap(undefined, error);
}
