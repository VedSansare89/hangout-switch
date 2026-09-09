"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HomeScreen } from "@/components/screens/home-screen";
import { SetupScreen } from "@/components/screens/setup-screen";
import { GameScreen } from "@/components/screens/game-screen";
import { SettingsModal } from "@/components/settings-modal";
import { fireSpicyConfetti } from "@/components/confetti-burst";
import { getMiniGamesForMode } from "@/lib/mini-games";
import { getQuestionPool, pickRandomQuestion, pushRecent } from "@/lib/questions";
import { loadSession, saveSession } from "@/lib/storage";
import { GameState, Intensity, MiniGameId, Mode, Screen } from "@/lib/types";

const DEFAULT_STATE: GameState = {
  mode: "friends",
  intensity: "low",
  hostName: "Host",
  round: 0,
  currentMiniGame: null,
  currentQuestion: null,
  recentQuestions: [],
};

export function HangoutSwitchApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);
  const [infoOpen, setInfoOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setScreen(saved.screen);
      setGameState(saved.gameState);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveSession({ screen, gameState });
  }, [screen, gameState, hydrated]);

  function drawQuestion(mode: Mode, intensity: Intensity, miniGame: MiniGameId, recent: string[]) {
    const pool = getQuestionPool(mode, miniGame, intensity);
    return pickRandomQuestion(pool, recent);
  }

  function handleSelectMode(mode: Mode) {
    setGameState({ ...DEFAULT_STATE, mode, hostName: gameState.hostName });
    setScreen("setup");
  }

  function handleSetupChangeMode(mode: Mode) {
    setGameState((s) => ({ ...s, mode }));
  }

  function handleSetupChangeIntensity(intensity: Intensity) {
    if (intensity === "high") fireSpicyConfetti();
    setGameState((s) => ({ ...s, intensity }));
  }

  function handleStartGame() {
    setScreen("game");
  }

  function selectMiniGame(id: MiniGameId) {
    setGameState((s) => {
      const question = drawQuestion(s.mode, s.intensity, id, []);
      return {
        ...s,
        currentMiniGame: id,
        currentQuestion: question,
        recentQuestions: question ? [question] : [],
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
    setGameState((s) => {
      if (!s.currentMiniGame) return s;
      const question = drawQuestion(s.mode, s.intensity, s.currentMiniGame, s.recentQuestions);
      return {
        ...s,
        currentQuestion: question,
        recentQuestions: question ? pushRecent(s.recentQuestions, question) : s.recentQuestions,
        round: s.round + 1,
      };
    });
  }

  function handleSkip() {
    setGameState((s) => {
      if (!s.currentMiniGame) return s;
      const question = drawQuestion(s.mode, s.intensity, s.currentMiniGame, s.recentQuestions);
      return {
        ...s,
        currentQuestion: question,
        recentQuestions: question ? pushRecent(s.recentQuestions, question) : s.recentQuestions,
      };
    });
  }

  function handleChangeIntensity(intensity: Intensity) {
    if (intensity === "high" && intensity !== gameState.intensity) fireSpicyConfetti();
    setGameState((s) => {
      const next: GameState = { ...s, intensity };
      if (s.currentMiniGame) {
        const question = drawQuestion(s.mode, intensity, s.currentMiniGame, s.recentQuestions);
        next.currentQuestion = question;
        next.recentQuestions = question ? pushRecent(s.recentQuestions, question) : s.recentQuestions;
      }
      return next;
    });
  }

  function handleChangeMode(mode: Mode) {
    setGameState((s) => ({
      ...s,
      mode,
      currentMiniGame: null,
      currentQuestion: null,
      recentQuestions: [],
      round: 0,
    }));
  }

  function handleChangeHost(hostName: string) {
    setGameState((s) => ({ ...s, hostName }));
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
            <HomeScreen onSelectMode={handleSelectMode} onOpenInfo={() => setInfoOpen(true)} />
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
              onChangeMode={handleSetupChangeMode}
              onChangeIntensity={handleSetupChangeIntensity}
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
              onChangeHost={handleChangeHost}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal open={infoOpen} onOpenChange={setInfoOpen} />
    </div>
  );
}
