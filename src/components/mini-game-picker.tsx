"use client";

import { Shuffle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getMiniGamesForMode } from "@/lib/mini-games";
import { modeTheme } from "@/lib/mode-theme";
import { MiniGameId, Mode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MiniGamePickerProps {
  mode: Mode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (id: MiniGameId) => void;
  onRandom: () => void;
  currentMiniGame: MiniGameId | null;
}

export function MiniGamePicker({
  mode,
  open,
  onOpenChange,
  onPick,
  onRandom,
  currentMiniGame,
}: MiniGamePickerProps) {
  const games = getMiniGamesForMode(mode);
  const theme = modeTheme[mode];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle>Pick a mini-game</DialogTitle>
          <DialogDescription>
            Choose what to play next in {theme.label}.
          </DialogDescription>
        </DialogHeader>

        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            onRandom();
            onOpenChange(false);
          }}
          className={cn("w-full border-2 justify-center gap-2", theme.accentText)}
        >
          <Shuffle className="size-4" />
          Surprise me
        </Button>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {games.map((game) => {
            const Icon = game.icon;
            const active = game.id === currentMiniGame;
            return (
              <button
                key={game.id}
                onClick={() => {
                  onPick(game.id);
                  onOpenChange(false);
                }}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition-all active:scale-[0.98]",
                  active
                    ? cn("border-transparent bg-gradient-to-br text-white shadow-lg", theme.gradient)
                    : "border-black/5 bg-black/[0.03] hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-white/20" : theme.chip
                  )}
                >
                  <Icon className={cn("size-4.5", active ? "text-white" : "")} />
                </span>
                <span className="flex flex-col">
                  <span className="font-display text-sm font-semibold">{game.name}</span>
                  <span
                    className={cn(
                      "text-xs",
                      active ? "text-white/80" : "text-neutral-500 dark:text-neutral-400"
                    )}
                  >
                    {game.tagline}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
