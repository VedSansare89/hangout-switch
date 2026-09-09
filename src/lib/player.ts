import { randomAvatarId } from "./avatars";

const STORAGE_KEY = "hangout-switch:player";

export interface PlayerIdentity {
  id: string;
  name: string;
  avatarId: string;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `player-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function loadPlayerIdentity(): PlayerIdentity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlayerIdentity;
  } catch {
    return null;
  }
}

export function savePlayerIdentity(identity: PlayerIdentity) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    // ignore
  }
}

/** Returns the saved identity, or a fresh one (with a random avatar, no name yet). */
export function getOrCreatePlayerIdentity(): PlayerIdentity {
  const existing = loadPlayerIdentity();
  if (existing) return existing;

  const fresh: PlayerIdentity = { id: generateId(), name: "", avatarId: randomAvatarId() };
  savePlayerIdentity(fresh);
  return fresh;
}
