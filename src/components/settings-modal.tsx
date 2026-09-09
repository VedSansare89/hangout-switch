"use client";

import { Hand, Share2, Shield, Sparkles, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { INTENSITIES } from "@/lib/intensity";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4.5 text-fuchsia-500" />
            How Hangout Switch works
          </DialogTitle>
          <DialogDescription>
            A quick rundown of the rules — skim it once and you&apos;re set.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 text-sm text-neutral-600 dark:text-neutral-300">
          <section className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
              <Users className="size-4" />
            </span>
            <div>
              <p className="font-display font-semibold text-neutral-900 dark:text-neutral-50">
                1. Pick a mode
              </p>
              <p>
                Friends Mode is built for group hangouts. Couples Mode is
                designed for two people who want to get closer.
              </p>
            </div>
          </section>

          <section className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="font-display font-semibold text-neutral-900 dark:text-neutral-50">
                2. Set the intensity
              </p>
              <ul className="mt-1 flex flex-col gap-1">
                {INTENSITIES.map((i) => (
                  <li key={i.id}>
                    <span className="font-semibold">
                      {i.emoji} {i.label}:
                    </span>{" "}
                    {i.description}
                  </li>
                ))}
              </ul>
              <p className="mt-1">
                Change it anytime — nothing is locked in for the whole game.
              </p>
            </div>
          </section>

          <section className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Hand className="size-4" />
            </span>
            <div>
              <p className="font-display font-semibold text-neutral-900 dark:text-neutral-50">
                3. Take turns as Host
              </p>
              <p>
                The Host picks a mini-game and reads each prompt out loud.
                Pass the role around so everyone gets a turn.
              </p>
            </div>
          </section>

          <section className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
              <Shield className="size-4" />
            </span>
            <div>
              <p className="font-display font-semibold text-neutral-900 dark:text-neutral-50">
                Safe Word / Skip
              </p>
              <p>
                Not vibing with a question? Tap Skip any time, no explanation
                needed. Everyone&apos;s comfort comes first — that&apos;s the
                whole point of the game.
              </p>
            </div>
          </section>

          <section className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
              <Share2 className="size-4" />
            </span>
            <div>
              <p className="font-display font-semibold text-neutral-900 dark:text-neutral-50">
                Playing on separate phones?
              </p>
              <p>
                Create a Room to get a shareable code and link. Everyone who
                joins sees the same question at the same time, and only the
                Host can change the mode, intensity, or mini-game.
              </p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
