import { create } from 'zustand'

export type SoundEvent =
  | 'move'
  | 'capture'
  | 'check'
  | 'castle'
  | 'gameStart'
  | 'gameEnd'
  | 'lootboxOpen'
  | 'lootboxReveal'
  | 'click'
  | 'notify'

interface SoundState {
  muted: boolean
  volume: number
  toggleMute: () => void
  setMuted: (muted: boolean) => void
  setVolume: (volume: number) => void
}

const STORAGE_KEY = 'check-and-mate:sound'

interface StoredPrefs {
  muted: boolean
  volume: number
}

function loadPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { muted: false, volume: 0.5 }
    const parsed = JSON.parse(raw) as Partial<StoredPrefs>
    return {
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : false,
      volume:
        typeof parsed.volume === 'number'
          ? Math.max(0, Math.min(1, parsed.volume))
          : 0.5,
    }
  } catch {
    return { muted: false, volume: 0.5 }
  }
}

function savePrefs(prefs: StoredPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // ignore
  }
}

const initial = loadPrefs()

export const useSoundStore = create<SoundState>((set, get) => ({
  muted: initial.muted,
  volume: initial.volume,
  toggleMute: () => {
    const next = !get().muted
    set({ muted: next })
    savePrefs({ muted: next, volume: get().volume })
  },
  setMuted: (muted) => {
    set({ muted })
    savePrefs({ muted, volume: get().volume })
  },
  setVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume))
    set({ volume: clamped })
    savePrefs({ muted: get().muted, volume: clamped })
  },
}))

let audioContext: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    audioContext = new Ctor()
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }
  return audioContext
}

interface ToneOptions {
  freq: number
  duration: number
  type?: OscillatorType
  attack?: number
  release?: number
  peak?: number
  detune?: number
  startOffset?: number
}

function tone(ctx: AudioContext, master: number, opts: ToneOptions): void {
  const {
    freq,
    duration,
    type = 'sine',
    attack = 0.005,
    release = 0.08,
    peak = 0.35,
    detune = 0,
    startOffset = 0,
  } = opts
  const start = ctx.currentTime + startOffset
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (detune) osc.detune.setValueAtTime(detune, start)
  const amp = peak * master
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(amp, start + attack)
  gain.gain.linearRampToValueAtTime(0, start + duration + release)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + release + 0.02)
}

function noiseBurst(
  ctx: AudioContext,
  master: number,
  duration: number,
  peak: number,
  startOffset = 0,
): void {
  const start = ctx.currentTime + startOffset
  const sampleRate = ctx.sampleRate
  const length = Math.max(1, Math.floor(sampleRate * duration))
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    const t = i / length
    data[i] = (Math.random() * 2 - 1) * (1 - t)
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(peak * master, start)
  src.connect(gain).connect(ctx.destination)
  src.start(start)
}

export function playSound(event: SoundEvent): void {
  const { muted, volume } = useSoundStore.getState()
  if (muted || volume <= 0) return
  const ctx = getCtx()
  if (!ctx) return
  const master = volume
  switch (event) {
    case 'move':
      tone(ctx, master, {
        freq: 480,
        duration: 0.04,
        type: 'triangle',
        peak: 0.28,
      })
      break
    case 'capture':
      noiseBurst(ctx, master, 0.09, 0.18)
      tone(ctx, master, {
        freq: 180,
        duration: 0.08,
        type: 'sawtooth',
        peak: 0.22,
      })
      break
    case 'check':
      tone(ctx, master, { freq: 880, duration: 0.12, type: 'square', peak: 0.2 })
      tone(ctx, master, {
        freq: 1320,
        duration: 0.12,
        type: 'square',
        peak: 0.16,
        startOffset: 0.06,
      })
      break
    case 'castle':
      tone(ctx, master, { freq: 360, duration: 0.06, type: 'triangle' })
      tone(ctx, master, {
        freq: 540,
        duration: 0.06,
        type: 'triangle',
        startOffset: 0.05,
      })
      break
    case 'gameStart':
      tone(ctx, master, { freq: 523, duration: 0.12, type: 'sine' })
      tone(ctx, master, {
        freq: 659,
        duration: 0.12,
        type: 'sine',
        startOffset: 0.1,
      })
      tone(ctx, master, {
        freq: 784,
        duration: 0.18,
        type: 'sine',
        startOffset: 0.2,
      })
      break
    case 'gameEnd':
      tone(ctx, master, { freq: 392, duration: 0.18, type: 'sine' })
      tone(ctx, master, {
        freq: 330,
        duration: 0.22,
        type: 'sine',
        startOffset: 0.16,
      })
      tone(ctx, master, {
        freq: 262,
        duration: 0.3,
        type: 'sine',
        startOffset: 0.34,
      })
      break
    case 'lootboxOpen':
      noiseBurst(ctx, master, 0.4, 0.25)
      tone(ctx, master, {
        freq: 140,
        duration: 0.35,
        type: 'sawtooth',
        peak: 0.18,
      })
      break
    case 'lootboxReveal':
      tone(ctx, master, { freq: 880, duration: 0.1, type: 'triangle', peak: 0.3 })
      tone(ctx, master, {
        freq: 1175,
        duration: 0.16,
        type: 'triangle',
        peak: 0.28,
        startOffset: 0.08,
      })
      tone(ctx, master, {
        freq: 1568,
        duration: 0.24,
        type: 'sine',
        peak: 0.24,
        startOffset: 0.18,
      })
      break
    case 'click':
      tone(ctx, master, {
        freq: 720,
        duration: 0.02,
        type: 'square',
        peak: 0.12,
      })
      break
    case 'notify':
      tone(ctx, master, { freq: 660, duration: 0.08, type: 'sine', peak: 0.22 })
      tone(ctx, master, {
        freq: 990,
        duration: 0.1,
        type: 'sine',
        peak: 0.2,
        startOffset: 0.07,
      })
      break
  }
}

export function useSoundEffect(): (event: SoundEvent) => void {
  return playSound
}
