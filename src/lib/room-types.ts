import { Intensity, MiniGameId, Mode } from "./types";

/** Mirrors a row in the `rooms` table. */
export interface RoomRow {
  code: string;
  mode: Mode;
  intensity: Intensity;
  current_mini_game: MiniGameId | null;
  current_question_id: string | null;
  current_question_text: string | null;
  round: number;
  played_question_ids: string[];
  played_question_texts: string[];
  host_id: string | null;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

/** Mirrors a row in the `players` table. */
export interface PlayerRow {
  id: string;
  room_code: string;
  name: string;
  avatar_id: string;
  is_host: boolean;
  joined_at: string;
  last_seen_at: string;
}

export interface RoomSnapshot {
  room: RoomRow;
  players: PlayerRow[];
}
