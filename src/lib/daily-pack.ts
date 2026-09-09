import { questionBank } from "./questions-data";
import { Intensity, MiniGameId, Mode } from "./types";

export interface FeaturedQuestion {
  question: string;
  mode: Mode;
  miniGame: MiniGameId;
  intensity: Intensity;
}

function dayOfYearSeed(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / 86_400_000);
}

/** Small deterministic PRNG (mulberry32) so the pack is stable for a given seed. */
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function flattenBank(): FeaturedQuestion[] {
  const all: FeaturedQuestion[] = [];
  for (const mode of Object.keys(questionBank) as Mode[]) {
    const games = questionBank[mode];
    for (const miniGame of Object.keys(games) as MiniGameId[]) {
      const pools = games[miniGame];
      if (!pools) continue;
      for (const intensity of Object.keys(pools) as Intensity[]) {
        for (const question of pools[intensity]) {
          all.push({ question, mode, miniGame, intensity });
        }
      }
    }
  }
  return all;
}

/**
 * Picks 5 questions that are the same for everyone on a given calendar day,
 * and change the next day. Pulled from the full bank so it naturally
 * surfaces variety across modes and intensities.
 */
export function getDailyFeaturedQuestions(date: Date = new Date(), count = 5): FeaturedQuestion[] {
  const all = flattenBank();
  const seed = dayOfYearSeed(date) + date.getUTCFullYear() * 1000;
  const random = mulberry32(seed);

  const pool = [...all];
  const picked: FeaturedQuestion[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = Math.floor(random() * pool.length);
    picked.push(pool[index]);
    pool.splice(index, 1);
  }
  return picked;
}
