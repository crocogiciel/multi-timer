'use client'
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Sequence, TimerBlock } from '../types'
import { StepTile } from './StepTile'

interface Props {
  sequence: Sequence | null
  onAddTimer: () => void
  onUpdateTimer: (timerId: string, patch: Partial<TimerBlock>) => void
  onDuplicateTimer: (timerId: string) => void
  onDeleteTimer: (timerId: string) => void
  onMoveTimer: (fromIdx: number, toIdx: number) => void
  onUpdateSettings: (patch: Partial<Pick<Sequence, 'gapDuration' | 'tickLeadTime' | 'gapTickLeadTime'>>) => void
  activeTimerIndex?: number
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

function GapDivider({ duration }: { duration: number }) {
  return (
    <div className="flex items-center gap-2 px-2 py-0.5">
      <div className="flex-1 border-t border-dashed border-slate-700/50" />
      <span className="text-xs text-slate-600">{duration}s</span>
      <div className="flex-1 border-t border-dashed border-slate-700/50" />
    </div>
  )
}

export function SequenceEditor({
  sequence, onAddTimer, onUpdateTimer, onDuplicateTimer, onDeleteTimer,
  onMoveTimer, onUpdateSettings, activeTimerIndex,
}: Props) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !sequence) return
    const fromIdx = sequence.timers.findIndex(t => t.id === active.id)
    const toIdx = sequence.timers.findIndex(t => t.id === over.id)
    if (fromIdx !== -1 && toIdx !== -1) onMoveTimer(fromIdx, toIdx)
  }

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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center gap-3 flex-wrap shrink-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold truncate">{sequence.name}</h2>
          <p className="text-xs text-slate-500">{formatTotal(sequence.timers, sequence.gapDuration)}</p>
        </div>
        <button
          onClick={onAddTimer}
          className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm transition-colors shrink-0"
        >
          + Ajouter step
        </button>
      </div>

      {/* Settings bar */}
      <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/50 flex flex-wrap gap-x-6 gap-y-2 shrink-0">
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

      {/* Step list */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
        {sequence.timers.length === 0 && (
          <div className="text-center py-12 text-slate-600">
            <p className="text-2xl mb-2">⏱</p>
            <p className="text-sm">Aucun step. Ajoutez-en un !</p>
          </div>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={sequence.timers.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {sequence.timers.map((timer, i) => (
              <div key={timer.id}>
                <StepTile
                  timer={timer}
                  index={i}
                  total={sequence.timers.length}
                  isActive={activeTimerIndex === i}
                  onUpdate={patch => onUpdateTimer(timer.id, patch)}
                  onDelete={() => onDeleteTimer(timer.id)}
                  onDuplicate={() => onDuplicateTimer(timer.id)}
                  onMoveUp={() => onMoveTimer(i, i - 1)}
                  onMoveDown={() => onMoveTimer(i, i + 1)}
                />
                {sequence.gapDuration > 0 && i < sequence.timers.length - 1 && (
                  <GapDivider duration={sequence.gapDuration} />
                )}
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
