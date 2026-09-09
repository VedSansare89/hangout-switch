"use client";

import { ChevronDown, Settings, Volume2, VolumeX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AvatarBadge } from "@/components/avatar-badge";
import { getIntensityDef, intensityTheme } from "@/lib/intensity";
import { modeTheme } from "@/lib/mode-theme";
import { GameState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TopBarProps {
  gameState: GameState;
  onOpenHostEditor: () => void;
  onOpenIntensity: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

export function TopBar({
  gameState,
  onOpenHostEditor,
  onOpenIntensity,
  onOpenSettings,
  onToggleSound,
}: TopBarProps) {
  const theme = modeTheme[gameState.mode];
  const intensityDef = getIntensityDef(gameState.intensity);
  const intensityColor = intensityTheme[gameState.intensity];
  const ModeIcon = theme.icon;

  return (
    <div className="pt-safe flex items-center gap-1.5 px-3 pb-3">
      <Badge variant="soft" className={cn("gap-1.5 px-3 py-1.5", theme.chip)}>
        <ModeIcon className="size-3.5" />
        {theme.label.replace(" Mode", "")}
      </Badge>

      <button
        onClick={onOpenIntensity}
        className={cn(
          "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95",
          intensityColor.chip
        )}
      >
        {intensityDef.emoji} {intensityDef.label}
        <ChevronDown className="size-3" />
      </button>

      <button
        onClick={onOpenHostEditor}
        className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-black/5 py-1.5 pr-3 pl-1.5 text-xs font-semibold text-neutral-700 transition active:scale-95 dark:bg-white/10 dark:text-neutral-200"
      >
        <AvatarBadge avatarId={gameState.hostAvatarId} size="sm" />
        <span className="truncate">{gameState.hostName || "Set your name"}</span>
      </button>

      <button
        onClick={onToggleSound}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-black/5 active:scale-95 dark:text-neutral-400 dark:hover:bg-white/10"
        aria-label={gameState.soundEnabled ? "Mute sound effects" : "Unmute sound effects"}
      >
        {gameState.soundEnabled ? (
          <Volume2 className="size-4.5" />
        ) : (
          <VolumeX className="size-4.5" />
        )}
      </button>

      <button
        onClick={onOpenSettings}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-black/5 active:scale-95 dark:text-neutral-400 dark:hover:bg-white/10"
        aria-label="Settings and rules"
      >
        <Settings className="size-4.5" />
      </button>
    </div>
  );
}
