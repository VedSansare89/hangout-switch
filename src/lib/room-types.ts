import { Intensity, MiniGameId, Mode } from "./types";

export interface RoomPlayer {
  id: string;
  name: string;
  avatarId: string;
  connected: boolean;
}

export interface RoomState {
  code: string;
  mode: Mode;
  intensity: Intensity;
  currentMiniGame: MiniGameId | null;
  currentQuestion: string | null;
  round: number;
  playedQuestions: string[];
  hostId: string | null;
  locked: boolean;
  createdAt: number;
}

export interface RoomSnapshot {
  room: RoomState;
  players: RoomPlayer[];
}

/** Messages sent from a client to the party server. */
export type ClientMessage =
  | { type: "set-mode"; mode: Mode }
  | { type: "set-intensity"; intensity: Intensity }
  | { type: "pick-mini-game"; miniGame: MiniGameId }
  | { type: "next-question" }
  | { type: "skip-question" }
  | { type: "reset-session" }
  | { type: "set-lock"; locked: boolean; passcode?: string }
  | { type: "update-profile"; name: string; avatarId: string };

/** Messages sent from the party server to a client. */
export type ServerMessage =
  | ({ type: "state" } & RoomSnapshot)
  | { type: "error"; message: string }
  | { type: "kicked"; reason: string };
