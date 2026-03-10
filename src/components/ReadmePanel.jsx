import React, { useState } from 'react';

export default function ReadmePanel() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section id="readme" className={`section ${collapsed ? 'collapsed' : ''}`}>
      <div className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="section-number">README</div>
        <div className="section-title-group">
          <div className="section-title">Implementation Guide — How to Use This Document</div>
          <div className="section-desc">The process for going through this document, adding notes, and correcting the record</div>
        </div>
        <div className="section-toggle">▾</div>
      </div>
      <div className="section-body">
        <div className="callout">
          <strong>Purpose:</strong> This document is a living operational system. It is not meant to be read once and forgotten. The workflow below defines how to move through it systematically, document observations, and correct errors so that it compounds in value over time.
        </div>

        <div className="phase-timeline" style={{ marginTop: 28 }}>
          <div className="phase-step active">
            <div className="phase-dot">1</div>
            <div className="phase-content">
              <div className="phase-label">Step 1 — Read</div>
              <div className="phase-title">Go Through the Entire Document</div>
              <div className="phase-body">Begin at Section 00 and read every section and subsection in order. Do not skip the standalone sections (Automation Phases, Platform & Daily Use). This is not a quick skim — treat it as an onboarding audit. Note every place where the document's description does not match reality on the ground.</div>
            </div>
          </div>
          <div className="phase-step">
            <div className="phase-dot">2</div>
            <div className="phase-content">
              <div className="phase-label">Step 2 — Document</div>
              <div className="phase-title">Outline Notes and Flag Inaccuracies</div>
              <div className="phase-body">As you read, use the <strong style={{ color: 'var(--gold-bright)' }}>Notes</strong> button at the bottom of each section or subsection to record observations. Use the <strong style={{ color: 'var(--ember-bright)' }}>Corrections</strong> button to flag anything that is factually wrong, outdated, or needs to be changed. Corrections require a header (short title) and a body (explanation). Your name and the date are recorded automatically with every entry. Notes are for observations and thoughts. Corrections are for errors that need to be fixed in the source document.</div>
            </div>
          </div>
          <div className="phase-step">
            <div className="phase-dot">3</div>
            <div className="phase-content">
              <div className="phase-label">Step 3 — Correct</div>
              <div className="phase-title">Act on the Corrections</div>
              <div className="phase-body">After completing the read-through, return to the Corrections list for each section. Work through them in priority order. If a correction requires a structural change (a new subsection, a new section, a rewritten policy), use the <strong style={{ color: 'var(--gold-bright)' }}>Add Subsection</strong> or <strong style={{ color: 'var(--gold-bright)' }}>Add Section</strong> controls. If a correction requires an external action (a vendor call, a system change, a staff meeting), log it in the Global Calendar. The document should be measurably more accurate after every review cycle.</div>
            </div>
          </div>
        </div>

        <div className="timeframe-grid">
          <div className="timeframe-card">
            <div className="timeframe-label">Weekly</div>
            <div className="timeframe-desc">Lead Manager notes on operational gaps. Sent to owner Monday AM.</div>
          </div>
          <div className="timeframe-card">
            <div className="timeframe-label">Monthly</div>
            <div className="timeframe-desc">Owner reviews accumulated notes and corrections, identifies patterns.</div>
          </div>
          <div className="timeframe-card">
            <div className="timeframe-label">Quarterly</div>
            <div className="timeframe-desc">Full department review with both managers + owner. Close out corrections.</div>
          </div>
          <div className="timeframe-card">
            <div className="timeframe-label">Semi-Annual</div>
            <div className="timeframe-desc">Strategic review of all sections. Update version number.</div>
          </div>
          <div className="timeframe-card">
            <div className="timeframe-label">Annual</div>
            <div className="timeframe-desc">Full document rebuild if needed. New version number. January.</div>
          </div>
        </div>

        <div className="desc-block" style={{ marginTop: 20, fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-dim)', paddingTop: 20 }}>
          Document Version: 1.0 · Initiated: 2026 · Next Full Review: January 2027<br />
          Implementation Guide: Read → Note → Correct → Act → Repeat
        </div>
      </div>
    </section>
  );
}
