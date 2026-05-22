'use client'
import { Sequence, TimerBlock } from '../types'
import { SequenceSidebar } from './SequenceSidebar'
import { SequenceEditor } from './SequenceEditor'
import { Player } from './Player'

interface Props {
  sequences: Sequence[]
  active: Sequence | null
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
  onAddTimer: () => void
  onUpdateTimer: (timerId: string, patch: Partial<TimerBlock>) => void
  onDuplicateTimer: (timerId: string) => void
  onDeleteTimer: (timerId: string) => void
  onMoveTimer: (from: number, to: number) => void
  onUpdateSettings: (patch: Partial<Pick<Sequence, 'gapDuration' | 'tickLeadTime' | 'gapTickLeadTime'>>) => void
}

export function LandscapeLayout({
  sequences, active, activeId,
  onSelect, onCreate, onDuplicate, onDelete, onRename,
  onAddTimer, onUpdateTimer, onDuplicateTimer, onDeleteTimer, onMoveTimer, onUpdateSettings,
}: Props) {
  return (
    <div className="h-screen flex bg-slate-950 text-white overflow-hidden">
      {/* Col 1: sequence list */}
      <SequenceSidebar
        sequences={sequences}
        activeId={activeId}
        onSelect={onSelect}
        onCreate={onCreate}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onRename={onRename}
      />

      {/* Col 2: builder */}
      <div className="flex-1 flex overflow-hidden min-w-0 border-r border-slate-700">
        <SequenceEditor
          sequence={active}
          onAddTimer={onAddTimer}
          onUpdateTimer={onUpdateTimer}
          onDuplicateTimer={onDuplicateTimer}
          onDeleteTimer={onDeleteTimer}
          onMoveTimer={onMoveTimer}
          onUpdateSettings={onUpdateSettings}
        />
      </div>

      {/* Col 3: player */}
      <div className="w-80 shrink-0 flex flex-col bg-slate-900/40">
        <div className="px-4 py-3 border-b border-slate-700 shrink-0">
          <h3 className="text-xs text-slate-400 font-medium uppercase tracking-wider">Lecture</h3>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {active ? (
            <Player
              timers={active.timers}
              gapDuration={active.gapDuration}
              tickLeadTime={active.tickLeadTime}
              gapTickLeadTime={active.gapTickLeadTime}
              showTimeline={true}
              circleSize={200}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-700 text-sm">
              Aucune séquence
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
