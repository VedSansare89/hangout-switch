import type { LucideIcon } from "lucide-react";

export type Mode = "friends" | "couples";

export type Intensity = "low" | "medium" | "high";

export type MiniGameId =
  | "would-you-rather"
  | "two-truths-a-lie"
  | "never-have-i-ever"
  | "most-likely-to"
  | "rapid-fire"
  | "charades"
  | "truth-or-dare"
  | "how-well-do-you-know-me"
  | "intimate-questions";

export interface MiniGameDef {
  id: MiniGameId;
  name: string;
  tagline: string;
  icon: LucideIcon;
  modes: Mode[];
  howToPlay: string;
}

export type QuestionBank = Record<
  Mode,
  Partial<Record<MiniGameId, Record<Intensity, string[]>>>
>;

export interface IntensityDef {
  id: Intensity;
  label: string;
  emoji: string;
  description: string;
}

export interface GameState {
  mode: Mode;
  intensity: Intensity;
  hostName: string;
  round: number;
  currentMiniGame: MiniGameId | null;
  currentQuestion: string | null;
  recentQuestions: string[];
}

export type Screen = "home" | "setup" | "game";
