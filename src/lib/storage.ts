import { GameState, Screen } from "./types";

const STORAGE_KEY = "hangout-switch:session";

interface SavedSession {
  screen: Screen;
  gameState: GameState;
}

export function saveSession(session: SavedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // localStorage unavailable — ignore, nothing persists this session.
  }
}

export function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedSession;
  } catch {
    return null;
  }
}
