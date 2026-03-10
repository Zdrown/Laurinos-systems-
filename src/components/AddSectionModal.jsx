import React, { useState } from 'react';

export default function AddSectionModal({ onClose, onSubmit }) {
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!number.trim() || !title.trim()) return;
    onSubmit({
      section_id: `custom-s${number.trim()}`,
      number: number.trim(),
      title: title.trim(),
      description: description.trim() || null,
      content: content.trim() || null
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-title">Add Section</div>
        <div className="modal-subtitle">New top-level section</div>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-label">Section Number</label>
            <input className="modal-input" value={number} onChange={e => setNumber(e.target.value)} required placeholder='e.g. "15"' />
          </div>
          <div className="modal-field">
            <label className="modal-label">Section Title</label>
            <input className="modal-input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="modal-field">
            <label className="modal-label">Section Description / Subtitle</label>
            <input className="modal-input" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="modal-field">
            <label className="modal-label">Section Content</label>
            <textarea className="modal-textarea" value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <button type="submit" className="modal-submit">Create Section</button>
        </form>
      </div>
    </div>
  );
}
