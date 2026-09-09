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
import { generateRoomCode } from "@/lib/room-code";
import { useRoom } from "@/hooks/use-room";
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

interface RoomConnectParams {
  roomCode: string;
  name: string;
  avatarId: string;
  passcode: string;
}

interface PendingRoomInit {
  mode: Mode;
  intensity: Intensity;
  locked: boolean;
  passcode: string;
}

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

  const [roomConnect, setRoomConnect] = useState<RoomConnectParams | null>(null);
  const [pendingRoomInit, setPendingRoomInit] = useState<PendingRoomInit | null>(null);
  const [needsPasscode, setNeedsPasscode] = useState(false);
  const playerId = getOrCreatePlayerIdentity().id;

  const { snapshot, connected, error, isHost, send: roomSend } = useRoom({
    roomCode: roomConnect?.roomCode ?? "",
    playerId,
    name: roomConnect?.name ?? "",
    avatarId: roomConnect?.avatarId ?? "fox",
    passcode: roomConnect?.passcode ?? "",
    enabled: !!roomConnect,
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
        setRoomConnect(saved.roomConnect);
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
        roomConnect: screen === "room" ? roomConnect : null,
      });
    }
  }, [screen, gameState, hydrated, roomConnect]);

  useEffect(() => {
    if (snapshot && (screen === "create-room" || screen === "join-room")) {
      setScreen("room");
    }
  }, [snapshot, screen]);

  useEffect(() => {
    if (error === "Incorrect passcode.") {
      setNeedsPasscode(true);
      setRoomConnect(null);
    }
  }, [error]);

  useEffect(() => {
    if (connected && isHost && pendingRoomInit) {
      roomSend({ type: "set-mode", mode: pendingRoomInit.mode });
      roomSend({ type: "set-intensity", intensity: pendingRoomInit.intensity });
      if (pendingRoomInit.locked) {
        roomSend({ type: "set-lock", locked: true, passcode: pendingRoomInit.passcode });
      }
      setPendingRoomInit(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, isHost, pendingRoomInit]);

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
    if (roomConnect) {
      roomSend({ type: "update-profile", name, avatarId });
      setRoomConnect((rc) => (rc ? { ...rc, name, avatarId } : rc));
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

  function handleCreateRoom(params: {
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
    setNeedsPasscode(false);
    setPendingRoomInit({
      mode: params.mode,
      intensity: params.intensity,
      locked: params.locked,
      passcode: params.passcode,
    });
    setRoomConnect({
      roomCode: generateRoomCode(),
      name: params.name,
      avatarId: params.avatarId,
      passcode: "",
    });
  }

  function handleJoinRoom(params: { roomCode: string; name: string; avatarId: string; passcode: string }) {
    playSound("click");
    savePlayerIdentity({ id: playerId, name: params.name, avatarId: params.avatarId });
    setGameState((s) => ({ ...s, hostName: params.name, hostAvatarId: params.avatarId }));
    setRoomConnect(params);
  }

  function handleLeaveRoom() {
    setRoomConnect(null);
    setPendingRoomInit(null);
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
              errorMessage={error}
              connecting={!!roomConnect && !connected}
              onBack={() => {
                setRoomConnect(null);
                setNeedsPasscode(false);
                setScreen("home");
              }}
              onJoin={handleJoinRoom}
            />
          </motion.div>
        )}

        {screen === "room" && !snapshot && (
          <motion.div
            key="room-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-neutral-50 px-6 text-center dark:bg-neutral-950"
          >
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
          </motion.div>
        )}

        {screen === "room" && snapshot && (
          <motion.div
            key="room"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <RoomScreen
              roomCode={roomConnect?.roomCode ?? snapshot.room.code}
              snapshot={snapshot}
              isHost={isHost}
              connected={connected}
              onSend={roomSend}
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
