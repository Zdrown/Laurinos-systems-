import React, { useState } from 'react';

export default function NoteModal({ sectionId, subsectionId, onClose, onSubmit }) {
  const [content, setContent] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ section_id: sectionId, subsection_id: subsectionId || null, content: content.trim() });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-title">Add Note</div>
        <div className="modal-subtitle">
          {subsectionId ? `Subsection ${subsectionId}` : `Section ${sectionId}`}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-label">Your Note</label>
            <textarea className="modal-textarea" value={content} onChange={e => setContent(e.target.value)} required />
          </div>
          <button type="submit" className="modal-submit">Save Note</button>
        </form>
      </div>
    </div>
  );
}
