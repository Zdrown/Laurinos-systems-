import React, { useState } from 'react';

export default function ExportModal({ onClose, onExport }) {
  const [format, setFormat] = useState('html');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-title">Export Document</div>
        <div className="modal-subtitle">Choose export format for agent ingestion</div>

        <div
          className={`export-option ${format === 'html' ? 'selected' : ''}`}
          onClick={() => setFormat('html')}
        >
          <div className="export-option-title">
            Structured HTML <span className="recommended">(Recommended)</span>
          </div>
          <div className="export-option-desc">
            Best for AI agent ingestion. Full document hierarchy, metadata, and inline notes preserved as semantic HTML. Readable as plain text.
          </div>
        </div>

        <div
          className={`export-option ${format === 'pdf' ? 'selected' : ''}`}
          onClick={() => setFormat('pdf')}
        >
          <div className="export-option-title">PDF</div>
          <div className="export-option-desc">
            Visual snapshot. Best for human readers. Less reliable for automated parsing.
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="modal-submit" onClick={() => onExport(format)}>
            Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
