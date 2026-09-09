"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Dices,
  Heart,
  PartyPopper,
  Shield,
  Shuffle,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TopBar } from "@/components/top-bar";
import { QuestionCard } from "@/components/question-card";
import { MiniGamePicker } from "@/components/mini-game-picker";
import { HostEditor } from "@/components/host-editor";
import { IntensityDialog } from "@/components/intensity-dialog";
import { SettingsModal } from "@/components/settings-modal";
import { getMiniGameById } from "@/lib/mini-games";
import { modeTheme } from "@/lib/mode-theme";
import { GameState, Intensity, MiniGameId, Mode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GameScreenProps {
  gameState: GameState;
  onPickMiniGame: (id: MiniGameId) => void;
  onRandomMiniGame: () => void;
  onNextQuestion: () => void;
  onSkip: () => void;
  onChangeIntensity: (intensity: Intensity) => void;
  onChangeMode: (mode: Mode) => void;
  onChangeHost: (name: string) => void;
}

export function GameScreen({
  gameState,
  onPickMiniGame,
  onRandomMiniGame,
  onNextQuestion,
  onSkip,
  onChangeIntensity,
  onChangeMode,
  onChangeHost,
}: GameScreenProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hostEditorOpen, setHostEditorOpen] = useState(false);
  const [intensityOpen, setIntensityOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [switchModeOpen, setSwitchModeOpen] = useState(false);

  const theme = modeTheme[gameState.mode];
  const currentGame = gameState.currentMiniGame
    ? getMiniGameById(gameState.currentMiniGame)
    : null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-neutral-50 dark:bg-neutral-950">
      <div className={cn("bg-gradient-to-r", theme.gradient)}>
        <TopBar
          gameState={gameState}
          onOpenHostEditor={() => setHostEditorOpen(true)}
          onOpenIntensity={() => setIntensityOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-5">
        <button
          onClick={() => setPickerOpen(true)}
          className="mb-4 flex items-center justify-between rounded-2xl border-2 border-dashed border-black/10 bg-white px-4 py-3.5 text-left transition active:scale-[0.98] dark:border-white/15 dark:bg-white/5"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            <Dices className={cn("size-4.5", theme.accentText)} />
            {currentGame ? currentGame.name : "Pick a Mini-Game"}
          </span>
          <span className="text-xs font-medium text-neutral-400">
            {currentGame ? "Switch" : "Choose →"}
          </span>
        </button>

        <QuestionCard
          miniGame={currentGame ?? null}
          intensity={gameState.intensity}
          question={gameState.currentQuestion}
          round={gameState.round}
        />

        <div className="flex-1" />

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex gap-3">
            <Button
              size="xl"
              variant="outline"
              onClick={onSkip}
              className="gap-2 border-2 text-neutral-500 dark:text-neutral-300"
              aria-label="Skip this question — safe word"
            >
              <Shield className="size-4.5" />
              Skip
            </Button>
            <Button
              size="xl"
              variant="gradient"
              onClick={currentGame ? onNextQuestion : () => setPickerOpen(true)}
              className={cn("flex-1 gap-2 shadow-xl", theme.buttonGradient)}
            >
              {currentGame ? "Next Question" : "Pick a Mini-Game"}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <ActionChip
              icon={<SlidersHorizontal className="size-4" />}
              label="Intensity"
              onClick={() => setIntensityOpen(true)}
            />
            <ActionChip
              icon={<Shuffle className="size-4" />}
              label="Switch Mode"
              onClick={() => setSwitchModeOpen(true)}
            />
            <ActionChip
              icon={<UsersRound className="size-4" />}
              label="New Host"
              onClick={() => setHostEditorOpen(true)}
            />
          </div>
        </div>
      </div>

      <MiniGamePicker
        mode={gameState.mode}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={onPickMiniGame}
        onRandom={onRandomMiniGame}
        currentMiniGame={gameState.currentMiniGame}
      />

      <HostEditor
        hostName={gameState.hostName}
        onChange={onChangeHost}
        open={hostEditorOpen}
        onOpenChange={setHostEditorOpen}
      />

      <IntensityDialog
        open={intensityOpen}
        onOpenChange={setIntensityOpen}
        intensity={gameState.intensity}
        onChange={onChangeIntensity}
      />

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      <SwitchModeConfirm
        open={switchModeOpen}
        onOpenChange={setSwitchModeOpen}
        currentMode={gameState.mode}
        onConfirm={(next) => {
          onChangeMode(next);
          setSwitchModeOpen(false);
        }}
      />
    </div>
  );
}

function ActionChip({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-2xl bg-black/5 px-2 py-3 text-neutral-600 transition hover:bg-black/10 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/15"
    >
      {icon}
      <span className="text-[11px] font-semibold">{label}</span>
    </motion.button>
  );
}

function SwitchModeConfirm({
  open,
  onOpenChange,
  currentMode,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMode: Mode;
  onConfirm: (mode: Mode) => void;
}) {
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
