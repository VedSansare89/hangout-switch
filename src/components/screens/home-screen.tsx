"use client";

import { motion } from "framer-motion";
import { Heart, Info, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Mode } from "@/lib/types";

interface HomeScreenProps {
  onSelectMode: (mode: Mode) => void;
  onOpenInfo: () => void;
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

export function HomeScreen({ onSelectMode, onOpenInfo }: HomeScreenProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-400">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />

      <button
        onClick={onOpenInfo}
        className="pt-safe absolute top-4 right-4 z-20 flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
        aria-label="How to play"
      >
        <Info className="size-5" />
      </button>

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
        </motion.div>

        <motion.div
          variants={item}
          className="mt-12 grid w-full max-w-sm grid-cols-3 gap-3 text-white/90"
        >
          {[
            { n: "1", t: "Pick a mode" },
            { n: "2", t: "Set intensity" },
            { n: "3", t: "Take turns" },
          ].map((s) => (
            <div
              key={s.n}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 px-2 py-4 backdrop-blur-md"
            >
              <span className="font-display flex size-7 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                {s.n}
              </span>
              <span className="text-center text-xs leading-tight font-medium">{s.t}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="pb-safe relative z-10 px-6 pb-6 text-center text-xs text-white/70">
        Best enjoyed with good company and an open mind.
      </div>
    </div>
  );
}
