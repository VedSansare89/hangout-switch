import { questionBank } from "./questions-data";
import { Intensity, MiniGameId, Mode } from "./types";

export function getQuestionPool(
  mode: Mode,
  miniGame: MiniGameId,
  intensity: Intensity
): string[] {
  return questionBank[mode]?.[miniGame]?.[intensity] ?? [];
}

/**
 * Picks a random question from the pool, avoiding recently shown questions
 * when possible. Falls back to the full pool once everything has been seen.
 */
export function pickRandomQuestion(
  pool: string[],
  recentlyShown: string[]
): string | null {
  if (pool.length === 0) return null;

  const unseen = pool.filter((q) => !recentlyShown.includes(q));
  const candidates = unseen.length > 0 ? unseen : pool;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

export const RECENT_HISTORY_LIMIT = 12;

export function pushRecent(history: string[], question: string): string[] {
  const next = [...history, question];
  if (next.length > RECENT_HISTORY_LIMIT) {
    return next.slice(next.length - RECENT_HISTORY_LIMIT);
  }
  return next;
}
