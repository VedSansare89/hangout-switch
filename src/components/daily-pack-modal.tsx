"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDailyFeaturedQuestions } from "@/lib/daily-pack";
import { getMiniGameById } from "@/lib/mini-games";
import { intensityTheme } from "@/lib/intensity";
import { modeTheme } from "@/lib/mode-theme";
import { cn } from "@/lib/utils";

interface DailyPackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailyPackModal({ open, onOpenChange }: DailyPackModalProps) {
  const featured = useMemo(() => getDailyFeaturedQuestions(), []);
  const today = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4.5 text-amber-500" />
            Today&apos;s Featured Pack
          </DialogTitle>
          <DialogDescription>Five hand-picked prompts for {today}.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 overflow-y-auto">
          {featured.map((item, i) => {
            const game = getMiniGameById(item.miniGame);
            const modeColor = modeTheme[item.mode];
            const intensityColor = intensityTheme[item.intensity];
            return (
              <div
                key={i}
                className="rounded-2xl border-2 border-black/5 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", modeColor.chip)}>
                    {modeColor.label.replace(" Mode", "")}
                  </span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", intensityColor.chip)}>
                    {item.intensity}
                  </span>
                  {game && (
                    <span className="text-[11px] font-semibold text-neutral-400">{game.name}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                  {item.question}
                </p>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
