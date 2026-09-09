"use client";

import { useState } from "react";
import { Crown, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HostEditorProps {
  hostName: string;
  onChange: (name: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HostEditor({ hostName, onChange, open, onOpenChange }: HostEditorProps) {
  const [draft, setDraft] = useState(hostName);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(hostName);
        onOpenChange(next);
      }}
    >
      <DialogContent className="p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="size-4.5 text-amber-500" />
            Who&apos;s hosting?
          </DialogTitle>
          <DialogDescription>
            The Host reads the prompts out loud for this round.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = draft.trim();
            onChange(trimmed.length > 0 ? trimmed : "Host");
            onOpenChange(false);
          }}
          className="flex flex-col gap-4"
        >
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={24}
            placeholder="Enter a name"
            className="w-full rounded-2xl border-2 border-black/10 bg-black/[0.02] px-4 py-3 text-base font-medium outline-none focus:border-neutral-400 dark:border-white/10 dark:bg-white/5"
          />
          <Button type="submit" size="lg" className="w-full">
            <Pencil className="size-4" />
            Save Host
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
