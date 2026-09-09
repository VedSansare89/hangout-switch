"use client";

import confetti from "canvas-confetti";

export function fireSpicyConfetti() {
  const colors = ["#f43f5e", "#ec4899", "#f97316", "#fb7185"];

  confetti({
    particleCount: 90,
    spread: 80,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors,
    scalar: 1.05,
    ticks: 200,
  });

  confetti({
    particleCount: 50,
    angle: 60,
    spread: 60,
    origin: { x: 0, y: 0.7 },
    colors,
  });

  confetti({
    particleCount: 50,
    angle: 120,
    spread: 60,
    origin: { x: 1, y: 0.7 },
    colors,
  });
}

export function fireSuccessConfetti() {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.65 },
    colors: ["#34d399", "#60a5fa", "#fbbf24"],
  });
}
