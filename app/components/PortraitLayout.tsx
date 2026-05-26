'use client'
import { useState, useRef } from 'react'
import { Sequence, TimerBlock } from '../types'
import { SequenceSidebar } from './SequenceSidebar'
import { SequenceEditor } from './SequenceEditor'
import { Player, PlayerRef } from './Player'
import { ExportImportModal } from './ExportImportModal'

type Mode = 'build' | 'play'

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
  onImport: (seqs: Sequence[]) => void
}

export function PortraitLayout({
  sequences, active, activeId,
  onSelect, onCreate, onDuplicate, onDelete, onRename,
  onAddTimer, onUpdateTimer, onDuplicateTimer, onDeleteTimer, onMoveTimer, onUpdateSettings,
  onImport,
}: Props) {
  const [mode, setMode] = useState<Mode>('build')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const playerRef = useRef<PlayerRef>(null)

  const stepCount = active?.timers.length ?? 0

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden relative">

      {/* ── BUILD MODE ── */}
      <div className={mode === 'build' ? 'flex flex-col flex-1 min-h-0 overflow-hidden' : 'hidden'}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-slate-900 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-300 text-lg transition-colors"
            aria-label="Ouvrir les séquences"
          >
            ☰
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {active?.name ?? 'Multi Timer'}
            </p>
            {active && (
              <p className="text-xs text-slate-500">
                {stepCount} step{stepCount !== 1 ? 's' : ''}
                {active.timers.length > 0 && ` · ${
                  (() => {
                    const total = active.timers.reduce((s, t) => s + t.duration, 0)
                      + active.gapDuration * Math.max(0, active.timers.length - 1)
                    const m = Math.floor(total / 60), s = total % 60
                    return `${m > 0 ? `${m}min ` : ''}${s > 0 ? `${s}s` : ''}`
                  })()
                }`}
              </p>
            )}
          </div>

          {active && stepCount > 0 && (
            <button
              onClick={() => setMode('play')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors shadow-lg shadow-cyan-900/40 shrink-0"
            >
              ▶ Lancer
            </button>
          )}
        </div>

        {/* Builder */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
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
      </div>

      {/* ── PLAY MODE ── */}
      <div className={mode === 'play' ? 'flex flex-col flex-1 min-h-0 overflow-hidden' : 'hidden'}>
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-700 bg-slate-900/80 shrink-0">
          <button
            onClick={() => setMode('build')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm mr-3"
          >
            ← Éditer
          </button>
          <h2 className="flex-1 text-sm font-medium text-slate-300 truncate text-center">
            {active?.name ?? ''}
          </h2>
          <div className="w-16" />
        </div>

        {/* Player — full height */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {active && (
            <Player
              ref={playerRef}
              timers={active.timers}
              gapDuration={active.gapDuration}
              tickLeadTime={active.tickLeadTime}
              gapTickLeadTime={active.gapTickLeadTime}
              showTimeline={true}
              circleSize={260}
            />
          )}
        </div>
      </div>

      {/* Export/Import modal */}
      {modalOpen && (
        <ExportImportModal
          sequences={sequences}
          onImport={onImport}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      {sidebarOpen && (
        <>
          <div
            className="absolute inset-0 bg-black/50 z-10"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 z-20 shadow-2xl">
            <SequenceSidebar
              sequences={sequences}
              activeId={activeId}
              onSelect={id => { onSelect(id); setSidebarOpen(false) }}
              onCreate={() => { onCreate(); setSidebarOpen(false) }}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onRename={onRename}
              onOpenExportImport={() => { setSidebarOpen(false); setModalOpen(true) }}
            />
          </div>
        </>
      )}
    </div>
  )
}
