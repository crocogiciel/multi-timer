'use client'
import { forwardRef, useImperativeHandle } from 'react'
import { usePlayer } from '../hooks/usePlayer'
import { PlayerTimeline } from './PlayerTimeline'
import { TimerBlock } from '../types'

export interface PlayerRef {
  play: () => void
}

interface Props {
  timers: TimerBlock[]
  gapDuration: number
  tickLeadTime: number
  gapTickLeadTime: number
  showTimeline?: boolean
  circleSize?: number
  onPlayStart?: () => void
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

function CircleProgress({ progress, color = 'cyan', size = 220 }: {
  progress: number; color?: 'cyan' | 'slate'; size?: number
}) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(1, progress))
  const stroke = color === 'cyan' ? '#22d3ee' : '#64748b'
  const track = color === 'cyan' ? '#1e3a4a' : '#1e293b'

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={10} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={stroke}
        strokeWidth={10}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s linear' }}
      />
    </svg>
  )
}

export const Player = forwardRef<PlayerRef, Props>(function Player(
  { timers, gapDuration, tickLeadTime, gapTickLeadTime, showTimeline = false, circleSize = 220, onPlayStart },
  ref
) {
  const {
    state, phase, currentIndex,
    remaining, progress, gapRemaining, gapProgress, current,
    play, pause, resume, stop, skipNext,
  } = usePlayer(timers, gapDuration, tickLeadTime, gapTickLeadTime)

  useImperativeHandle(ref, () => ({
    play: () => { play(); onPlayStart?.() },
  }))

  const isIdle = state === 'idle'
  const isRunning = state === 'running'
  const isPaused = state === 'paused'
  const isDone = state === 'done'
  const inGap = (isRunning || isPaused) && phase === 'gap'
  const inTimer = (isRunning || isPaused) && phase === 'timer'

  const displayTime = isIdle
    ? (timers[0]?.duration ?? 0)
    : inGap ? gapRemaining : remaining

  const displayLabel = isIdle
    ? (timers[0]?.name ?? '—')
    : inGap ? 'Intervalle' : (current?.name ?? '—')

  const circleColor: 'cyan' | 'slate' = inGap ? 'slate' : 'cyan'
  const circleProgress = isIdle || isDone ? 0 : inGap ? gapProgress : progress

  const timeFontSize = Math.floor(circleSize * 0.21)
  const labelMaxWidth = Math.floor(circleSize * 0.6)

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-5 py-6 w-full min-h-0">
        {/* Circle */}
        <div className="relative flex items-center justify-center shrink-0">
          <CircleProgress progress={circleProgress} color={circleColor} size={circleSize} />
          <div className="absolute flex flex-col items-center gap-1 text-center px-2">
            {isDone ? (
              <span className="text-3xl text-cyan-400 font-bold">✓</span>
            ) : (
              <>
                <span
                  className={`font-mono font-bold tabular-nums ${inGap ? 'text-slate-400' : 'text-white'}`}
                  style={{ fontSize: timeFontSize }}
                >
                  {formatTime(displayTime)}
                </span>
                <span
                  className={`text-sm text-center truncate ${inGap ? 'text-slate-500 italic' : 'text-slate-400'}`}
                  style={{ maxWidth: labelMaxWidth }}
                >
                  {displayLabel}
                </span>
              </>
            )}
          </div>
        </div>

        {isDone && (
          <p className="text-cyan-400 text-sm font-medium">Séquence terminée !</p>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {(isRunning || isPaused) && (
            <button
              onClick={stop}
              className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors"
              title="Arrêter"
            >■</button>
          )}

          {isIdle || isDone ? (
            <button
              onClick={() => { play(); onPlayStart?.() }}
              disabled={timers.length === 0}
              className="w-16 h-16 rounded-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white flex items-center justify-center text-2xl transition-colors shadow-lg shadow-cyan-900/40"
            >▶</button>
          ) : isRunning ? (
            <button
              onClick={pause}
              className="w-16 h-16 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center text-2xl transition-colors shadow-lg shadow-cyan-900/40"
            >⏸</button>
          ) : (
            <button
              onClick={resume}
              className="w-16 h-16 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center text-2xl transition-colors shadow-lg shadow-cyan-900/40"
            >▶</button>
          )}

          {(isRunning || isPaused) && currentIndex < timers.length - 1 && (
            <button
              onClick={skipNext}
              className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors"
              title="Passer au suivant"
            >⏭</button>
          )}
        </div>

        {/* Next up (when no timeline) */}
        {!showTimeline && inTimer && currentIndex < timers.length - 1 && (
          <div className="text-xs text-slate-500 text-center px-4">
            {gapDuration > 0 && <span>Intervalle {formatTime(gapDuration)} → </span>}
            <span className="text-slate-400">{timers[currentIndex + 1].name}</span>
            {' '}({formatTime(timers[currentIndex + 1].duration)})
          </div>
        )}
      </div>

      {/* Timeline strip */}
      {showTimeline && timers.length > 1 && (
        <div className="w-full border-t border-slate-700/40">
          <PlayerTimeline
            timers={timers}
            currentIndex={currentIndex}
            phase={phase}
            state={state}
            gapDuration={gapDuration}
          />
        </div>
      )}
    </div>
  )
})
