"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntensitySelector } from "@/components/intensity-selector";
import { AvatarPicker } from "@/components/avatar-picker";
import { getIntensityDef, intensityTheme } from "@/lib/intensity";
import { modeTheme } from "@/lib/mode-theme";
import { Intensity, Mode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CreateRoomScreenProps {
  initialName: string;
  initialAvatarId: string;
  onBack: () => void;
  onCreate: (params: {
    mode: Mode;
    intensity: Intensity;
    name: string;
    avatarId: string;
    locked: boolean;
    passcode: string;
  }) => void;
}

export function CreateRoomScreen({
  initialName,
  initialAvatarId,
  onBack,
  onCreate,
}: CreateRoomScreenProps) {
  const [mode, setMode] = useState<Mode>("friends");
  const [intensity, setIntensity] = useState<Intensity>("low");
  const [name, setName] = useState(initialName);
  const [avatarId, setAvatarId] = useState(initialAvatarId);
  const [locked, setLocked] = useState(false);
  const [passcode, setPasscode] = useState("");

  const theme = modeTheme[mode];
  const intensityDef = getIntensityDef(intensity);
  const intensityColor = intensityTheme[intensity];
  const canSubmit = name.trim().length > 0 && (!locked || passcode.length === 4);

  return (
    <div
      className={cn(
        "flex min-h-[100dvh] flex-col overflow-x-hidden overflow-y-auto bg-gradient-to-b transition-colors duration-500",
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
          Create a Room
        </span>
        <div className="size-10" />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-6">
        <div className="mb-6 grid grid-cols-2 gap-3">
          {(["friends", "couples"] as Mode[]).map((m) => {
            const t = modeTheme[m];
            const Icon = t.icon;
            const active = m === mode;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl border-2 px-4 py-4 text-center transition-all",
                  active
                    ? "border-transparent shadow-xl"
                    : "border-black/5 bg-white/70 hover:bg-white dark:border-white/10 dark:bg-white/5"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="create-room-mode-bg"
                    className={cn("absolute inset-0 bg-gradient-to-br", t.gradient)}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex size-9 items-center justify-center rounded-full",
                    active ? "bg-white/25" : "bg-black/5 dark:bg-white/10"
                  )}
                >
                  <Icon className={cn("size-4.5", active ? "text-white" : t.accentText)} />
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

        <h2 className="font-display mb-2 text-base font-semibold text-neutral-800 dark:text-neutral-100">
          Choose your intensity
        </h2>
        <IntensitySelector value={intensity} onChange={setIntensity} />
        <p
          className={cn(
            "mt-3 rounded-2xl border px-4 py-2.5 text-xs",
            intensityColor.bg,
            intensityColor.border,
            intensityColor.text
          )}
        >
          <span className="font-semibold">
            {intensityDef.emoji} {intensityDef.label}:
          </span>{" "}
          {intensityDef.description}
        </p>

        <h2 className="font-display mt-6 mb-2 text-base font-semibold text-neutral-800 dark:text-neutral-100">
          Your name
        </h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          placeholder="Enter your name"
          className="w-full rounded-2xl border-2 border-black/10 bg-white px-4 py-3 text-base font-medium outline-none focus:border-neutral-400 dark:border-white/10 dark:bg-white/5"
        />

        <h2 className="font-display mt-5 mb-2 text-base font-semibold text-neutral-800 dark:text-neutral-100">
          Pick an avatar
        </h2>
        <AvatarPicker value={avatarId} onChange={setAvatarId} />

        <button
          onClick={() => setLocked((v) => !v)}
          className={cn(
            "mt-6 flex items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left transition",
            locked
              ? "border-transparent bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "border-black/5 bg-white/70 dark:border-white/10 dark:bg-white/5"
          )}
        >
          <span className="flex items-center gap-2.5">
            <Lock className="size-4.5" />
            <span>
              <span className="block text-sm font-semibold">Private room</span>
              <span
                className={cn(
                  "block text-xs",
                  locked ? "text-white/70 dark:text-neutral-500" : "text-neutral-500 dark:text-neutral-400"
                )}
              >
                Require a 4-digit passcode to join
              </span>
            </span>
          </span>
          <span
            className={cn(
              "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
              locked ? "justify-end bg-emerald-400" : "justify-start bg-black/15 dark:bg-white/20"
            )}
          >
            <span className="size-5 rounded-full bg-white shadow" />
          </span>
        </button>

        {locked && (
          <input
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            placeholder="4-digit passcode"
            className="mt-3 w-full rounded-2xl border-2 border-black/10 bg-white px-4 py-3 text-center text-lg font-semibold tracking-[0.5em] outline-none focus:border-neutral-400 dark:border-white/10 dark:bg-white/5"
          />
        )}

        <div className="flex-1" />

        <Button
          size="xl"
          variant="gradient"
          disabled={!canSubmit}
          onClick={() =>
            onCreate({ mode, intensity, name: name.trim(), avatarId, locked, passcode })
          }
          className={cn("mt-6 w-full shadow-xl", theme.buttonGradient)}
        >
          Create Room
        </Button>
      </div>
    </div>
  );
}
