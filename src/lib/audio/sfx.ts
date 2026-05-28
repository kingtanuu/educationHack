"use client";

/**
 * Lightweight Web Audio sound effects.
 * No external audio assets — every sound is synthesized at runtime
 * so the bundle stays tiny and there is nothing to license.
 */

type SfxId =
  | "cardPlay"
  | "cardReturn"
  | "reactionSuccess"
  | "reactionBig"
  | "reactionFail"
  | "noMatch"
  | "playerHit"
  | "enemyHit"
  | "enemyAttackTelegraph"
  | "victory"
  | "defeat";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AudioCtor();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.35;
      masterGain.connect(ctx.destination);
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === "suspended") {
    // Autoplay policy: resume on first user gesture.
    void ctx.resume();
  }
  return ctx;
}

function envelope(
  audio: AudioContext,
  destination: AudioNode,
  attack: number,
  release: number,
  peak = 1,
): GainNode {
  const gain = audio.createGain();
  const now = audio.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);
  gain.connect(destination);
  return gain;
}

function tone(
  freq: number,
  duration: number,
  options: {
    type?: OscillatorType;
    attack?: number;
    peak?: number;
    detune?: number;
    glideTo?: number;
    delay?: number;
  } = {},
): void {
  const audio = getCtx();
  if (!audio || !masterGain || muted) return;
  const {
    type = "sine",
    attack = 0.01,
    peak = 0.5,
    detune = 0,
    glideTo,
    delay = 0,
  } = options;
  const release = Math.max(duration - attack, 0.05);
  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (typeof glideTo === "number") {
    osc.frequency.exponentialRampToValueAtTime(glideTo, start + duration);
  }
  if (detune) osc.detune.value = detune;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + release);
  osc.connect(gain).connect(masterGain);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function noise(duration: number, peak = 0.4, lowpass = 1200): void {
  const audio = getCtx();
  if (!audio || !masterGain || muted) return;
  const bufferSize = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = audio.createBufferSource();
  src.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = lowpass;
  const gain = envelope(audio, masterGain, 0.01, duration, peak);
  src.connect(filter).connect(gain);
  src.start();
}

export const sfx = {
  setMuted(value: boolean): void {
    muted = value;
  },
  isMuted(): boolean {
    return muted;
  },
  play(id: SfxId): void {
    switch (id) {
      case "cardPlay":
        // Quick chime up
        tone(880, 0.08, { type: "triangle", peak: 0.25, glideTo: 1320 });
        break;
      case "cardReturn":
        tone(660, 0.08, { type: "triangle", peak: 0.2, glideTo: 440 });
        break;
      case "reactionSuccess":
        // Three-note alchemy arpeggio
        tone(523, 0.12, { type: "sine", peak: 0.3 });
        tone(659, 0.12, { type: "sine", peak: 0.3, delay: 0.08 });
        tone(784, 0.18, { type: "sine", peak: 0.32, delay: 0.16 });
        tone(1047, 0.25, { type: "triangle", peak: 0.2, delay: 0.24 });
        break;
      case "reactionBig":
        // Powerful chord + sweep
        tone(220, 0.4, { type: "sawtooth", peak: 0.18, glideTo: 110 });
        tone(523, 0.3, { type: "triangle", peak: 0.3 });
        tone(659, 0.3, { type: "triangle", peak: 0.3, delay: 0.05 });
        tone(880, 0.4, { type: "sine", peak: 0.3, delay: 0.1 });
        noise(0.25, 0.18, 2400);
        break;
      case "reactionFail":
      case "noMatch":
        // Descending fizzle
        tone(330, 0.18, { type: "sawtooth", peak: 0.2, glideTo: 110 });
        noise(0.18, 0.12, 800);
        break;
      case "playerHit":
        // Deep punch + low rumble
        noise(0.18, 0.4, 700);
        tone(110, 0.2, { type: "square", peak: 0.25, glideTo: 55 });
        break;
      case "enemyHit":
        // Crisp impact
        tone(440, 0.1, { type: "square", peak: 0.3, glideTo: 220 });
        noise(0.1, 0.25, 2400);
        break;
      case "enemyAttackTelegraph":
        // Warning blip
        tone(660, 0.08, { type: "triangle", peak: 0.3 });
        tone(660, 0.08, { type: "triangle", peak: 0.3, delay: 0.12 });
        break;
      case "victory":
        tone(523, 0.2, { peak: 0.3 });
        tone(659, 0.2, { peak: 0.3, delay: 0.15 });
        tone(784, 0.25, { peak: 0.3, delay: 0.3 });
        tone(1047, 0.45, { peak: 0.3, delay: 0.45 });
        break;
      case "defeat":
        tone(330, 0.4, { type: "sawtooth", peak: 0.25, glideTo: 110 });
        tone(220, 0.5, { type: "sine", peak: 0.2, delay: 0.2, glideTo: 80 });
        break;
    }
  },
};
