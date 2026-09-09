import { Intensity, IntensityDef } from "./types";

export const INTENSITIES: IntensityDef[] = [
  {
    id: "low",
    label: "Chill",
    emoji: "😌",
    description: "Light, safe, and silly. Great for icebreakers.",
  },
  {
    id: "medium",
    label: "Fun",
    emoji: "😏",
    description: "Mildly personal with a little teasing.",
  },
  {
    id: "high",
    label: "Spicy",
    emoji: "🔥",
    description: "Bold, deep, and a little more intense.",
  },
];

export function getIntensityDef(intensity: Intensity): IntensityDef {
  return INTENSITIES.find((i) => i.id === intensity) ?? INTENSITIES[0];
}

export const intensityTheme: Record<
  Intensity,
  {
    text: string;
    bg: string;
    border: string;
    ring: string;
    gradient: string;
    solid: string;
    chip: string;
  }
> = {
  low: {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-300/60 dark:border-emerald-700/60",
    ring: "ring-emerald-400",
    gradient: "from-teal-400 to-emerald-500",
    solid: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  medium: {
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-300/60 dark:border-amber-700/60",
    ring: "ring-amber-400",
    gradient: "from-orange-400 to-amber-500",
    solid: "bg-amber-500",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
  high: {
    text: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-300/60 dark:border-rose-700/60",
    ring: "ring-rose-400",
    gradient: "from-pink-500 to-red-500",
    solid: "bg-rose-500",
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  },
};
