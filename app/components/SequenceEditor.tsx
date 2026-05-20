'use client'
import { Sequence, TimerBlock } from '../types'
import { TimerCard } from './TimerCard'
import { Player } from './Player'

interface Props {
  sequence: Sequence | null
  onAddTimer: () => void
  onUpdateTimer: (timerId: string, patch: Partial<TimerBlock>) => void
  onDuplicateTimer: (timerId: string) => void
  onDeleteTimer: (timerId: string) => void
  onMoveTimer: (fromIdx: number, toIdx: number) => void
  onUpdateSettings: (patch: Partial<Pick<Sequence, 'gapDuration' | 'tickLeadTime' | 'gapTickLeadTime'>>) => void
}

function formatTotal(timers: TimerBlock[], gapDuration: number): string {
  const timerTotal = timers.reduce((sum, t) => sum + t.duration, 0)
  const gapTotal = gapDuration * Math.max(0, timers.length - 1)
  const total = timerTotal + gapTotal
  if (total === 0) return ''
  const m = Math.floor(total / 60)
  const s = total % 60
  return `Total : ${m > 0 ? `${m}min ` : ''}${s > 0 ? `${s}s` : ''}`
}

function SmallNumberInput({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-400">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || 0)))}
        className="w-12 text-center bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded px-1 py-0.5 outline-none focus:border-cyan-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="text-slate-500">s</span>
    </label>
  )
}

export function SequenceEditor({ sequence, onAddTimer, onUpdateTimer, onDuplicateTimer, onDeleteTimer, onMoveTimer, onUpdateSettings }: Props) {
  if (!sequence) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-600">
        <div className="text-center">
          <div className="text-4xl mb-3">⏱</div>
          <p>Sélectionnez ou créez une séquence</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: timer list */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-700 min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold truncate">{sequence.name}</h2>
            <p className="text-xs text-slate-500">{formatTotal(sequence.timers, sequence.gapDuration)}</p>
          </div>
          <button
            onClick={onAddTimer}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm transition-colors shrink-0"
          >
            + Ajouter timer
          </button>
        </div>

        {/* Settings bar */}
        <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/50 flex flex-wrap gap-x-6 gap-y-2">
          <SmallNumberInput
            label="Intervalle"
            value={sequence.gapDuration}
            min={0}
            max={300}
            onChange={v => onUpdateSettings({ gapDuration: v })}
          />
          {sequence.gapDuration > 0 && (
            <SmallNumberInput
              label="Ticks intervalle"
              value={sequence.gapTickLeadTime}
              min={0}
              max={30}
              onChange={v => onUpdateSettings({ gapTickLeadTime: v })}
            />
          )}
          <SmallNumberInput
            label="Ticks timer"
            value={sequence.tickLeadTime}
            min={0}
            max={30}
            onChange={v => onUpdateSettings({ tickLeadTime: v })}
          />
        </div>

        {/* Timer list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sequence.timers.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <p className="text-2xl mb-2">⏱</p>
              <p className="text-sm">Aucun timer. Ajoutez-en un !</p>
            </div>
          )}
          {sequence.timers.map((timer, i) => (
            <div key={timer.id}>
              <TimerCard
                timer={timer}
                index={i}
                total={sequence.timers.length}
                onUpdate={patch => onUpdateTimer(timer.id, patch)}
                onDelete={() => onDeleteTimer(timer.id)}
                onDuplicate={() => onDuplicateTimer(timer.id)}
                onMoveUp={() => onMoveTimer(i, i - 1)}
                onMoveDown={() => onMoveTimer(i, i + 1)}
              />
              {sequence.gapDuration > 0 && i < sequence.timers.length - 1 && (
                <div className="flex items-center gap-2 px-3 py-1">
                  <div className="flex-1 border-t border-dashed border-slate-700/60" />
                  <span className="text-xs text-slate-600">
                    {sequence.gapDuration}s
                  </span>
                  <div className="flex-1 border-t border-dashed border-slate-700/60" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: player */}
      <div className="w-80 shrink-0 flex flex-col bg-slate-900/50">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-xs text-slate-400 font-medium uppercase tracking-wider">Lecture</h3>
        </div>
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <Player
            timers={sequence.timers}
            gapDuration={sequence.gapDuration}
            tickLeadTime={sequence.tickLeadTime}
            gapTickLeadTime={sequence.gapTickLeadTime}
          />
        </div>
      </div>
    </div>
  )
}
