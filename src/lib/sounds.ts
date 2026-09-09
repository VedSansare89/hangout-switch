let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextCtor =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;

  if (!audioContext) {
    audioContext = new AudioContextCtor();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

function tone(freq: number, startOffset: number, duration: number, gainPeak: number, ctx: AudioContext) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = freq;

  const startTime = ctx.currentTime + startOffset;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  tone(720, 0, 0.08, 0.05, ctx);
}

export function playNewQuestionSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  tone(523.25, 0, 0.14, 0.06, ctx); // C5
  tone(783.99, 0.07, 0.18, 0.06, ctx); // G5
}

export function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  tone(523.25, 0, 0.12, 0.06, ctx);
  tone(659.25, 0.08, 0.12, 0.06, ctx);
  tone(783.99, 0.16, 0.2, 0.06, ctx);
}
