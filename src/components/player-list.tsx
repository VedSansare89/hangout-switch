"use client";

import { Crown } from "lucide-react";
import { AvatarBadge } from "@/components/avatar-badge";
import { PlayerRow } from "@/lib/room-types";
import { cn } from "@/lib/utils";

const ACTIVE_THRESHOLD_MS = 30_000;

interface PlayerListProps {
  players: PlayerRow[];
  hostId: string | null;
  className?: string;
}

function isActive(player: PlayerRow): boolean {
  return Date.now() - new Date(player.last_seen_at).getTime() < ACTIVE_THRESHOLD_MS;
}

export function PlayerList({ players, hostId, className }: PlayerListProps) {
  const ordered = [...players].sort((a, b) => {
    if (a.id === hostId) return -1;
    if (b.id === hostId) return 1;
    return Number(isActive(b)) - Number(isActive(a));
  });

  return (
    <div className={cn("hide-scrollbar flex gap-2.5 overflow-x-auto pb-1", className)}>
      {ordered.map((player) => (
        <div
          key={player.id}
          className={cn(
            "flex shrink-0 flex-col items-center gap-1 rounded-2xl px-2.5 py-2 transition-opacity",
            !isActive(player) && "opacity-40"
          )}
        >
          <div className="relative">
            <AvatarBadge avatarId={player.avatar_id} size="md" />
            {player.id === hostId && (
              <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-amber-400 text-white shadow">
                <Crown className="size-2.5" />
              </span>
            )}
          </div>
          <span className="max-w-[4.5rem] truncate text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
            {player.name}
          </span>
        </div>
      ))}
    </div>
  );
}
