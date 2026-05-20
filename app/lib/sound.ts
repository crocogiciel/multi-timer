let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    audioCtx = new Ctor()
  }
  return audioCtx
}

// Must be called from a user-gesture handler (play/resume button).
// iOS Safari keeps AudioContext suspended until a gesture activates it.
export async function initAudio(): Promise<void> {
  const ctx = getCtx()
  if (ctx && ctx.state !== 'running') {
    await ctx.resume()
  }
}

export function playBeep(type: 'end' | 'tick' | 'done' | 'start' = 'end') {
  const ctx = getCtx()
  if (!ctx || ctx.state !== 'running') return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  if (type === 'start') {
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.35, ctx.currentTime)
    gain.gain.setValueAtTime(0.35, ctx.currentTime + 0.12)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.35)
  } else if (type === 'end') {
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  } else if (type === 'tick') {
    osc.frequency.setValueAtTime(660, ctx.currentTime)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  } else if (type === 'done') {
    for (let i = 0; i < 3; i++) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g)
      g.connect(ctx.destination)
      o.frequency.setValueAtTime(880, ctx.currentTime + i * 0.25)
      g.gain.setValueAtTime(0.4, ctx.currentTime + i * 0.25)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.2)
      o.start(ctx.currentTime + i * 0.25)
      o.stop(ctx.currentTime + i * 0.25 + 0.2)
    }
  }
}
