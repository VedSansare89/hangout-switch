"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntensitySelector } from "@/components/intensity-selector";
import { getIntensityDef, intensityTheme } from "@/lib/intensity";
import { modeTheme } from "@/lib/mode-theme";
import { Intensity, Mode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SetupScreenProps {
  mode: Mode;
  intensity: Intensity;
  onChangeMode: (mode: Mode) => void;
  onChangeIntensity: (intensity: Intensity) => void;
  onStart: () => void;
  onBack: () => void;
}

export function SetupScreen({
  mode,
  intensity,
  onChangeMode,
  onChangeIntensity,
  onStart,
  onBack,
}: SetupScreenProps) {
  const theme = modeTheme[mode];
  const intensityDef = getIntensityDef(intensity);
  const intensityColor = intensityTheme[intensity];

  return (
    <div
      className={cn(
        "flex min-h-[100dvh] flex-col bg-gradient-to-b transition-colors duration-500",
        theme.softBg
      )}
    >
      <div className="pt-safe flex items-center px-4">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-neutral-500 transition hover:bg-black/5 active:scale-95 dark:text-neutral-400 dark:hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <span className="font-display flex-1 text-center text-sm font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          Game Setup
        </span>
        <div className="size-10" />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-6">
        {/* Mode indicator + switch */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          {(["friends", "couples"] as Mode[]).map((m) => {
            const t = modeTheme[m];
            const Icon = t.icon;
            const active = m === mode;
            return (
              <button
                key={m}
                onClick={() => onChangeMode(m)}
                className={cn(
                  "relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl border-2 px-4 py-5 text-center transition-all",
                  active
                    ? "border-transparent shadow-xl"
                    : "border-black/5 bg-white/70 hover:bg-white dark:border-white/10 dark:bg-white/5"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="mode-bg"
                    className={cn("absolute inset-0 bg-gradient-to-br", t.gradient)}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex size-10 items-center justify-center rounded-full",
                    active ? "bg-white/25" : "bg-black/5 dark:bg-white/10"
                  )}
                >
                  <Icon className={cn("size-5", active ? "text-white" : t.accentText)} />
                </span>
                <span
                  className={cn(
                    "font-display relative z-10 text-sm font-semibold",
                    active ? "text-white" : "text-neutral-700 dark:text-neutral-200"
                  )}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Intensity selector */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            Choose your intensity
          </h2>
        </div>

        <IntensitySelector value={intensity} onChange={onChangeIntensity} />

        <AnimatePresence mode="wait">
          <motion.div
            key={intensity}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "mt-4 rounded-2xl border px-4 py-3 text-sm",
              intensityColor.bg,
              intensityColor.border,
              intensityColor.text
            )}
          >
            <span className="font-semibold">
              {intensityDef.emoji} {intensityDef.label}:
            </span>{" "}
            {intensityDef.description}
          </motion.div>
        </AnimatePresence>

        <div className="flex-1" />

        <Button
          size="xl"
          variant="gradient"
          onClick={onStart}
          className={cn("w-full shadow-xl", theme.buttonGradient)}
        >
          Start Game
        </Button>
      </div>
    </div>
  );
}
