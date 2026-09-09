"use client";

import { Heart, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { modeTheme } from "@/lib/mode-theme";
import { Mode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SwitchModeConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMode: Mode;
  onConfirm: (mode: Mode) => void;
}

export function SwitchModeConfirm({
  open,
  onOpenChange,
  currentMode,
  onConfirm,
}: SwitchModeConfirmProps) {
  const target: Mode = currentMode === "friends" ? "couples" : "friends";
  const targetTheme = modeTheme[target];
  const TargetIcon = target === "friends" ? PartyPopper : Heart;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle>Switch to {targetTheme.label}?</DialogTitle>
          <DialogDescription>
            Your current mini-game and question will reset to fit the new mode.
          </DialogDescription>
        </DialogHeader>
        <Button
          size="lg"
          variant="gradient"
          onClick={() => onConfirm(target)}
          className={cn("w-full gap-2", targetTheme.buttonGradient)}
        >
          <TargetIcon className="size-4.5" />
          Switch to {targetTheme.label}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
