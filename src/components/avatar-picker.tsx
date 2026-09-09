"use client";

import { motion } from "framer-motion";
import { AVATAR_OPTIONS } from "@/lib/avatars";
import { cn } from "@/lib/utils";

interface AvatarPickerProps {
  value: string;
  onChange: (avatarId: string) => void;
  className?: string;
}

export function AvatarPicker({ value, onChange, className }: AvatarPickerProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-2.5 sm:grid-cols-6", className)}>
      {AVATAR_OPTIONS.map((avatar) => {
        const active = avatar.id === value;
        return (
          <motion.button
            key={avatar.id}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(avatar.id)}
            className={cn(
              "relative flex aspect-square items-center justify-center rounded-2xl text-2xl transition-all",
              avatar.bg,
              active
                ? "ring-3 ring-offset-2 ring-neutral-900 dark:ring-white dark:ring-offset-neutral-900"
                : "opacity-80 hover:opacity-100"
            )}
            aria-label={avatar.id}
            aria-pressed={active}
          >
            {avatar.emoji}
          </motion.button>
        );
      })}
    </div>
  );
}
