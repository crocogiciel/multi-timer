'use client'
import { useEffect, useRef } from 'react'
import { TimerBlock } from '../types'
import { PlayerState, PlayerPhase } from '../hooks/usePlayer'

function fmt(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

interface Props {
  timers: TimerBlock[]
  currentIndex: number
  phase: PlayerPhase
  state: PlayerState
  gapDuration: number
}

export function PlayerTimeline({ timers, currentIndex, phase, state, gapDuration }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [currentIndex, phase])

  if (timers.length <= 1) return null

  const isPlaying = state === 'running' || state === 'paused'
  const isDone = state === 'done'

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-2 overflow-x-auto px-4 py-3"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {timers.map((timer, i) => {
        const done = (isPlaying && i < currentIndex) || isDone
        const current = isPlaying && i === currentIndex && phase === 'timer'
        const gapAfterThis = isPlaying && i === currentIndex && phase === 'gap'

        return (
          <div key={timer.id} className="flex items-center gap-2 shrink-0">
            {/* Step card */}
            <div
              ref={current ? activeRef : undefined}
              className={`shrink-0 rounded-lg border px-3 py-2 transition-all duration-200 ${
                current
                  ? 'border-cyan-500 bg-cyan-900/30 shadow shadow-cyan-900/40'
                  : done
                  ? 'border-slate-700/30 bg-transparent opacity-35'
                  : 'border-slate-700 bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono w-3.5 text-center shrink-0 ${
                  current ? 'text-cyan-400' : done ? 'text-slate-600' : 'text-slate-500'
                }`}>
                  {done ? '✓' : i + 1}
                </span>
                <div className="min-w-0">
                  <p className={`text-xs font-medium truncate max-w-[80px] ${
                    current ? 'text-white' : done ? 'text-slate-500' : 'text-slate-300'
                  }`}>
                    {timer.name}
                  </p>
                  <p className={`text-[10px] font-mono ${current ? 'text-cyan-400/70' : 'text-slate-600'}`}>
                    {fmt(timer.duration)}
                  </p>
                </div>
              </div>
            </div>

            {/* Gap connector */}
            {gapDuration > 0 && i < timers.length - 1 && (
              <div
                ref={gapAfterThis ? activeRef : undefined}
                className={`shrink-0 flex flex-col items-center gap-0.5 transition-opacity ${
                  gapAfterThis ? 'opacity-100' : 'opacity-25'
                }`}
              >
                <div className={`flex items-center gap-0.5 ${gapAfterThis ? 'text-slate-300' : 'text-slate-600'}`}>
                  <div className="w-2.5 h-px bg-current" />
                  <span className="text-[9px] whitespace-nowrap">{gapDuration}s</span>
                  <div className="w-2.5 h-px bg-current" />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
