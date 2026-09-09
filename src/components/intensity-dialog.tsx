"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IntensitySelector } from "@/components/intensity-selector";
import { getIntensityDef } from "@/lib/intensity";
import { Intensity } from "@/lib/types";

interface IntensityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intensity: Intensity;
  onChange: (intensity: Intensity) => void;
}

export function IntensityDialog({
  open,
  onOpenChange,
  intensity,
  onChange,
}: IntensityDialogProps) {
  const def = getIntensityDef(intensity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle>Change intensity</DialogTitle>
          <DialogDescription>{def.description}</DialogDescription>
        </DialogHeader>

        <IntensitySelector
          value={intensity}
          onChange={(next) => {
            onChange(next);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
