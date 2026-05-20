'use client'
import { useSequences } from './hooks/useSequences'
import { SequenceSidebar } from './components/SequenceSidebar'
import { SequenceEditor } from './components/SequenceEditor'

export default function Home() {
  const {
    sequences,
    active,
    activeId,
    setActiveId,
    createSequence,
    duplicateSequence,
    deleteSequence,
    renameSequence,
    updateSequenceSettings,
    addTimer,
    duplicateTimer,
    updateTimer,
    deleteTimer,
    moveTimer,
  } = useSequences()

  return (
    <div className="h-screen flex bg-slate-950 text-white overflow-hidden">
      <SequenceSidebar
        sequences={sequences}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={createSequence}
        onDuplicate={duplicateSequence}
        onDelete={deleteSequence}
        onRename={renameSequence}
      />
      <SequenceEditor
        sequence={active}
        onAddTimer={() => active && addTimer(active.id)}
        onUpdateTimer={(timerId, patch) => active && updateTimer(active.id, timerId, patch)}
        onDuplicateTimer={(timerId) => active && duplicateTimer(active.id, timerId)}
        onDeleteTimer={(timerId) => active && deleteTimer(active.id, timerId)}
        onMoveTimer={(from, to) => active && moveTimer(active.id, from, to)}
        onUpdateSettings={(patch) => active && updateSequenceSettings(active.id, patch)}
      />
    </div>
  )
}
