import React from 'react';
import { formatDate } from '../utils';

export default function CorrectionCard({ correction }) {
  return (
    <div className="correction-card">
      <div className="correction-header-text">{correction.header}</div>
      <div className="correction-meta">
        <span className="correction-author">{correction.author_name}</span>
        <span className="correction-date">· {formatDate(correction.created_at)}</span>
      </div>
      <div className="correction-content">{correction.content}</div>
    </div>
  );
}
