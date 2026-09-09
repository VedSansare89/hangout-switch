"use client";

import { motion } from "framer-motion";
import { INTENSITIES, intensityTheme } from "@/lib/intensity";
import { Intensity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface IntensitySelectorProps {
  value: Intensity;
  onChange: (intensity: Intensity) => void;
  className?: string;
}

export function IntensitySelector({ value, onChange, className }: IntensitySelectorProps) {
  return (
    <div
      className={cn(
        "relative grid grid-cols-3 gap-2 rounded-3xl bg-black/5 p-2 dark:bg-white/5",
        className
      )}
    >
      {INTENSITIES.map((intensityDef) => {
        const active = intensityDef.id === value;
        const theme = intensityTheme[intensityDef.id];

        return (
          <button
            key={intensityDef.id}
            type="button"
            onClick={() => onChange(intensityDef.id)}
            className="relative flex flex-col items-center gap-1 rounded-2xl px-2 py-4 text-center transition-colors"
          >
            {active && (
              <motion.div
                layoutId="intensity-pill"
                className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-br shadow-lg",
                  theme.gradient
                )}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 text-2xl">{intensityDef.emoji}</span>
            <span
              className={cn(
                "font-display relative z-10 text-sm font-semibold",
                active ? "text-white" : "text-neutral-600 dark:text-neutral-300"
              )}
            >
              {intensityDef.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
