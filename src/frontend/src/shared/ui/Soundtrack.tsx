import { useEffect, useRef } from 'react'
import { useSoundStore } from '../lib/sound'

const SOUNDTRACK_SRC = '/soundtrack.mp3'
const BASE_VOLUME = 0.18
const SILENCE_THRESHOLD = 0.002

function findSilenceBounds(buffer: AudioBuffer): {
  start: number
  end: number
} {
  const channels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const length = buffer.length
  let firstNonSilent = length
  let lastNonSilent = 0
  for (let c = 0; c < channels; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < length; i++) {
      if (Math.abs(data[i]) > SILENCE_THRESHOLD) {
        if (i < firstNonSilent) firstNonSilent = i
        break
      }
    }
    for (let i = length - 1; i >= 0; i--) {
      if (Math.abs(data[i]) > SILENCE_THRESHOLD) {
        if (i > lastNonSilent) lastNonSilent = i
        break
      }
    }
  }
  if (firstNonSilent >= length) return { start: 0, end: buffer.duration }
  return {
    start: firstNonSilent / sampleRate,
    end: (lastNonSilent + 1) / sampleRate,
  }
}

export function Soundtrack() {
  const muted = useSoundStore((s) => s.muted)
  const volume = useSoundStore((s) => s.volume)

  const ctxRef = useRef<AudioContext | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const loopBoundsRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  })
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const startedRef = useRef(false)
  const mutedRef = useRef(muted)
  const volumeRef = useRef(volume)

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])
  useEffect(() => {
    volumeRef.current = volume
  }, [volume])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) return
      const ctx = new Ctor()
      ctxRef.current = ctx
      const gain = ctx.createGain()
      gain.gain.value = mutedRef.current ? 0 : BASE_VOLUME * volumeRef.current
      gain.connect(ctx.destination)
      gainRef.current = gain

      try {
        const res = await fetch(SOUNDTRACK_SRC)
        if (!res.ok) return
        const arr = await res.arrayBuffer()
        if (cancelled) return
        const buffer = await ctx.decodeAudioData(arr)
        if (cancelled) return
        bufferRef.current = buffer
        loopBoundsRef.current = findSilenceBounds(buffer)
        tryStart()
      } catch {
        // fetch / decode failed, soundtrack stays silent
      }
    }

    const tryStart = () => {
      if (startedRef.current) return
      if (mutedRef.current) return
      const ctx = ctxRef.current
      const buffer = bufferRef.current
      const gain = gainRef.current
      if (!ctx || !buffer || !gain) return
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      const { start, end } = loopBoundsRef.current
      if (end > start) {
        source.loopStart = start
        source.loopEnd = end
      }
      source.connect(gain)
      source.start(0, start)
      sourceRef.current = source
      startedRef.current = true
    }

    const onInteract = () => {
      const ctx = ctxRef.current
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      tryStart()
    }

    void init()
    window.addEventListener('pointerdown', onInteract)
    window.addEventListener('keydown', onInteract)

    return () => {
      cancelled = true
      window.removeEventListener('pointerdown', onInteract)
      window.removeEventListener('keydown', onInteract)
      sourceRef.current?.stop()
      sourceRef.current?.disconnect()
      gainRef.current?.disconnect()
      ctxRef.current?.close().catch(() => {})
      ctxRef.current = null
      gainRef.current = null
      sourceRef.current = null
      bufferRef.current = null
      startedRef.current = false
    }
  }, [])

  useEffect(() => {
    const ctx = ctxRef.current
    const gain = gainRef.current
    if (!ctx || !gain) return
    const target = muted ? 0 : BASE_VOLUME * volume
    gain.gain.setTargetAtTime(target, ctx.currentTime, 0.05)

    if (!muted && !startedRef.current && bufferRef.current) {
      const source = ctx.createBufferSource()
      source.buffer = bufferRef.current
      source.loop = true
      const { start, end } = loopBoundsRef.current
      if (end > start) {
        source.loopStart = start
        source.loopEnd = end
      }
      source.connect(gain)
      source.start(0, start)
      sourceRef.current = source
      startedRef.current = true
    }
  }, [muted, volume])

  return null
}
