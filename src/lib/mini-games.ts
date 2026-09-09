import {
  Drama,
  FingerprintPattern,
  Flame,
  Hand,
  Heart,
  HeartHandshake,
  SquareSplitHorizontal,
  Users,
  Zap,
} from "lucide-react";
import { MiniGameDef, Mode } from "./types";

export const MINI_GAMES: MiniGameDef[] = [
  {
    id: "would-you-rather",
    name: "Would You Rather",
    tagline: "Pick a side. There's no wrong answer (mostly).",
    icon: SquareSplitHorizontal,
    modes: ["friends", "couples"],
    howToPlay:
      "Read both options out loud. Everyone picks one and defends their choice. Bonus points for spicy debates.",
  },
  {
    id: "two-truths-a-lie",
    name: "Two Truths and a Lie",
    tagline: "Two facts, one fib. Can they spot it?",
    icon: FingerprintPattern,
    modes: ["friends", "couples"],
    howToPlay:
      "The Host reads the prompt as inspiration. The current player shares three statements about themselves — two true, one false. Everyone else guesses the lie.",
  },
  {
    id: "never-have-i-ever",
    name: "Never Have I Ever",
    tagline: "Confess or stay silent. Fingers down.",
    icon: Hand,
    modes: ["friends", "couples"],
    howToPlay:
      'Read the statement out loud. Anyone who HAS done it puts a finger down (or takes a sip). Last one with fingers up "wins."',
  },
  {
    id: "most-likely-to",
    name: "Most Likely To",
    tagline: "Point fingers. Literally.",
    icon: Users,
    modes: ["friends"],
    howToPlay:
      "Read the prompt out loud. On the count of three, everyone points at whoever fits best. Majority vote gets roasted.",
  },
  {
    id: "rapid-fire",
    name: "Categories / Rapid Fire",
    tagline: "Quick answers, quicker laughs.",
    icon: Zap,
    modes: ["friends"],
    howToPlay:
      "Set a 10-second timer. The player must answer or complete the prompt before time runs out. No overthinking allowed.",
  },
  {
    id: "charades",
    name: "Charades / Heads Up",
    tagline: "Act it out. No talking!",
    icon: Drama,
    modes: ["friends"],
    howToPlay:
      "One player acts out the prompt silently while everyone else guesses. Set a 60-second timer for extra pressure.",
  },
  {
    id: "truth-or-dare",
    name: "Truth or Dare",
    tagline: "Choose wisely, love.",
    icon: Flame,
    modes: ["couples"],
    howToPlay:
      "Reveal the card and decide together whether it's a truth to answer honestly or a dare to act out right now.",
  },
  {
    id: "how-well-do-you-know-me",
    name: "How Well Do You Know Me?",
    tagline: "Put that relationship to the test.",
    icon: HeartHandshake,
    modes: ["couples"],
    howToPlay:
      "One partner guesses the other's answer before they reveal it. Score a point for every correct guess.",
  },
  {
    id: "intimate-questions",
    name: "Intimate Questions",
    tagline: "Slow down and get closer.",
    icon: Heart,
    modes: ["couples"],
    howToPlay:
      "Take turns reading and answering. There's no rush here — this one's about really listening to each other.",
  },
];

export function getMiniGamesForMode(mode: Mode): MiniGameDef[] {
  return MINI_GAMES.filter((g) => g.modes.includes(mode));
}

export function getMiniGameById(id: string): MiniGameDef | undefined {
  return MINI_GAMES.find((g) => g.id === id);
}
