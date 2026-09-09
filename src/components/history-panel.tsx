"use client";

import { History, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playedQuestions: string[];
  onResetSession: () => void;
}

export function HistoryPanel({
  open,
  onOpenChange,
  playedQuestions,
  onResetSession,
}: HistoryPanelProps) {
  const ordered = [...playedQuestions].reverse();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-4.5 text-neutral-500" />
            Previously played
          </DialogTitle>
          <DialogDescription>
            {ordered.length > 0
              ? `${ordered.length} question${ordered.length === 1 ? "" : "s"} shown this session. None of these will repeat until you reset.`
              : "Nothing played yet this session."}
          </DialogDescription>
        </DialogHeader>

        {ordered.length > 0 && (
          <div className="-mx-1 flex flex-col gap-2 overflow-y-auto px-1">
            {ordered.map((q, i) => (
              <div
                key={`${q}-${i}`}
                className="rounded-xl bg-black/[0.03] px-3.5 py-2.5 text-sm text-neutral-700 dark:bg-white/5 dark:text-neutral-300"
              >
                {q}
              </div>
            ))}
          </div>
        )}

        {ordered.length > 0 && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              onResetSession();
              onOpenChange(false);
            }}
            className="w-full gap-2 border-2 text-neutral-600 dark:text-neutral-300"
          >
            <RotateCcw className="size-4" />
            Reset session history
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
