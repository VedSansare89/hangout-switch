"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HomeScreen } from "@/components/screens/home-screen";
import { SetupScreen } from "@/components/screens/setup-screen";
import { GameScreen } from "@/components/screens/game-screen";
import { CreateRoomScreen } from "@/components/screens/create-room-screen";
import { JoinRoomScreen } from "@/components/screens/join-room-screen";
import { RoomScreen } from "@/components/screens/room-screen";
import { SettingsModal } from "@/components/settings-modal";
import { HostEditor } from "@/components/host-editor";
import { HistoryPanel } from "@/components/history-panel";
import { DailyPackModal } from "@/components/daily-pack-modal";
import { fireSpicyConfetti } from "@/components/confetti-burst";
import { getMiniGamesForMode, MINI_GAMES } from "@/lib/mini-games";
import { getQuestionPool, pickRandomQuestion } from "@/lib/questions";
import { loadSession, saveSession } from "@/lib/storage";
import { getOrCreatePlayerIdentity, savePlayerIdentity } from "@/lib/player";
import { playClickSound, playNewQuestionSound } from "@/lib/sounds";
import { INTENSITIES } from "@/lib/intensity";
import { generateRoomCode, normalizeRoomCode } from "@/lib/room-code";
import { useRoom } from "@/hooks/use-room";
import {
  RoomActionError,
  createRoom,
  joinRoom,
  leaveRoom,
  nextQuestion as rpcNextQuestion,
  pickMiniGame as rpcPickMiniGame,
  resetSession as rpcResetSession,
  setRoomIntensity,
  setRoomMode,
  skipQuestion as rpcSkipQuestion,
  updatePlayerProfile,
} from "@/lib/room-actions";
import { GameState, Intensity, MiniGameId, Mode, Screen } from "@/lib/types";

function freshDefaultState(): GameState {
  const identity = typeof window !== "undefined" ? getOrCreatePlayerIdentity() : null;
  return {
    mode: "friends",
    intensity: "low",
    hostName: identity?.name ?? "",
    hostAvatarId: identity?.avatarId ?? "fox",
    round: 0,
    currentMiniGame: null,
    currentQuestion: null,
    playedQuestions: [],
    soundEnabled: true,
  };
}

const JOIN_ERROR_MESSAGES: Record<string, string> = {
  ROOM_NOT_FOUND: "That room code doesn't exist. Double-check it and try again.",
  WRONG_PASSCODE: "Incorrect passcode.",
};

const ROOM_LOAD_TIMEOUT_MS = 8000;

interface HangoutSwitchAppProps {
  initialRoomCode?: string;
}

export function HangoutSwitchApp({ initialRoomCode }: HangoutSwitchAppProps) {
  const [screen, setScreen] = useState<Screen>("home");
  const [gameState, setGameState] = useState<GameState>(() => ({
    mode: "friends",
    intensity: "low",
    hostName: "",
    hostAvatarId: "fox",
    round: 0,
    currentMiniGame: null,
    currentQuestion: null,
    playedQuestions: [],
    soundEnabled: true,
  }));
  const [infoOpen, setInfoOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [dailyPackOpen, setDailyPackOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [needsPasscode, setNeedsPasscode] = useState(false);
  const [roomTimedOut, setRoomTimedOut] = useState(false);
  const playerId = getOrCreatePlayerIdentity().id;

  const { room, players, connected, isHost } = useRoom({
    roomCode: roomCode ?? "",
    playerId,
    enabled: !!roomCode,
  });

  useEffect(() => {
    const saved = loadSession();
    if (initialRoomCode) {
      if (saved) setGameState(saved.gameState);
      else setGameState(freshDefaultState());
      setScreen("join-room");
    } else if (saved) {
      setGameState(saved.gameState);
      if (saved.screen === "room" && saved.roomConnect) {
        setRoomCode(saved.roomConnect.roomCode);
        setScreen("room");
      } else {
        setScreen(saved.screen === "room" ? "home" : saved.screen);
      }
    } else {
      setGameState(freshDefaultState());
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveSession({
        screen,
        gameState,
        roomConnect: screen === "room" && roomCode ? { roomCode } : null,
      });
    }
  }, [screen, gameState, hydrated, roomCode]);

  // If a room never loads (bad code, or the room was cleaned up), fall back
  // to home instead of leaving the user on an infinite spinner.
  useEffect(() => {
    if (screen !== "room" || room) {
      setRoomTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setRoomTimedOut(true), ROOM_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [screen, room]);

  function drawQuestion(mode: Mode, intensity: Intensity, miniGame: MiniGameId, played: string[]) {
    const pool = getQuestionPool(mode, miniGame, intensity);
    return pickRandomQuestion(pool, played);
  }

  function playSound(kind: "click" | "question") {
    if (!gameState.soundEnabled) return;
    if (kind === "click") playClickSound();
    else playNewQuestionSound();
  }

  function handleSelectMode(mode: Mode) {
    playSound("click");
    setGameState((s) => ({
      ...freshDefaultState(),
      mode,
      hostName: s.hostName,
      hostAvatarId: s.hostAvatarId,
      soundEnabled: s.soundEnabled,
    }));
    setScreen("setup");
  }

  function handleMoodSelect(mode: Mode, intensity: Intensity) {
    playSound("click");
    if (intensity === "high") fireSpicyConfetti();
    setGameState((s) => ({
      ...freshDefaultState(),
      mode,
      intensity,
      hostName: s.hostName,
      hostAvatarId: s.hostAvatarId,
      soundEnabled: s.soundEnabled,
    }));
    setScreen("setup");
  }

  function handleRandomEverything() {
    playSound("click");
    const mode: Mode = Math.random() < 0.5 ? "friends" : "couples";
    const intensity = INTENSITIES[Math.floor(Math.random() * INTENSITIES.length)].id;
    const games = getMiniGamesForMode(mode);
    const game = games[Math.floor(Math.random() * games.length)] ?? MINI_GAMES[0];
    if (intensity === "high") fireSpicyConfetti();

    setGameState((s) => {
      const question = drawQuestion(mode, intensity, game.id, []);
      return {
        ...s,
        mode,
        intensity,
        currentMiniGame: game.id,
        currentQuestion: question,
        playedQuestions: question ? [question] : [],
        round: 1,
      };
    });
    setScreen("game");
  }

  function handleSetupChangeMode(mode: Mode) {
    setGameState((s) => ({ ...s, mode }));
  }

  function handleSetupChangeIntensity(intensity: Intensity) {
    if (intensity === "high") fireSpicyConfetti();
    setGameState((s) => ({ ...s, intensity }));
  }

  function proceedToGame() {
    setScreen("game");
  }

  function handleStartGame() {
    playSound("click");
    if (!gameState.hostName.trim()) {
      setPendingStart(true);
      setIdentityOpen(true);
      return;
    }
    proceedToGame();
  }

  function handleSaveIdentity(name: string, avatarId: string) {
    savePlayerIdentity({ id: playerId, name, avatarId });
    setGameState((s) => ({ ...s, hostName: name, hostAvatarId: avatarId }));
    if (roomCode) {
      updatePlayerProfile(playerId, name, avatarId).catch(() => {});
    }
    if (pendingStart) {
      setPendingStart(false);
      proceedToGame();
    }
  }

  function selectMiniGame(id: MiniGameId) {
    playSound("question");
    setGameState((s) => {
      const question = drawQuestion(s.mode, s.intensity, id, s.playedQuestions);
      return {
        ...s,
        currentMiniGame: id,
        currentQuestion: question,
        playedQuestions: question ? [...s.playedQuestions, question] : s.playedQuestions,
        round: s.round + 1,
      };
    });
  }

  function handleRandomMiniGame() {
    const games = getMiniGamesForMode(gameState.mode);
    const choice = games[Math.floor(Math.random() * games.length)];
    if (choice) selectMiniGame(choice.id);
  }

  function handleNextQuestion() {
    playSound("question");
    setGameState((s) => {
      if (!s.currentMiniGame) return s;
      const question = drawQuestion(s.mode, s.intensity, s.currentMiniGame, s.playedQuestions);
      return {
        ...s,
        currentQuestion: question,
        playedQuestions: question ? [...s.playedQuestions, question] : s.playedQuestions,
        round: s.round + 1,
      };
    });
  }

  function handleSkip() {
    playSound("click");
    setGameState((s) => {
      if (!s.currentMiniGame) return s;
      const question = drawQuestion(s.mode, s.intensity, s.currentMiniGame, s.playedQuestions);
      return {
        ...s,
        currentQuestion: question,
        playedQuestions: question ? [...s.playedQuestions, question] : s.playedQuestions,
      };
    });
  }

  function handleChangeIntensity(intensity: Intensity) {
    if (intensity === "high" && intensity !== gameState.intensity) fireSpicyConfetti();
    playSound("click");
    setGameState((s) => {
      const next: GameState = { ...s, intensity };
      if (s.currentMiniGame) {
        const question = drawQuestion(s.mode, intensity, s.currentMiniGame, s.playedQuestions);
        next.currentQuestion = question;
        next.playedQuestions = question ? [...s.playedQuestions, question] : s.playedQuestions;
      }
      return next;
    });
  }

  function handleChangeMode(mode: Mode) {
    playSound("click");
    setGameState((s) => ({
      ...s,
      mode,
      currentMiniGame: null,
      currentQuestion: null,
      playedQuestions: [],
      round: 0,
    }));
  }

  function handleResetSession() {
    setGameState((s) => ({ ...s, playedQuestions: [] }));
  }

  function handleToggleSound() {
    setGameState((s) => ({ ...s, soundEnabled: !s.soundEnabled }));
  }

  // ---- Room flow -----------------------------------------------------

  async function handleCreateRoom(params: {
    mode: Mode;
    intensity: Intensity;
    name: string;
    avatarId: string;
    locked: boolean;
    passcode: string;
  }) {
    playSound("click");
    savePlayerIdentity({ id: playerId, name: params.name, avatarId: params.avatarId });
    setGameState((s) => ({ ...s, hostName: params.name, hostAvatarId: params.avatarId }));
    setJoinError(null);
    setJoining(true);

    let code = generateRoomCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await createRoom({
          code,
          mode: params.mode,
          intensity: params.intensity,
          hostId: playerId,
          hostName: params.name,
          hostAvatarId: params.avatarId,
          locked: params.locked,
          passcode: params.locked ? params.passcode : undefined,
        });
        setJoining(false);
        setRoomCode(code);
        setScreen("room");
        return;
      } catch {
        // Room code collision (extremely unlikely) — try a fresh code.
        code = generateRoomCode();
      }
    }
    setJoining(false);
    setJoinError("Couldn't create a room right now. Please try again.");
  }

  async function handleJoinRoom(params: {
    roomCode: string;
    name: string;
    avatarId: string;
    passcode: string;
  }) {
    playSound("click");
    const code = normalizeRoomCode(params.roomCode);
    savePlayerIdentity({ id: playerId, name: params.name, avatarId: params.avatarId });
    setGameState((s) => ({ ...s, hostName: params.name, hostAvatarId: params.avatarId }));
    setJoinError(null);
    setJoining(true);

    try {
      await joinRoom({
        code,
        playerId,
        name: params.name,
        avatarId: params.avatarId,
        passcode: params.passcode || undefined,
      });
      setJoining(false);
      setRoomCode(code);
      setScreen("room");
    } catch (err) {
      setJoining(false);
      const roomErr = err instanceof RoomActionError ? err.code : "UNKNOWN";
      if (roomErr === "WRONG_PASSCODE") setNeedsPasscode(true);
      setJoinError(JOIN_ERROR_MESSAGES[roomErr] ?? "Something went wrong joining that room.");
    }
  }

  function handleLeaveRoom() {
    if (roomCode) leaveRoom(roomCode, playerId).catch(() => {});
    setRoomCode(null);
    setJoinError(null);
    setNeedsPasscode(false);
    setScreen("home");
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {screen === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <HomeScreen
              onSelectMode={handleSelectMode}
              onOpenInfo={() => setInfoOpen(true)}
              onSelectMood={handleMoodSelect}
              onRandomEverything={handleRandomEverything}
              onOpenDailyPack={() => setDailyPackOpen(true)}
              onCreateRoom={() => setScreen("create-room")}
              onJoinRoom={() => setScreen("join-room")}
            />
          </motion.div>
        )}

        {screen === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <SetupScreen
              mode={gameState.mode}
              intensity={gameState.intensity}
              hostName={gameState.hostName}
              hostAvatarId={gameState.hostAvatarId}
              onChangeMode={handleSetupChangeMode}
              onChangeIntensity={handleSetupChangeIntensity}
              onOpenIdentity={() => {
                setPendingStart(false);
                setIdentityOpen(true);
              }}
              onStart={handleStartGame}
              onBack={() => setScreen("home")}
            />
          </motion.div>
        )}

        {screen === "game" && (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <GameScreen
              gameState={gameState}
              onPickMiniGame={selectMiniGame}
              onRandomMiniGame={handleRandomMiniGame}
              onNextQuestion={handleNextQuestion}
              onSkip={handleSkip}
              onChangeIntensity={handleChangeIntensity}
              onChangeMode={handleChangeMode}
              onOpenIdentity={() => {
                setPendingStart(false);
                setIdentityOpen(true);
              }}
              onOpenHistory={() => setHistoryOpen(true)}
              onToggleSound={handleToggleSound}
            />
          </motion.div>
        )}

        {screen === "create-room" && (
          <motion.div
            key="create-room"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <CreateRoomScreen
              initialName={gameState.hostName}
              initialAvatarId={gameState.hostAvatarId}
              onBack={() => setScreen("home")}
              onCreate={handleCreateRoom}
            />
          </motion.div>
        )}

        {screen === "join-room" && (
          <motion.div
            key="join-room"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <JoinRoomScreen
              initialCode={initialRoomCode}
              initialName={gameState.hostName}
              initialAvatarId={gameState.hostAvatarId}
              needsPasscode={needsPasscode}
              errorMessage={joinError}
              connecting={joining}
              onBack={() => {
                setJoinError(null);
                setNeedsPasscode(false);
                setScreen("home");
              }}
              onJoin={handleJoinRoom}
            />
          </motion.div>
        )}

        {screen === "room" && !room && (
          <motion.div
            key="room-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-neutral-50 px-6 text-center dark:bg-neutral-950"
          >
            {roomTimedOut ? (
              <>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Couldn&apos;t find that room. It may have expired.
                </p>
                <button
                  onClick={handleLeaveRoom}
                  className="text-xs font-semibold text-neutral-400 underline underline-offset-2"
                >
                  Back to home
                </button>
              </>
            ) : (
              <>
                <div className="size-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-700 dark:border-neutral-700 dark:border-t-neutral-200" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Reconnecting to your room…
                </p>
                <button
                  onClick={handleLeaveRoom}
                  className="text-xs font-semibold text-neutral-400 underline underline-offset-2"
                >
                  Back to home
                </button>
              </>
            )}
          </motion.div>
        )}

        {screen === "room" && room && roomCode && (
          <motion.div
            key="room"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <RoomScreen
              roomCode={roomCode}
              room={room}
              players={players}
              isHost={isHost}
              connected={connected}
              onSetMode={(mode) => setRoomMode(roomCode, playerId, mode)}
              onSetIntensity={(intensity) => setRoomIntensity(roomCode, playerId, intensity)}
              onPickMiniGame={(id) => rpcPickMiniGame(roomCode, playerId, id)}
              onNextQuestion={() => rpcNextQuestion(roomCode, playerId)}
              onSkipQuestion={() => rpcSkipQuestion(roomCode, playerId)}
              onResetSession={() => rpcResetSession(roomCode, playerId)}
              onLeave={handleLeaveRoom}
              onOpenIdentity={() => {
                setPendingStart(false);
                setIdentityOpen(true);
              }}
              soundEnabled={gameState.soundEnabled}
              onToggleSound={handleToggleSound}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal open={infoOpen} onOpenChange={setInfoOpen} />

      <HostEditor
        hostName={gameState.hostName}
        hostAvatarId={gameState.hostAvatarId}
        onSave={handleSaveIdentity}
        open={identityOpen}
        onOpenChange={(open) => {
          setIdentityOpen(open);
          if (!open) setPendingStart(false);
        }}
      />

      <HistoryPanel
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        playedQuestions={gameState.playedQuestions}
        onResetSession={handleResetSession}
      />

      <DailyPackModal open={dailyPackOpen} onOpenChange={setDailyPackOpen} />
    </div>
  );
}
