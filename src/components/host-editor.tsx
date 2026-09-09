"use client";

import { useEffect, useState } from "react";
import { Crown, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AvatarPicker } from "@/components/avatar-picker";
import { randomAvatarId } from "@/lib/avatars";

interface HostEditorProps {
  hostName: string;
  hostAvatarId: string;
  onSave: (name: string, avatarId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function HostEditor({
  hostName,
  hostAvatarId,
  onSave,
  open,
  onOpenChange,
  title = "Who's playing?",
  description = "This name and avatar show up in the game so everyone knows who's hosting.",
}: HostEditorProps) {
  const [draftName, setDraftName] = useState(hostName);
  const [draftAvatar, setDraftAvatar] = useState(hostAvatarId || randomAvatarId());

  useEffect(() => {
    if (open) {
      setDraftName(hostName);
      setDraftAvatar(hostAvatarId || randomAvatarId());
    }
  }, [open, hostName, hostAvatarId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="size-4.5 text-amber-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = draftName.trim();
            onSave(trimmed.length > 0 ? trimmed : "Host", draftAvatar);
            onOpenChange(false);
          }}
          className="flex flex-col gap-4"
        >
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            maxLength={24}
            placeholder="Enter your name"
            className="w-full rounded-2xl border-2 border-black/10 bg-black/[0.02] px-4 py-3 text-base font-medium outline-none focus:border-neutral-400 dark:border-white/10 dark:bg-white/5"
          />

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Pick an avatar
            </p>
            <AvatarPicker value={draftAvatar} onChange={setDraftAvatar} />
          </div>

          <Button type="submit" size="lg" className="w-full">
            <Check className="size-4" />
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
