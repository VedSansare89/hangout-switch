"use client";

import { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarPicker } from "@/components/avatar-picker";
import { normalizeRoomCode } from "@/lib/room-code";
import { cn } from "@/lib/utils";

interface JoinRoomScreenProps {
  initialCode?: string;
  initialName: string;
  initialAvatarId: string;
  needsPasscode: boolean;
  errorMessage?: string | null;
  connecting: boolean;
  onBack: () => void;
  onJoin: (params: { roomCode: string; name: string; avatarId: string; passcode: string }) => void;
}

export function JoinRoomScreen({
  initialCode = "",
  initialName,
  initialAvatarId,
  needsPasscode,
  errorMessage,
  connecting,
  onBack,
  onJoin,
}: JoinRoomScreenProps) {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState(initialName);
  const [avatarId, setAvatarId] = useState(initialAvatarId);
  const [passcode, setPasscode] = useState("");

  const normalizedCode = normalizeRoomCode(code);
  const canSubmit =
    normalizedCode.length >= 4 && name.trim().length > 0 && (!needsPasscode || passcode.length === 4);

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-x-hidden overflow-y-auto bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-400">
      <div className="pt-safe flex items-center px-4">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <span className="font-display flex-1 text-center text-sm font-semibold tracking-wide text-white/80 uppercase">
          Join a Room
        </span>
        <div className="size-10" />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-6">
        <h2 className="font-display mb-2 text-sm font-semibold text-white/80 uppercase">
          Room code
        </h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={8}
          placeholder="ABCDE"
          autoCapitalize="characters"
          className="w-full rounded-2xl border-2 border-white/30 bg-white/15 px-4 py-4 text-center font-display text-2xl font-semibold tracking-[0.4em] text-white uppercase placeholder-white/40 outline-none backdrop-blur-md focus:border-white/60"
        />

        <h2 className="font-display mt-6 mb-2 text-sm font-semibold text-white/80 uppercase">
          Your name
        </h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          placeholder="Enter your name"
          className="w-full rounded-2xl border-2 border-white/30 bg-white/15 px-4 py-3 text-base font-medium text-white placeholder-white/50 outline-none backdrop-blur-md focus:border-white/60"
        />

        <h2 className="font-display mt-6 mb-2 text-sm font-semibold text-white/80 uppercase">
          Pick an avatar
        </h2>
        <AvatarPicker value={avatarId} onChange={setAvatarId} />

        {needsPasscode && (
          <>
            <h2 className="font-display mt-6 mb-2 flex items-center gap-1.5 text-sm font-semibold text-white/80 uppercase">
              <Lock className="size-3.5" />
              Passcode
            </h2>
            <input
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder="4-digit passcode"
              className="w-full rounded-2xl border-2 border-white/30 bg-white/15 px-4 py-3 text-center text-lg font-semibold tracking-[0.5em] text-white placeholder-white/40 outline-none backdrop-blur-md focus:border-white/60"
            />
          </>
        )}

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm font-medium text-white">
            {errorMessage}
          </p>
        )}

        <div className="flex-1" />

        <Button
          size="xl"
          disabled={!canSubmit || connecting}
          onClick={() => onJoin({ roomCode: normalizedCode, name: name.trim(), avatarId, passcode })}
          className={cn(
            "mt-6 w-full bg-white text-neutral-900 shadow-xl hover:bg-white/90",
            connecting && "opacity-70"
          )}
        >
          {connecting ? "Joining…" : "Join Room"}
        </Button>
      </div>
    </div>
  );
}
