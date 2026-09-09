"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { intensityTheme } from "@/lib/intensity";
import { MiniGameDef, Intensity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  miniGame: MiniGameDef | null;
  intensity: Intensity;
  question: string | null;
  round: number;
}

export function QuestionCard({ miniGame, intensity, question, round }: QuestionCardProps) {
  const theme = intensityTheme[intensity];
  const Icon = miniGame?.icon ?? Sparkles;

  return (
    <div className="perspective w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={question ?? "empty"}
          initial={{ opacity: 0, rotateY: -12, scale: 0.96 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          exit={{ opacity: 0, rotateY: 12, scale: 0.96 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={cn(
            "preserve-3d relative flex min-h-[19rem] w-full flex-col justify-between overflow-hidden rounded-[2rem] border-2 bg-white p-7 shadow-2xl shadow-black/10 dark:bg-neutral-900",
            theme.border
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br opacity-20",
              theme.gradient
            )}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  theme.chip
                )}
              >
                <Icon className="size-4.5" />
              </span>
              <span className="font-display text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                {miniGame ? miniGame.name : "No mini-game yet"}
              </span>
            </div>
            {miniGame && (
              <Badge
                variant="soft"
                className={cn("tracking-wide uppercase", theme.chip)}
              >
                Round {round}
              </Badge>
            )}
          </div>

          <div className="relative z-10 flex flex-1 items-center py-6">
            {question ? (
              <p className="font-display text-2xl leading-snug font-medium text-balance text-neutral-900 sm:text-3xl dark:text-neutral-50">
                {question}
              </p>
            ) : (
              <p className="text-lg text-neutral-400">
                Tap &ldquo;Pick a Mini-Game&rdquo; to get your first prompt.
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
