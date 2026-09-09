import { Heart, PartyPopper } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Mode } from "./types";

export const modeTheme: Record<
  Mode,
  {
    label: string;
    tagline: string;
    icon: LucideIcon;
    gradient: string;
    softBg: string;
    accentText: string;
    chip: string;
    ring: string;
    buttonGradient: string;
  }
> = {
  friends: {
    label: "Friends Mode",
    tagline: "Icebreakers, laughs, and a little chaos.",
    icon: PartyPopper,
    gradient: "from-sky-500 via-cyan-400 to-emerald-400",
    softBg: "from-sky-50 via-cyan-50 to-emerald-50 dark:from-sky-950 dark:via-slate-950 dark:to-emerald-950",
    accentText: "text-sky-600 dark:text-sky-300",
    chip: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
    ring: "ring-sky-400",
    buttonGradient: "from-sky-500 to-emerald-400",
  },
  couples: {
    label: "Couples Mode",
    tagline: "Get closer, one question at a time.",
    icon: Heart,
    gradient: "from-fuchsia-500 via-pink-500 to-rose-400",
    softBg: "from-fuchsia-50 via-pink-50 to-rose-50 dark:from-fuchsia-950 dark:via-purple-950 dark:to-rose-950",
    accentText: "text-pink-600 dark:text-pink-300",
    chip: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
    ring: "ring-pink-400",
    buttonGradient: "from-fuchsia-500 to-rose-400",
  },
};
