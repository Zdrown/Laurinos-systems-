import React, { useState } from 'react';

export default function CorrectionModal({ sectionId, subsectionId, onClose, onSubmit }) {
  const [header, setHeader] = useState('');
  const [content, setContent] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!header.trim() || !content.trim()) return;
    onSubmit({ section_id: sectionId, subsection_id: subsectionId || null, header: header.trim(), content: content.trim() });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-title">Add Correction</div>
        <div className="modal-subtitle" style={{ color: 'var(--ember-bright)' }}>
          {subsectionId ? `Subsection ${subsectionId}` : `Section ${sectionId}`}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-label">Correction Header / Title</label>
            <input className="modal-input" value={header} onChange={e => setHeader(e.target.value)} required maxLength={120} />
          </div>
          <div className="modal-field">
            <label className="modal-label">Correction Details</label>
            <textarea className="modal-textarea" value={content} onChange={e => setContent(e.target.value)} required />
          </div>
          <button type="submit" className="modal-submit ember">Save Correction</button>
        </form>
      </div>
    </div>
  );
}
