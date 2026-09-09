"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Copy,
  Dices,
  Check,
  History,
  LogOut,
  Settings,
  Shield,
  Shuffle,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuestionCard } from "@/components/question-card";
import { MiniGamePicker } from "@/components/mini-game-picker";
import { IntensityDialog } from "@/components/intensity-dialog";
import { SettingsModal } from "@/components/settings-modal";
import { SwitchModeConfirm } from "@/components/switch-mode-confirm";
import { HistoryPanel } from "@/components/history-panel";
import { PlayerList } from "@/components/player-list";
import { getIntensityDef, intensityTheme } from "@/lib/intensity";
import { getMiniGameById, getMiniGamesForMode } from "@/lib/mini-games";
import { modeTheme } from "@/lib/mode-theme";
import { roomShareUrl } from "@/lib/room-code";
import { PlayerRow, RoomRow } from "@/lib/room-types";
import { Intensity, MiniGameId, Mode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RoomScreenProps {
  roomCode: string;
  room: RoomRow;
  players: PlayerRow[];
  isHost: boolean;
  connected: boolean;
  onSetMode: (mode: Mode) => void;
  onSetIntensity: (intensity: Intensity) => void;
  onPickMiniGame: (id: MiniGameId) => void;
  onNextQuestion: () => void;
  onSkipQuestion: () => void;
  onResetSession: () => void;
  onLeave: () => void;
  onOpenIdentity: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function RoomScreen({
  roomCode,
  room,
  players,
  isHost,
  connected,
  onSetMode,
  onSetIntensity,
  onPickMiniGame,
  onNextQuestion,
  onSkipQuestion,
  onResetSession,
  onLeave,
  onOpenIdentity,
  soundEnabled,
  onToggleSound,
}: RoomScreenProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [intensityOpen, setIntensityOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [switchModeOpen, setSwitchModeOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const theme = modeTheme[room.mode];
  const intensityDef = getIntensityDef(room.intensity);
  const intensityColor = intensityTheme[room.intensity];
  const currentGame = room.current_mini_game
    ? (getMiniGameById(room.current_mini_game) ?? null)
    : null;
  const host = players.find((p) => p.id === room.host_id);

  function copyLink() {
    const url = roomShareUrl(roomCode);
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-neutral-50 dark:bg-neutral-950">
      <div className={cn("bg-gradient-to-r", theme.gradient)}>
        <div className="pt-safe flex items-center gap-1.5 px-3 pb-2">
          <Badge variant="soft" className={cn("gap-1.5 px-3 py-1.5", theme.chip)}>
            <theme.icon className="size-3.5" />
            {theme.label.replace(" Mode", "")}
          </Badge>

          <button
            onClick={() => isHost && setIntensityOpen(true)}
            disabled={!isHost}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 disabled:active:scale-100",
              intensityColor.chip
            )}
          >
            {intensityDef.emoji} {intensityDef.label}
            {isHost && <ChevronDown className="size-3" />}
          </button>

          <button
            onClick={copyLink}
            className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-black/10 px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span className="truncate tracking-wide">{copied ? "Link copied" : roomCode}</span>
          </button>

          <button
            onClick={onToggleSound}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 active:scale-95"
            aria-label={soundEnabled ? "Mute sound effects" : "Unmute sound effects"}
          >
            {soundEnabled ? <Volume2 className="size-4.5" /> : <VolumeX className="size-4.5" />}
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 active:scale-95"
            aria-label="Settings and rules"
          >
            <Settings className="size-4.5" />
          </button>
        </div>

        <div className="px-3 pb-3">
          <PlayerList players={players} hostId={room.host_id} />
        </div>
      </div>

      {!connected && (
        <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          <WifiOff className="size-3.5" />
          Reconnecting…
        </div>
      )}

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-5">
        <button
          onClick={() => isHost && setPickerOpen(true)}
          disabled={!isHost}
          className="mb-4 flex items-center justify-between rounded-2xl border-2 border-dashed border-black/10 bg-white px-4 py-3.5 text-left transition active:scale-[0.98] disabled:active:scale-100 dark:border-white/15 dark:bg-white/5"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            <Dices className={cn("size-4.5", theme.accentText)} />
            {currentGame ? currentGame.name : "Pick a Mini-Game"}
          </span>
          <span className="text-xs font-medium text-neutral-400">
            {isHost ? (currentGame ? "Switch" : "Choose →") : host ? `${host.name} is hosting` : ""}
          </span>
        </button>

        <QuestionCard
          miniGame={currentGame}
          intensity={room.intensity}
          question={room.current_question_text}
          round={room.round}
        />

        <div className="flex-1" />

        <div className="mt-6 flex flex-col gap-3">
          {isHost ? (
            <div className="flex gap-3">
              <Button
                size="xl"
                variant="outline"
                onClick={onSkipQuestion}
                disabled={!currentGame}
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
          ) : (
            <p className="rounded-2xl bg-black/5 px-4 py-3 text-center text-sm font-medium text-neutral-500 dark:bg-white/5 dark:text-neutral-400">
              {host ? `${host.name} controls this round.` : "Waiting for a host…"}
            </p>
          )}

          <div className={cn("grid gap-2", isHost ? "grid-cols-4" : "grid-cols-3")}>
            {isHost && (
              <ActionChip
                icon={<Shuffle className="size-4" />}
                label="Switch Mode"
                onClick={() => setSwitchModeOpen(true)}
              />
            )}
            <ActionChip
              icon={<SlidersHorizontal className="size-4" />}
              label="Profile"
              onClick={onOpenIdentity}
            />
            <ActionChip
              icon={<History className="size-4" />}
              label="History"
              onClick={() => setHistoryOpen(true)}
            />
            <ActionChip icon={<LogOut className="size-4" />} label="Leave" onClick={onLeave} />
          </div>
        </div>
      </div>

      {isHost && (
        <MiniGamePicker
          mode={room.mode}
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onPick={onPickMiniGame}
          onRandom={() => {
            const games = getMiniGamesForMode(room.mode);
            const choice = games[Math.floor(Math.random() * games.length)];
            if (choice) onPickMiniGame(choice.id);
          }}
          currentMiniGame={room.current_mini_game}
        />
      )}

      {isHost && (
        <IntensityDialog
          open={intensityOpen}
          onOpenChange={setIntensityOpen}
          intensity={room.intensity}
          onChange={onSetIntensity}
        />
      )}

      {isHost && (
        <SwitchModeConfirm
          open={switchModeOpen}
          onOpenChange={setSwitchModeOpen}
          currentMode={room.mode}
          onConfirm={(next) => {
            onSetMode(next);
            setSwitchModeOpen(false);
          }}
        />
      )}

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      <HistoryPanel
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        playedQuestions={room.played_question_texts}
        onResetSession={onResetSession}
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
