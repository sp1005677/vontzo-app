let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  type: OscillatorType,
  duration: number,
  gainLevel: number,
  startTime?: number
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + (startTime ?? 0));
  gain.gain.setValueAtTime(gainLevel, ctx.currentTime + (startTime ?? 0));
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (startTime ?? 0) + duration);
  osc.start(ctx.currentTime + (startTime ?? 0));
  osc.stop(ctx.currentTime + (startTime ?? 0) + duration);
}

export function soundCorrect() {
  try {
    playTone(523, "sine", 0.12, 0.18, 0);
    playTone(659, "sine", 0.12, 0.18, 0.1);
    playTone(784, "sine", 0.18, 0.18, 0.2);
  } catch {
    // silently fail if audio blocked
  }
}

export function soundWrong() {
  try {
    playTone(200, "sawtooth", 0.15, 0.12, 0);
    playTone(160, "sawtooth", 0.2, 0.12, 0.1);
  } catch {
    // silently fail
  }
}

export function soundClick() {
  try {
    playTone(880, "sine", 0.05, 0.08, 0);
  } catch {
    // silently fail
  }
}

export function soundLevelComplete() {
  try {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      playTone(freq, "sine", 0.25, 0.16, i * 0.1);
    });
    playTone(1047, "sine", 0.5, 0.2, 0.45);
  } catch {
    // silently fail
  }
}
