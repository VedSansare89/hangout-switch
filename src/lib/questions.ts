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
 * Picks a random question from the pool, avoiding everything already played
 * this session. Once a pool is fully exhausted it falls back to the full
 * pool so the game never gets stuck.
 */
export function pickRandomQuestion(pool: string[], played: string[]): string | null {
  if (pool.length === 0) return null;

  const playedSet = new Set(played);
  const unseen = pool.filter((q) => !playedSet.has(q));
  const candidates = unseen.length > 0 ? unseen : pool;

  return candidates[Math.floor(Math.random() * candidates.length)];
}
