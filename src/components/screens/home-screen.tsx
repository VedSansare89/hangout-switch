"use client";

import { motion } from "framer-motion";
import { Dices, Heart, Info, Moon, PartyPopper, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Intensity, Mode } from "@/lib/types";

interface HomeScreenProps {
  onSelectMode: (mode: Mode) => void;
  onOpenInfo: () => void;
  onSelectMood: (mode: Mode, intensity: Intensity) => void;
  onRandomEverything: () => void;
  onOpenDailyPack: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const MOODS: { label: string; icon: typeof Moon; mode: Mode; intensity: Intensity }[] = [
  { label: "Chill Night", icon: Moon, mode: "friends", intensity: "low" },
  { label: "Party Night", icon: PartyPopper, mode: "friends", intensity: "medium" },
  { label: "Date Night", icon: Heart, mode: "couples", intensity: "medium" },
];

export function HomeScreen({
  onSelectMode,
  onOpenInfo,
  onSelectMood,
  onRandomEverything,
  onOpenDailyPack,
  onCreateRoom,
  onJoinRoom,
}: HomeScreenProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden overflow-y-auto bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-400">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -top-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-20 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/4 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="pt-safe absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={onOpenDailyPack}
          className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
        >
          <Sparkles className="size-4" />
          Today
        </button>
        <button
          onClick={onOpenInfo}
          className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
          aria-label="How to play"
        >
          <Info className="size-5" />
        </button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
      >
        <motion.div
          variants={item}
          className="mb-6 rounded-[2rem] bg-white px-8 py-6 shadow-2xl shadow-black/20"
        >
          <Logo markSize={68} />
        </motion.div>

        <motion.p
          variants={item}
          className="mt-4 max-w-sm text-balance text-base text-white/90 sm:text-lg"
        >
          One deck, endless conversations. Pick your people, set the vibe, and
          take turns hosting rounds that bring you closer.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex w-full max-w-sm flex-col gap-4">
          <Button
            size="xl"
            onClick={() => onSelectMode("friends")}
            className="w-full justify-between bg-white text-neutral-900 shadow-2xl shadow-black/20 hover:bg-white/90"
          >
            <span className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-sky-100">
                <PartyPopper className="size-5 text-sky-600" />
              </span>
              Friends Mode
            </span>
            <span className="text-sm font-normal text-neutral-400">Play →</span>
          </Button>

          <Button
            size="xl"
            onClick={() => onSelectMode("couples")}
            className="w-full justify-between bg-white text-neutral-900 shadow-2xl shadow-black/20 hover:bg-white/90"
          >
            <span className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-pink-100">
                <Heart className="size-5 text-pink-600" />
              </span>
              Couples Mode
            </span>
            <span className="text-sm font-normal text-neutral-400">Play →</span>
          </Button>

          <Button
            size="lg"
            variant="ghost"
            onClick={onRandomEverything}
            className="w-full gap-2 text-white hover:bg-white/15"
          >
            <Dices className="size-4.5" />
            Surprise Me — random everything
          </Button>
        </motion.div>

        <motion.div variants={item} className="mt-6 w-full max-w-sm">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="h-px flex-1 bg-white/25" />
            <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/70 uppercase">
              <Users className="size-3.5" />
              Playing on separate phones?
            </span>
            <span className="h-px flex-1 bg-white/25" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              onClick={onCreateRoom}
              className="w-full gap-2 bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
            >
              Create Room
            </Button>
            <Button
              size="lg"
              onClick={onJoinRoom}
              variant="outline"
              className="w-full gap-2 border-white/30 bg-transparent text-white hover:bg-white/15"
            >
              Join Room
            </Button>
          </div>
        </motion.div>

        <motion.div variants={item} className="mt-8 w-full max-w-sm">
          <p className="mb-2.5 text-xs font-semibold tracking-wide text-white/70 uppercase">
            Or set the mood
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {MOODS.map((mood) => {
              const Icon = mood.icon;
              return (
                <button
                  key={mood.label}
                  onClick={() => onSelectMood(mood.mode, mood.intensity)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 px-2 py-4 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
                >
                  <Icon className="size-5" />
                  <span className="text-center text-[11px] leading-tight font-semibold">
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <div className="pb-safe relative z-10 px-6 pb-6 text-center text-xs text-white/70">
        Best enjoyed with good company and an open mind.
      </div>
    </div>
  );
}
