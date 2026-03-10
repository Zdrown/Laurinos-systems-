import React, { useState } from 'react';

export default function AddSubsectionModal({ sectionId, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit({ section_id: sectionId, title: title.trim(), content: content.trim() });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-title">Add Subsection</div>
        <div className="modal-subtitle">Attached to section {sectionId}</div>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-label">Subsection Title</label>
            <input className="modal-input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="modal-field">
            <label className="modal-label">Subsection Content / Description</label>
            <textarea className="modal-textarea" value={content} onChange={e => setContent(e.target.value)} required />
          </div>
          <button type="submit" className="modal-submit">Add Subsection</button>
        </form>
      </div>
    </div>
  );
}
