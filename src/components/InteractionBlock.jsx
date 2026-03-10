import React from 'react';
import NoteCard from './NoteCard';
import CorrectionCard from './CorrectionCard';

export default function InteractionBlock({
  sectionId,
  subsectionId = null,
  notes = [],
  corrections = [],
  onAddNote,
  onAddCorrection,
  onAddSubsection,
  showAddSubsection = false
}) {
  const wrapperClass = subsectionId ? 'subsection-interactions' : 'section-interactions';
  const sectionNotes = notes.filter(n =>
    n.section_id === sectionId &&
    (subsectionId ? n.subsection_id === subsectionId : !n.subsection_id)
  );
  const sectionCorrections = corrections.filter(c =>
    c.section_id === sectionId &&
    (subsectionId ? c.subsection_id === subsectionId : !c.subsection_id)
  );

  return (
    <div className={wrapperClass} data-section-id={sectionId} data-subsection-id={subsectionId || undefined}>
      <div className="interaction-block">
        <div className="interaction-label">◆ Notes</div>
        <div className="notes-list">
          {sectionNotes.length === 0 && <div className="empty-state">No notes yet.</div>}
          {sectionNotes.map(n => <NoteCard key={n.id} note={n} />)}
        </div>
        <button className="add-interaction-btn" onClick={() => onAddNote(sectionId, subsectionId)}>
          + Add Note
        </button>
      </div>

      <div className="interaction-block" style={{ marginTop: 16 }}>
        <div className="interaction-label" style={{ color: 'var(--ember-bright)' }}>⚠ Corrections</div>
        <div className="corrections-list">
          {sectionCorrections.length === 0 && <div className="empty-state">No corrections yet.</div>}
          {sectionCorrections.map(c => <CorrectionCard key={c.id} correction={c} />)}
        </div>
        <button className="add-interaction-btn correction" onClick={() => onAddCorrection(sectionId, subsectionId)}>
          + Add Correction
        </button>
      </div>

      {showAddSubsection && (
        <div className="interaction-block" style={{ marginTop: 16 }}>
          <button className="add-subsection-btn" onClick={() => onAddSubsection(sectionId)}>
            + Add Subsection
          </button>
        </div>
      )}
    </div>
  );
}
