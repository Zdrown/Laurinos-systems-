import React from 'react';
import { formatDate } from '../utils';

export default function NoteCard({ note }) {
  return (
    <div className="note-card">
      <div className="note-meta">
        <span className="note-author">{note.author_name}</span>
        <span className="note-date">· {formatDate(note.created_at)}</span>
      </div>
      <div className="note-content">{note.content}</div>
    </div>
  );
}
