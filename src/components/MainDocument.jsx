import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import Sidebar from './Sidebar';
import InteractionBlock from './InteractionBlock';
import NoteModal from './NoteModal';
import CorrectionModal from './CorrectionModal';
import AddSubsectionModal from './AddSubsectionModal';
import AddSectionModal from './AddSectionModal';
import ExportModal from './ExportModal';
import ReadmePanel from './ReadmePanel';
import { formatDate } from '../utils';

/* ─── COLLAPSIBLE SECTION WRAPPER ─── */
function Section({ id, number, title, desc, children, notes, corrections, customSubsections, onAddNote, onAddCorrection, onAddSubsection }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section id={id} className={`section ${collapsed ? 'collapsed' : ''}`}>
      <div className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="section-number">{number}</div>
        <div className="section-title-group">
          <div className="section-title">{title}</div>
          {desc && <div className="section-desc">{desc}</div>}
        </div>
        <div className="section-toggle">▾</div>
      </div>
      <div className="section-body">
        {children}
        {/* Custom subsections from DB */}
        {customSubsections && customSubsections.filter(cs => cs.section_id === id).map(cs => (
          <Subsection key={cs.id} id={`custom-sub-${cs.id}`} num={`✦`} title={cs.title}
            notes={notes} corrections={corrections} onAddNote={onAddNote} onAddCorrection={onAddCorrection}>
            <div className="desc-block">{cs.content}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Added by {cs.author_name}
            </div>
          </Subsection>
        ))}
        <InteractionBlock sectionId={id} notes={notes} corrections={corrections}
          onAddNote={onAddNote} onAddCorrection={onAddCorrection}
          onAddSubsection={onAddSubsection} showAddSubsection={true} />
      </div>
    </section>
  );
}

function Subsection({ id, num, title, children, notes, corrections, onAddNote, onAddCorrection }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`subsection ${collapsed ? 'collapsed' : ''}`} id={id}>
      <div className="subsection-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="subsection-num">{num}</div>
        <div className="subsection-title">{title}</div>
        <div className="subsection-toggle">▾</div>
      </div>
      <div className="subsection-body">
        {children}
        <InteractionBlock sectionId={id.split('-')[0] || id} subsectionId={id}
          notes={notes} corrections={corrections}
          onAddNote={onAddNote} onAddCorrection={onAddCorrection} />
      </div>
    </div>
  );
}

export default function MainDocument({ profile, onSignOut }) {
  const [notes, setNotes] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [customSubsections, setCustomSubsections] = useState([]);
  const [customSections, setCustomSections] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal state
  const [noteModal, setNoteModal] = useState(null); // { sectionId, subsectionId }
  const [correctionModal, setCorrectionModal] = useState(null);
  const [subsectionModal, setSubsectionModal] = useState(null); // sectionId
  const [sectionModal, setSectionModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);

  // Scroll progress
  useEffect(() => {
    function onScroll() {
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      const bar = document.getElementById('scroll-bar');
      if (bar) bar.style.width = scrolled + '%';
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch all data
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [n, c, cs, s] = await Promise.all([
      supabase.from('notes').select('*').order('created_at'),
      supabase.from('corrections').select('*').order('created_at'),
      supabase.from('custom_subsections').select('*').order('sort_order'),
      supabase.from('custom_sections').select('*').order('sort_order'),
    ]);
    if (n.data) setNotes(n.data);
    if (c.data) setCorrections(c.data);
    if (cs.data) setCustomSubsections(cs.data);
    if (s.data) setCustomSections(s.data);
  }

  // Handlers
  function openNoteModal(sectionId, subsectionId) { setNoteModal({ sectionId, subsectionId }); }
  function openCorrectionModal(sectionId, subsectionId) { setCorrectionModal({ sectionId, subsectionId }); }
  function openSubsectionModal(sectionId) { setSubsectionModal(sectionId); }

  async function handleAddNote(data) {
    const optimistic = {
      id: crypto.randomUUID(),
      ...data,
      author_id: profile.id,
      author_name: profile.full_name,
      created_at: new Date().toISOString()
    };
    setNotes(prev => [...prev, optimistic]);
    setNoteModal(null);
    const { error } = await supabase.from('notes').insert({
      section_id: data.section_id,
      subsection_id: data.subsection_id,
      author_id: profile.id,
      author_name: profile.full_name,
      content: data.content
    });
    if (error) {
      setNotes(prev => prev.filter(n => n.id !== optimistic.id));
      alert('Failed to save note: ' + error.message);
    }
  }

  async function handleAddCorrection(data) {
    const optimistic = {
      id: crypto.randomUUID(),
      ...data,
      author_id: profile.id,
      author_name: profile.full_name,
      created_at: new Date().toISOString()
    };
    setCorrections(prev => [...prev, optimistic]);
    setCorrectionModal(null);
    const { error } = await supabase.from('corrections').insert({
      section_id: data.section_id,
      subsection_id: data.subsection_id,
      author_id: profile.id,
      author_name: profile.full_name,
      header: data.header,
      content: data.content
    });
    if (error) {
      setCorrections(prev => prev.filter(c => c.id !== optimistic.id));
      alert('Failed to save correction: ' + error.message);
    }
  }

  async function handleAddSubsection(data) {
    const optimistic = {
      id: crypto.randomUUID(),
      ...data,
      author_id: profile.id,
      author_name: profile.full_name,
      created_at: new Date().toISOString(),
      sort_order: 999
    };
    setCustomSubsections(prev => [...prev, optimistic]);
    setSubsectionModal(null);
    const { error } = await supabase.from('custom_subsections').insert({
      section_id: data.section_id,
      title: data.title,
      content: data.content,
      author_id: profile.id,
      author_name: profile.full_name
    });
    if (error) {
      setCustomSubsections(prev => prev.filter(s => s.id !== optimistic.id));
      alert('Failed to add subsection: ' + error.message);
    }
  }

  async function handleAddSection(data) {
    const optimistic = {
      id: crypto.randomUUID(),
      ...data,
      author_id: profile.id,
      author_name: profile.full_name,
      created_at: new Date().toISOString(),
      sort_order: 999
    };
    setCustomSections(prev => [...prev, optimistic]);
    setSectionModal(false);
    const { error } = await supabase.from('custom_sections').insert({
      section_id: data.section_id,
      number: data.number,
      title: data.title,
      description: data.description,
      content: data.content,
      author_id: profile.id,
      author_name: profile.full_name
    });
    if (error) {
      setCustomSections(prev => prev.filter(s => s.id !== optimistic.id));
      alert('Failed to add section: ' + error.message);
    }
  }

  function handleExport(format) {
    setExportModal(false);
    if (format === 'pdf') {
      window.print();
    } else {
      exportAsHTML();
    }
  }

  function exportAsHTML() {
    const today = new Date().toISOString().split('T')[0];
    const mainEl = document.getElementById('main');
    // Build clean semantic HTML export
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="export-date" content="${new Date().toISOString()}">
<meta name="exported-by" content="${profile.full_name}">
<meta name="document-version" content="1.0">
<title>Laurino's Tavern — System Architecture Export — ${today}</title>
<style>body{font-family:sans-serif;max-width:900px;margin:0 auto;padding:40px;line-height:1.7;color:#222}h2{border-bottom:1px solid #ccc;padding-bottom:8px;margin-top:40px}h3{margin-top:24px}h4{margin-top:16px;color:#666}.note-card,.correction-card{padding:12px;margin:8px 0;border-left:3px solid #ccc;background:#f9f9f9}.correction-card{border-left-color:#c0522a;background:#fef5f2}.note-author,.correction-author{font-weight:bold;font-size:0.85rem}.note-date,.correction-date{color:#888;font-size:0.8rem}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{padding:8px 12px;border:1px solid #ddd;text-align:left}th{background:#f5f5f5}</style>
</head>
<body>
<h1>Laurino's Tavern — System Architecture</h1>
`;
    // Clone and extract inner content
    if (mainEl) {
      const clone = mainEl.cloneNode(true);
      // Remove interactive elements
      clone.querySelectorAll('.add-interaction-btn, .add-subsection-btn, .add-section-btn, .export-btn-header, button').forEach(el => el.remove());
      html += clone.innerHTML;
    }

    html += `
<footer data-export-meta="true">
<p>Exported: ${new Date().toLocaleString()}</p>
<p>Exported by: ${profile.full_name}</p>
<p>Total notes: ${notes.length}</p>
<p>Total corrections: ${corrections.length}</p>
<p>Custom subsections added: ${customSubsections.length}</p>
<p>Custom sections added: ${customSections.length}</p>
</footer>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laurinos-system-architecture-${today}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Shared props for sections
  const sp = { notes, corrections, customSubsections, onAddNote: openNoteModal, onAddCorrection: openCorrectionModal, onAddSubsection: openSubsectionModal };

  return (
    <>
      <div id="scroll-progress"><div id="scroll-bar"></div></div>

      <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

      <Sidebar profile={profile} onSignOut={onSignOut} onExport={() => setExportModal(true)}
        customSections={customSections} sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />

      <div id="main">
        {/* PAGE HEADER */}
        <header id="page-header">
          <button className="export-btn-header" onClick={() => setExportModal(true)}>↓ Export</button>
          <div className="header-tag">◆ Laurino's Tavern · Cape Cod · Master System Document</div>
          <h1 className="header-title">System of<br /><span>Systems</span></h1>
          <p className="header-sub">A comprehensive operational architecture designed to automate, scale, and self-reinforce every layer of the business — from daily kitchen checklists to multi-year revenue flywheel growth.</p>
          <div className="header-meta">
            <div className="meta-pill"><div className="dot"></div> 14 Core Departments</div>
            <div className="meta-pill"><div className="dot"></div> 60+ Subsystems</div>
            <div className="meta-pill"><div className="dot"></div> 4 Automation Phases</div>
            <div className="meta-pill"><div className="dot"></div> Unified Calendar Layer</div>
            <div className="meta-pill"><div className="dot"></div> Role-Based Access Control</div>
          </div>
        </header>

        <div id="content">

          {/* ══ SECTION 0: VISION ══ */}
          <Section id="overview" number="00" title="Vision & The Flywheel" desc="What this document is and why it exists" {...sp}>
            <div className="desc-block">
              Laurino's Tavern is not just a restaurant. It is a <strong style={{ color: 'var(--gold-bright)' }}>system of interconnected revenue engines, operational protocols, and brand-building loops</strong> designed to reinforce each other. This document is the master blueprint — the outermost layer — from which every department, role, checklist, and automation descends.
            </div>
            <div className="desc-block">
              The core thesis is simple: if every department runs on documented systems, and those systems feed a global calendar, and that calendar drives accountable daily action, the business runs and grows <em style={{ color: 'var(--gold)' }}>without requiring the owner's constant presence</em>. That is the flywheel. Each turn makes the next turn easier.
            </div>

            {/* FLYWHEEL SVG */}
            <div className="flywheel-container">
              <svg className="flywheel-svg" viewBox="0 0 700 340" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#c08b2a"/>
                  </marker>
                </defs>
                <circle cx="350" cy="170" r="55" fill="rgba(212,168,83,0.08)" stroke="#c08b2a" strokeWidth="1.5"/>
                <text x="350" y="163" textAnchor="middle" fill="#d4a853" fontFamily="Cormorant Garamond" fontSize="13" fontWeight="600">LAURINO'S</text>
                <text x="350" y="180" textAnchor="middle" fill="#7070a0" fontFamily="DM Mono" fontSize="8" letterSpacing="2">FLYWHEEL</text>
                <circle cx="175" cy="80" r="38" fill="rgba(20,20,24,0.9)" stroke="#3a3a48" strokeWidth="1"/>
                <text x="175" y="76" textAnchor="middle" fill="#b8b8cc" fontFamily="Outfit" fontSize="9" fontWeight="500">Systems &amp;</text>
                <text x="175" y="90" textAnchor="middle" fill="#b8b8cc" fontFamily="Outfit" fontSize="9" fontWeight="500">Operations</text>
                <circle cx="525" cy="80" r="38" fill="rgba(20,20,24,0.9)" stroke="#7a5c1e" strokeWidth="1"/>
                <text x="525" y="76" textAnchor="middle" fill="#d4a853" fontFamily="Outfit" fontSize="9" fontWeight="500">Revenue</text>
                <text x="525" y="90" textAnchor="middle" fill="#d4a853" fontFamily="Outfit" fontSize="9" fontWeight="500">Engines ×13</text>
                <circle cx="100" cy="220" r="38" fill="rgba(20,20,24,0.9)" stroke="#3a3a48" strokeWidth="1"/>
                <text x="100" y="216" textAnchor="middle" fill="#b8b8cc" fontFamily="Outfit" fontSize="9" fontWeight="500">Brand &amp;</text>
                <text x="100" y="230" textAnchor="middle" fill="#b8b8cc" fontFamily="Outfit" fontSize="9" fontWeight="500">Social</text>
                <circle cx="600" cy="220" r="38" fill="rgba(20,20,24,0.9)" stroke="#3a3a48" strokeWidth="1"/>
                <text x="600" y="216" textAnchor="middle" fill="#b8b8cc" fontFamily="Outfit" fontSize="9" fontWeight="500">People &amp;</text>
                <text x="600" y="230" textAnchor="middle" fill="#b8b8cc" fontFamily="Outfit" fontSize="9" fontWeight="500">Culture</text>
                <circle cx="350" cy="310" r="34" fill="rgba(20,20,24,0.9)" stroke="#2a2a35" strokeWidth="1"/>
                <text x="350" y="306" textAnchor="middle" fill="#7070a0" fontFamily="Outfit" fontSize="8" fontWeight="500">Global</text>
                <text x="350" y="318" textAnchor="middle" fill="#7070a0" fontFamily="Outfit" fontSize="8" fontWeight="500">Calendar</text>
                <path d="M213,88 C260,90 290,110 305,135" stroke="#c08b2a" strokeWidth="1.2" fill="none" markerEnd="url(#arrow)"/>
                <path d="M487,88 C440,90 410,110 395,135" stroke="#c08b2a" strokeWidth="1.2" fill="none" markerEnd="url(#arrow)"/>
                <path d="M132,213 C180,200 240,195 295,190" stroke="#3a3a48" strokeWidth="1" fill="none" markerEnd="url(#arrow)"/>
                <path d="M568,213 C520,200 460,195 405,190" stroke="#3a3a48" strokeWidth="1" fill="none" markerEnd="url(#arrow)"/>
                <path d="M350,225 L350,276" stroke="#2a2a35" strokeWidth="1" fill="none" markerEnd="url(#arrow)"/>
                <path d="M316,300 C200,290 140,260 130,238" stroke="#2a2a35" strokeWidth="1" fill="none" strokeDasharray="3,3"/>
                <path d="M384,300 C500,290 560,260 570,238" stroke="#2a2a35" strokeWidth="1" fill="none" strokeDasharray="3,3"/>
              </svg>
            </div>

            <div className="metric-row">
              <div className="metric-card"><div className="metric-label">Current Revenue</div><div className="metric-value">$1.3M</div><div className="metric-sub">Annual baseline</div></div>
              <div className="metric-card"><div className="metric-label">Revenue Streams</div><div className="metric-value">13</div><div className="metric-sub">Identified growth channels</div></div>
              <div className="metric-card"><div className="metric-label">First Goal</div><div className="metric-value">Scaffold</div><div className="metric-sub">Complete the full system map</div></div>
              <div className="metric-card"><div className="metric-label">Location</div><div className="metric-value">Cape Cod</div><div className="metric-sub">Seasonal + year-round</div></div>
            </div>
          </Section>

          {/* ══ STANDALONE: AUTOMATION PHASES ══ */}
          <div className="standalone-section" id="phases">
            <div className="standalone-label">★ Standalone Critical Section — Read First</div>
            <div className="standalone-title">Automation in Phases — The Rollout Strategy</div>
            <div className="standalone-body">
              All systems described in this document are deployed in deliberate phases. The goal is not to automate everything at once — it is to build a foundation that makes each subsequent layer of automation easier to add. Phase 1 is fully manual but fully documented. Phase 4 is nearly autonomous.
            </div>

            <div className="phase-timeline" style={{ marginTop: 28 }}>
              <div className="phase-step active">
                <div className="phase-dot">P1</div>
                <div className="phase-content">
                  <div className="phase-label">Phase 1 — Now</div>
                  <div className="phase-title">Scaffolding & Full Documentation</div>
                  <div className="phase-body">Build out every subsystem, define every role, document every checklist. Nothing is automated yet — but everything is written down and agreed upon. This is the hardest and most important phase. A system that isn't documented cannot be automated.</div>
                  <div className="phase-items">
                    <div className="phase-item">Complete all 14 department definitions with sub-layers</div>
                    <div className="phase-item">Define all roles, responsibilities, and chain of command</div>
                    <div className="phase-item">Write all onboarding, checklist, and troubleshooting docs</div>
                    <div className="phase-item">Set up the global calendar structure (manual input)</div>
                    <div className="phase-item">Assign staff to departments with view/edit permissions</div>
                    <div className="phase-item">Define time-horizon goals for every subsystem (daily → annual)</div>
                  </div>

                  {/* PHASE 1 PART 2: MANAGEMENT STRUCTURE */}
                  <div style={{ marginTop: 28, padding: '24px 28px', background: 'rgba(212,168,83,0.05)', border: '1px solid var(--gold-dim)', borderRadius: 6 }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>Phase 1 · Part 2 — Management Structure & Decision Authority</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-bright)', marginBottom: 12 }}>No GM. Two Domain Managers. One Lead.</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.8, marginBottom: 16 }}>
                      Laurino's Tavern does not employ a General Manager. At this revenue level a GM represents $55K–$80K/year in overhead for a role that — with tight systems — is largely administrative. Instead, the business runs on a <strong style={{ color: 'var(--gold-bright)' }}>two-manager domain model</strong> backed by cameras, weekly reporting, monthly P&L review, and quarterly owner audits.
                      <br /><br />
                      <strong style={{ color: 'var(--text-main)' }}>BOH Manager (Chef/Kitchen Lead)</strong> — Owns everything behind the pass: food cost, ordering, prep standards, kitchen scheduling, recipe adherence, temp logs, waste, and cleanliness. The kitchen runs or fails on this person.<br /><br />
                      <strong style={{ color: 'var(--text-main)' }}>FOH Manager (Floor Lead)</strong> — Owns everything in front of the pass: service standards, server scheduling, guest experience, reservations, floor flow, sidework, and cash handling.<br /><br />
                      <strong style={{ color: 'var(--text-main)' }}>Lead Manager (designated, rotational or fixed)</strong> — One of the two managers holds the "Lead" designation when on shift. This is the tiebreaker role. They do not manage the other manager's domain — but they hold final in-the-moment authority on cross-functional decisions, staff conflicts, and escalations. They sign the incident log. They send the weekly report. A modest pay differential ($4–8K/year) reflects this added responsibility.
                      <br /><br />
                      <strong style={{ color: 'var(--gold-bright)' }}>The owner's nervous system is the reporting cadence + cameras — not physical presence:</strong> Weekly snapshots arrive Monday AM. Monthly P&L reviewed within 48 hours of close. Cameras provide real-time and retrospective visibility. Quarterly audits close the loop.
                    </div>

                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-mid)', marginBottom: 10 }}>Role Comparison</div>
                    <table className="data-table" style={{ marginBottom: 24 }}>
                      <thead><tr><th>Area</th><th>BOH Manager</th><th>FOH Manager</th><th>Lead Manager (when on)</th></tr></thead>
                      <tbody>
                        <tr><td>Domain ownership</td><td>Kitchen, prep, food cost</td><td>Floor, service, scheduling</td><td>Cross-functional + escalations</td></tr>
                        <tr><td>Daily open/close</td><td>Kitchen checklist</td><td>FOH checklist</td><td>Full building sign-off</td></tr>
                        <tr><td>Reports to owner</td><td>Weekly food cost, incident log</td><td>Weekly covers, incident log</td><td>Combined weekly snapshot</td></tr>
                        <tr><td>Staff conflict resolution</td><td>Within kitchen</td><td>Within FOH</td><td>Cross-team final call</td></tr>
                        <tr><td>Unplanned spend authority</td><td>Up to $200 (kitchen only)</td><td>Up to $200 (FOH only)</td><td>Up to $500, owner notified</td></tr>
                        <tr><td>Hiring recommendation</td><td>Kitchen roles</td><td>FOH roles</td><td>Co-signs, owner approves</td></tr>
                        <tr><td>Camera / system access</td><td>Kitchen cameras</td><td>FOH cameras</td><td>Full camera access on shift</td></tr>
                      </tbody>
                    </table>

                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-mid)', marginBottom: 10 }}>Decision Authority Matrix</div>
                    <table className="data-table">
                      <thead><tr><th>Decision</th><th>BOH Mgr</th><th>FOH Mgr</th><th>Lead Mgr</th><th>Owner</th></tr></thead>
                      <tbody>
                        <tr><td>86 a menu item mid-service</td><td style={{ color: 'var(--green-bright)' }}>✓ Decides</td><td>—</td><td>—</td><td>—</td></tr>
                        <tr><td>Change server schedule</td><td>—</td><td style={{ color: 'var(--green-bright)' }}>✓ Decides</td><td>—</td><td>—</td></tr>
                        <tr><td>Change kitchen schedule</td><td style={{ color: 'var(--green-bright)' }}>✓ Decides</td><td>—</td><td>—</td><td>—</td></tr>
                        <tr><td>Comp a guest's meal (under $50)</td><td>—</td><td style={{ color: 'var(--green-bright)' }}>✓ Decides</td><td>—</td><td>—</td></tr>
                        <tr><td>Comp a guest's meal (over $50)</td><td>—</td><td>Recommends</td><td style={{ color: 'var(--gold)' }}>✓ Approves</td><td>Notified</td></tr>
                        <tr><td>Resolve BOH/FOH conflict</td><td>—</td><td>—</td><td style={{ color: 'var(--gold)' }}>✓ Owns</td><td>Escalated only</td></tr>
                        <tr><td>Hire a new line cook</td><td>Recommends</td><td>—</td><td style={{ color: 'var(--gold)' }}>Co-signs</td><td style={{ color: 'var(--ember-bright)' }}>✓ Required</td></tr>
                        <tr><td>Hire a new server/host</td><td>—</td><td>Recommends</td><td style={{ color: 'var(--gold)' }}>Co-signs</td><td style={{ color: 'var(--ember-bright)' }}>✓ Required</td></tr>
                        <tr><td>Fire any staff member</td><td>—</td><td>—</td><td>—</td><td style={{ color: 'var(--ember-bright)' }}>✓ Required</td></tr>
                        <tr><td>Disciplinary write-up (step 1–2)</td><td>Within kitchen</td><td>Within FOH</td><td style={{ color: 'var(--gold)' }}>Signs off</td><td>Notified</td></tr>
                        <tr><td>Unplanned spend under $200</td><td>✓ Own domain</td><td>✓ Own domain</td><td>—</td><td>—</td></tr>
                        <tr><td>Unplanned spend $200–$500</td><td>—</td><td>—</td><td style={{ color: 'var(--gold)' }}>✓ Approves</td><td>Notified</td></tr>
                        <tr><td>Unplanned spend over $500</td><td>—</td><td>—</td><td>—</td><td style={{ color: 'var(--ember-bright)' }}>✓ Required</td></tr>
                        <tr><td>Change menu item (permanent)</td><td>Recommends</td><td>—</td><td>—</td><td style={{ color: 'var(--ember-bright)' }}>✓ Required</td></tr>
                        <tr><td>Close early / cancel service</td><td>—</td><td>—</td><td>Recommends</td><td style={{ color: 'var(--ember-bright)' }}>✓ Required</td></tr>
                        <tr><td>Accept large event/buyout</td><td>—</td><td>—</td><td>—</td><td style={{ color: 'var(--ember-bright)' }}>✓ Required</td></tr>
                        <tr><td>Daily opening sign-off</td><td>Kitchen ✓</td><td>FOH ✓</td><td style={{ color: 'var(--gold)' }}>Full building ✓</td><td>—</td></tr>
                        <tr><td>Weekly report sent to owner</td><td>Contributes</td><td>Contributes</td><td style={{ color: 'var(--gold)' }}>Sends by Mon AM</td><td>Reviews</td></tr>
                      </tbody>
                    </table>
                    <div style={{ marginTop: 14, padding: '14px 18px', background: 'rgba(192,82,42,0.08)', borderLeft: '3px solid var(--ember)', borderRadius: '0 4px 4px 0', fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: 1.7 }}>
                      <strong style={{ color: 'var(--ember-bright)' }}>The rule that makes this work:</strong> Every ambiguity you leave unresolved in this matrix becomes a phone call to the owner at 7pm on a Saturday in August. Define it now. The decision matrix is a living document — add rows whenever a real incident reveals a gap.
                    </div>
                  </div>
                </div>
              </div>
              <div className="phase-step">
                <div className="phase-dot">P2</div>
                <div className="phase-content">
                  <div className="phase-label">Phase 2 — 3–6 Months</div>
                  <div className="phase-title">Digitization & Workflow Tooling</div>
                  <div className="phase-body">Move all documentation into a live platform (Notion, ClickUp, or custom). Connect the todo system to the global calendar. Begin automating recurring reminders, checklist delivery by role, and audit scheduling.</div>
                  <div className="phase-items">
                    <div className="phase-item">Select and configure the platform (Notion / ClickUp / custom)</div>
                    <div className="phase-item">Import all Phase 1 docs into the system</div>
                    <div className="phase-item">Set up automated recurring tasks (daily open/close, weekly food cost review)</div>
                    <div className="phase-item">Connect DoorDash / Uber Eats dashboards for visibility</div>
                    <div className="phase-item">Begin Google Reviews automation (request flow post-visit)</div>
                    <div className="phase-item">Social media scheduling pipeline (Buffer / Later)</div>
                  </div>
                </div>
              </div>
              <div className="phase-step">
                <div className="phase-dot">P3</div>
                <div className="phase-content">
                  <div className="phase-label">Phase 3 — 6–18 Months</div>
                  <div className="phase-title">Integration & Data Loops</div>
                  <div className="phase-body">Connect the various revenue streams into unified reporting. Automate food cost tracking from POS data. Build the event funnel with automated follow-up. Begin influencer and wedding planner outreach systems.</div>
                  <div className="phase-items">
                    <div className="phase-item">POS → food cost → accounting integration pipeline</div>
                    <div className="phase-item">Event inquiry → CRM → follow-up automation</div>
                    <div className="phase-item">Employee performance review triggered by role calendar</div>
                    <div className="phase-item">SEO dashboard with weekly ranking reports</div>
                    <div className="phase-item">Financial health dashboard visible to owner daily</div>
                    <div className="phase-item">Seasonal menu swap notifications and prep timelines</div>
                  </div>
                </div>
              </div>
              <div className="phase-step">
                <div className="phase-dot">P4</div>
                <div className="phase-content">
                  <div className="phase-label">Phase 4 — 18+ Months</div>
                  <div className="phase-title">Flywheel Autonomy</div>
                  <div className="phase-body">The business largely runs itself. Staff operate from their own calendar views. Revenue engines are optimized and self-reporting. The owner's role shifts from operator to strategist — reviewing dashboards, approving major decisions, and identifying the next flywheel to spin up.</div>
                  <div className="phase-items">
                    <div className="phase-item">Full revenue reporting dashboard with YoY comparisons</div>
                    <div className="phase-item">AI-assisted scheduling and labor optimization</div>
                    <div className="phase-item">Franchise or expansion documentation based on this system</div>
                    <div className="phase-item">Automated financial health alerts and anomaly detection</div>
                    <div className="phase-item">Self-running event calendar with deposit/contract automation</div>
                  </div>
                </div>
              </div>
            </div>

            <InteractionBlock sectionId="phases" notes={notes} corrections={corrections}
              onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}
              onAddSubsection={openSubsectionModal} showAddSubsection={false} />
          </div>

          {/* ══ STANDALONE: PLATFORM & DAILY USE ══ */}
          <div className="standalone-section" id="platform" style={{ borderColor: 'var(--blue)', background: 'linear-gradient(135deg,rgba(42,90,154,0.10) 0%,rgba(212,168,83,0.05) 100%)' }}>
            <div className="standalone-label" style={{ color: 'var(--blue-bright)' }}>★ Standalone Critical Section — Platform Architecture</div>
            <div className="standalone-title" style={{ color: 'var(--blue-bright)' }}>How It Works — Daily Use, Task System & Platform Description</div>
            <div className="standalone-body">
              Every department and sub-category in this document contains three core fields:
              <br /><br />
              <strong style={{ color: 'var(--gold-bright)' }}>① Goal Field</strong> — A description of the department's purpose, what success looks like, and its role in the broader flywheel.<br />
              <strong style={{ color: 'var(--gold-bright)' }}>② Task Field</strong> — Actionable todos with: description, assigned role, due date/time, recurrence interval, and a department tag. Each task is sized to fit on a single calendar card (≤200 characters).<br />
              <strong style={{ color: 'var(--gold-bright)' }}>③ Time Horizons</strong> — Every department has goals mapped to: Daily · Weekly · Monthly · Quarterly · Annual.
              <br /><br />
              <strong style={{ color: 'var(--text-bright)' }}>The Global Calendar</strong> aggregates every task from every department into a single master view. It shows task name, department tag, assigned role, and due date. Staff can toggle between the Global Calendar and their own department-filtered view. Admins can lock departments from unauthorized edits. A super-user assigns which staff see which departments and whether they can view-only or edit.
              <br /><br />
              <strong style={{ color: 'var(--text-bright)' }}>Recommended Platform Stack (Phase 2+):</strong> Notion (primary hub) + Google Calendar sync + Slack notifications per department + POS integration for food cost/sales data + Google Workspace for docs and forms.
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: 12 }}>Task Time Horizons — Applied to Every Department</div>
              <div className="timeframe-grid">
                <div className="timeframe-card"><div className="timeframe-label">Daily</div><div className="timeframe-desc">Open/close checklists, line prep, social post, sales log, cash drawer</div></div>
                <div className="timeframe-card"><div className="timeframe-label">Weekly</div><div className="timeframe-desc">Food cost review, inventory, staff check-in, review replies, social schedule</div></div>
                <div className="timeframe-card"><div className="timeframe-label">Monthly</div><div className="timeframe-desc">P&L review, menu QA, employee reviews, maintenance walkthroughs, marketing audit</div></div>
                <div className="timeframe-card"><div className="timeframe-label">Quarterly</div><div className="timeframe-desc">Financial health deep-dive, menu rotation, HR policy review, supplier renegotiation</div></div>
                <div className="timeframe-card"><div className="timeframe-label">Annual</div><div className="timeframe-desc">Licensing renewals, full system review, brand audit, goal-setting, insurance, strategy</div></div>
              </div>
            </div>

            <div style={{ marginTop: 24 }} id="calendar-system">
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: 12 }}>Global Calendar Preview — All Departments Feed Into This</div>
              <div className="calendar-block">
                <div className="cal-header">
                  <div className="cal-title">Global Task Calendar — All Departments</div>
                  <div className="cal-tabs">
                    <div className="cal-tab active">All</div>
                    <div className="cal-tab">Finance</div>
                    <div className="cal-tab">Ops</div>
                    <div className="cal-tab">Food</div>
                    <div className="cal-tab">HR</div>
                    <div className="cal-tab">Social</div>
                  </div>
                </div>
                <div className="cal-events">
                  <div className="cal-event"><div className="cal-date">Daily · 7:00 AM</div><div><span className="cal-dept dept-ops">Operations</span></div><div className="cal-task">Open checklist — line check, temp logs, POS float, unlock</div><div className="cal-status">Recurring</div></div>
                  <div className="cal-event"><div className="cal-date">Daily · 11:00 PM</div><div><span className="cal-dept dept-ops">Operations</span></div><div className="cal-task">Close checklist — clean-down, lock-up, cash count, log issues</div><div className="cal-status">Recurring</div></div>
                  <div className="cal-event"><div className="cal-date">Weekly · Mon</div><div><span className="cal-dept dept-food">Food</span></div><div className="cal-task">Food cost review — pull POS data, compare actuals vs. targets, flag variances</div><div className="cal-status">Every Mon</div></div>
                  <div className="cal-event"><div className="cal-date">Weekly · Wed</div><div><span className="cal-dept dept-social">Social</span></div><div className="cal-task">Schedule week's content — 3 posts, 2 stories, 1 reel — queue in Buffer</div><div className="cal-status">Every Wed</div></div>
                  <div className="cal-event"><div className="cal-date">Monthly · 1st</div><div><span className="cal-dept dept-finance">Finance</span></div><div className="cal-task">P&L review — previous month actuals vs. budget, update financial health score</div><div className="cal-status">Monthly</div></div>
                  <div className="cal-event"><div className="cal-date">Monthly · 15th</div><div><span className="cal-dept dept-hr">HR</span></div><div className="cal-task">Staff review cycle — complete performance notes for all scheduled reviews</div><div className="cal-status">Monthly</div></div>
                  <div className="cal-event"><div className="cal-date">Quarterly · Q1</div><div><span className="cal-dept dept-admin">Owner</span></div><div className="cal-task">Strategic review — all departments, supplier contracts, goal assessment</div><div className="cal-status">Quarterly</div></div>
                  <div className="cal-event"><div className="cal-date">Annual · Jan</div><div><span className="cal-dept dept-admin">Admin</span></div><div className="cal-task">License renewals, insurance review, health dept inspections, liquor license</div><div className="cal-status">Annual</div></div>
                </div>
              </div>
            </div>

            <InteractionBlock sectionId="platform" notes={notes} corrections={corrections}
              onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}
              onAddSubsection={openSubsectionModal} showAddSubsection={false} />
          </div>

          {/* ══ ACCESS CONTROL ══ */}
          <Section id="access-control" number="AC" title="Access Control & Role Permissions" desc="Who can see what, who can edit what, and how the super-user governs the system" {...sp}>
            <div className="desc-block">The system operates on a three-tier permission model. Every staff member is assigned to one or more department views. The super-user (owner) controls all assignments. Admins can lock departments from editing. All access is set at the department level — not the individual task level — for simplicity.</div>
            <div className="access-grid">
              <div className="access-card superuser">
                <div className="access-role">Tier 1 — Super User</div>
                <div className="access-name">Owner / Founder</div>
                <div className="access-perm"><div className="dot yes"></div> View all departments & calendars</div>
                <div className="access-perm"><div className="dot yes"></div> Edit all departments & tasks</div>
                <div className="access-perm"><div className="dot yes"></div> Assign roles to staff</div>
                <div className="access-perm"><div className="dot yes"></div> Lock/unlock department editing</div>
                <div className="access-perm"><div className="dot yes"></div> Create & delete departments</div>
                <div className="access-perm"><div className="dot yes"></div> Global calendar full control</div>
                <div className="access-perm"><div className="dot yes"></div> Financial data unrestricted</div>
              </div>
              <div className="access-card admin">
                <div className="access-role">Tier 2 — Admin / Manager</div>
                <div className="access-name">Lead Manager · BOH Manager · FOH Manager</div>
                <div className="access-perm"><div className="dot yes"></div> View assigned departments</div>
                <div className="access-perm"><div className="dot yes"></div> Edit tasks in assigned departments</div>
                <div className="access-perm"><div className="dot partial"></div> View global calendar (filtered)</div>
                <div className="access-perm"><div className="dot no"></div> Cannot assign roles to others</div>
                <div className="access-perm"><div className="dot no"></div> Cannot access locked departments</div>
                <div className="access-perm"><div className="dot partial"></div> Can mark tasks complete</div>
                <div className="access-perm"><div className="dot no"></div> No financial data access</div>
              </div>
              <div className="access-card staff">
                <div className="access-role">Tier 3 — Staff</div>
                <div className="access-name">Servers, Kitchen, Bartenders</div>
                <div className="access-perm"><div className="dot yes"></div> View own department calendar</div>
                <div className="access-perm"><div className="dot partial"></div> Edit only their assigned tasks</div>
                <div className="access-perm"><div className="dot no"></div> No global calendar access</div>
                <div className="access-perm"><div className="dot no"></div> No cross-department visibility</div>
                <div className="access-perm"><div className="dot yes"></div> Can complete/check off tasks</div>
                <div className="access-perm"><div className="dot no"></div> No financial, HR, or owner data</div>
                <div className="access-perm"><div className="dot no"></div> No role assignment capability</div>
              </div>
            </div>
            <div className="callout"><strong>Permission Legend:</strong> Green dot = full access · Gold dot = partial or conditional access · Dim dot = no access. All assignments are made by the super-user. Roles can be updated at any time without disrupting existing task data.</div>
          </Section>

          <div className="divider"></div>

          {/* ══ SECTION 1: ACCOUNTING ══ */}
          <Section id="s1" number="01" title="Accounting" desc="Core bookkeeping, tax preparation, and financial record infrastructure" {...sp}>
            <div className="desc-block">The accounting system is the financial nervous system of the business. It captures all inflows and outflows, connects to the POS, and generates reports that feed the Financial Health dashboard (Section 2). The goal is clean, real-time books that can be reviewed in under 5 minutes by the owner at any time.</div>
            <div className="callout"><strong>Goal:</strong> Maintain books that are always current (max 48-hour lag), produce monthly P&L automatically, and flag any anomalous spend within 24 hours of it occurring.</div>
            <div className="timeframe-grid">
              <div className="timeframe-card"><div className="timeframe-label">Daily</div><div className="timeframe-desc">Reconcile POS sales, log cash deposits, flag voids/discounts</div></div>
              <div className="timeframe-card"><div className="timeframe-label">Weekly</div><div className="timeframe-desc">AP/AR check, payroll prep review, bank statement match</div></div>
              <div className="timeframe-card"><div className="timeframe-label">Monthly</div><div className="timeframe-desc">P&L finalization, tax reserve calculation, invoice audit</div></div>
              <div className="timeframe-card"><div className="timeframe-label">Quarterly</div><div className="timeframe-desc">Tax estimated payments, expense category review, accountant sync</div></div>
              <div className="timeframe-card"><div className="timeframe-label">Annual</div><div className="timeframe-desc">Tax filing, depreciation schedule, full audit prep, CPA review</div></div>
            </div>
            <div className="tag-list">
              <span className="tag">QuickBooks / Xero</span><span className="tag">POS Integration</span><span className="tag">Payroll (Gusto/ADP)</span><span className="tag">Cash Handling Protocols</span><span className="tag">Bank Reconciliation</span><span className="tag">Tax Reserve</span><span className="tag">CPA Relationship</span>
            </div>
          </Section>

          {/* ══ SECTION 2: FINANCIAL HEALTH ══ */}
          <Section id="s2" number="02" title="Financial Health" desc="The two forces: downward spend pressure and upward revenue growth" {...sp}>
            <div className="desc-block">Financial health is a live score — not an annual event. It is measured by the tension between what the business spends and what it earns. Both levers must be actively managed. This section governs all 13 revenue growth engines and the systematic reduction of operating costs.</div>

            <Subsection id="s2-1" num="2.1" title="Downward Spend Pressure" notes={notes} corrections={corrections} onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}>
              <div className="desc-block">A systematic, ongoing effort to reduce every cost line without sacrificing quality or staff satisfaction. Not a one-time cost-cut — a continuous pressure valve. This includes supplier negotiations, waste reduction, scheduling efficiency, and energy/utility optimization.</div>
              <table className="data-table">
                <thead><tr><th>Cost Category</th><th>Strategy</th><th>Review Interval</th><th>Owner</th></tr></thead>
                <tbody>
                  <tr><td>Food & Beverage COGS</td><td>Weekly food cost %, vendor price compares, waste log</td><td>Weekly</td><td>Chef / GM</td></tr>
                  <tr><td>Labor</td><td>Scheduling vs. covers matrix, overtime alerts, tip credit review</td><td>Weekly</td><td>GM</td></tr>
                  <tr><td>Utilities</td><td>Monthly meter read, energy audit annually, LED upgrades</td><td>Monthly</td><td>Owner</td></tr>
                  <tr><td>Supplier Contracts</td><td>Renegotiate annually, competitive bid every 2 years</td><td>Annually</td><td>Owner</td></tr>
                  <tr><td>Credit Card Fees</td><td>Merchant services rate audit, surcharge policy review</td><td>Quarterly</td><td>Owner</td></tr>
                  <tr><td>Insurance</td><td>Annual rebid, bundled policy review</td><td>Annually</td><td>Owner</td></tr>
                  <tr><td>Platform Fees (DD/UE)</td><td>Track commission %, negotiate promo participation terms</td><td>Monthly</td><td>GM</td></tr>
                </tbody>
              </table>
            </Subsection>

            <Subsection id="s2-2" num="2.2" title="Upward Revenue Growth — 13 Engines" notes={notes} corrections={corrections} onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}>
              <div className="desc-block">Thirteen distinct revenue streams have been identified. Each is a flywheel of its own. Each has a goal, a status, and a set of quarterly targets. The cumulative effect of all 13 running simultaneously is the financial engine that fuels the business's growth beyond the base restaurant volume.</div>
              <div className="leaf-grid">
                {[
                  { num: '2.2.1', title: 'Catering', detail: 'Off-premise events, boxed meals, corporate orders. Needs dedicated menu, pricing sheet, and booking flow.' },
                  { num: '2.2.2', title: 'Ice Cream Outside', detail: 'Seasonal outdoor ice cream stand/window. High-margin, foot-traffic capture. Summer only — Cape Cod tourists.' },
                  { num: '2.2.3', title: 'Live Music', detail: "Ticketed or cover-free live acts. Drives midweek covers and bar revenue. Needs booking calendar and performer contracts." },
                  { num: '2.2.4', title: 'Food (Core Revenue)', detail: 'Primary dining — dine-in and to-go. Seasonal menu rotation. Quality review quarterly.' },
                  { num: '2.2.5', title: 'Events (Ticketed)', detail: "Wine dinners, themed nights, trivia, seasonal events. Revenue from tickets + F&B. Needs event calendar and ticketing system." },
                  { num: '2.2.6', title: 'Receptions & Weddings', detail: 'Private event space rental, wedding rehearsal dinners, receptions. Build relationships with 3–5 local wedding planners. Host annual showcase event. Develop wedding + event package menu. 180-person capacity buyout option.' },
                  { num: '2.2.7', title: 'Uber Eats', detail: 'Third-party delivery. Optimized menu (high-margin, travel-friendly items). Monitor commission rates monthly.' },
                  { num: '2.2.8', title: 'DoorDash', detail: 'Third-party delivery — parallel to Uber Eats. Cross-platform pricing consistency. Separate from Uber Eats for redundancy.' },
                  { num: '2.2.9', title: 'Ice Rink in Winter', detail: 'Seasonal outdoor ice rink. Drives winter traffic to an otherwise slower season on Cape Cod. Skate rental, hot cocoa, food tie-in.' },
                  { num: '2.2.10', title: 'Portable Bar & Bartender', detail: 'Rentable bar service for off-site events. Requires licensing review, equipment list, insurance rider. High-margin with minimal overhead.' },
                  { num: '2.2.11', title: 'Housing On Premise', detail: 'Staff housing or rental unit on property. Reduces labor turnover, generates rental income. Requires local zoning review.' },
                  { num: '2.2.12', title: 'Frozen Pizza (Retail)', detail: 'Branded frozen pizza for retail/local market sale. Requires licensing, packaging, and distribution plan. Cape Cod souvenir angle.' },
                  { num: '2.2.13', title: 'Reef Runner', detail: 'Boat-based or dock-adjacent service concept. Define and develop. Could be a branded cocktail/food boat service, charter tie-in, or event vessel partnership.' },
                ].map(item => (
                  <div className="leaf-card" key={item.num}><div className="leaf-num">{item.num}</div><div className="leaf-title">{item.title}</div><div className="leaf-detail">{item.detail}</div></div>
                ))}
              </div>
            </Subsection>

            <Subsection id="s2-3" num="2.3 – 2.4" title="Accounting Integration & Food Cost Tracking" notes={notes} corrections={corrections} onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}>
              <div className="desc-block"><strong style={{ color: 'var(--text-main)' }}>2.3 Accounting</strong> — The accounting arm of financial health. Connects POS data, payroll, COGS, and overhead into a unified monthly P&L. Reviewed by owner monthly, flagged anomalies reviewed within 48 hours. Connects directly to Section 1 (Accounting system).</div>
              <div className="desc-block"><strong style={{ color: 'var(--text-main)' }}>2.4 Food Cost for All Items</strong> — Every single menu item must have a costed recipe card: ingredient cost per portion, waste factor, actual cost %, and target margin. This is not a one-time exercise — it is reviewed quarterly and updated with every supplier price change. Managed by the chef in coordination with the GM. Documented in a shared food cost master sheet accessible to owner and chef only.</div>
              <div className="callout"><strong>Target food cost range:</strong> 28–32% of food revenue. Beverage cost: 20–24%. Any week above 34% triggers an immediate review meeting.</div>
            </Subsection>
          </Section>

          {/* ══ SECTION 3: SOCIAL MEDIA ══ */}
          <Section id="s3" number="03" title="Social Media Presence" desc="Brand voice, content strategy, SEO, and influencer programming" {...sp}>
            <div className="desc-block">Social media is not a vanity project — it is a customer acquisition system. Every post, story, and reel serves a purpose: drive reservations, build brand warmth, capture local search intent, and keep the restaurant top-of-mind for Cape Cod visitors and locals alike.</div>

            <Subsection id="s3-1" num="3.1" title="Social Media Role & Expectations" notes={notes} corrections={corrections} onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}>
              <div className="desc-block">The social media role is a part-time or contracted position. The person in this role is responsible for all content creation, scheduling, and community management. They report to the Lead Manager and are reviewed monthly by the owner.</div>
              <table className="data-table">
                <thead><tr><th>Responsibility</th><th>Frequency</th><th>Platform</th><th>KPI</th></tr></thead>
                <tbody>
                  <tr><td>Feed posts (food, atmosphere, events)</td><td>4–5x/week</td><td>Instagram, Facebook</td><td>Reach, saves, shares</td></tr>
                  <tr><td>Stories (daily life, specials, behind scenes)</td><td>Daily</td><td>Instagram</td><td>Views, replies, DMs</td></tr>
                  <tr><td>Reels (short-form video)</td><td>2x/week</td><td>Instagram, TikTok</td><td>Views, follows, profile visits</td></tr>
                  <tr><td>Google Business profile updates</td><td>Weekly</td><td>Google</td><td>Search impressions</td></tr>
                  <tr><td>Reply to all reviews & comments</td><td>Daily</td><td>All</td><td>Response rate, sentiment</td></tr>
                  <tr><td>Event promotion content</td><td>Per event</td><td>All</td><td>Ticket sales, RSVPs</td></tr>
                </tbody>
              </table>
              <div className="callout"><strong>Cost structure:</strong> Contracted social media manager — $800–$1,500/month depending on scope. Review quarterly based on follower growth, engagement rate, and attributable reservation volume.</div>
            </Subsection>

            <Subsection id="s3-2" num="3.2 – 3.3" title="Google Reviews & SEO" notes={notes} corrections={corrections} onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}>
              <div className="desc-block"><strong style={{ color: 'var(--text-main)' }}>3.2 Google Reviews</strong> — Target 4.5+ stars with 200+ reviews. Reviews are requested via QR code on check receipts, post-visit text follow-up, and server prompt training. Every review (positive or negative) receives a response within 48 hours. Negative reviews trigger an owner alert and a templated, empathetic response protocol.</div>
              <div className="desc-block"><strong style={{ color: 'var(--text-main)' }}>3.3 SEO</strong> — Google Maps optimization (keywords, photos, hours), local blog content (Cape Cod food, events, seasonal menus), and backlink acquisition through local press and food bloggers. Monthly ranking report tracked against 10 target keywords: "Italian restaurant Cape Cod," "pizza Cape Cod," "wedding venue Cape Cod," etc.</div>
              <div className="tag-list">
                <span className="tag">Google Business Profile</span><span className="tag">Birdeye / Podium for Review Requests</span><span className="tag">Local SEO Keywords</span><span className="tag">Photo Updates Monthly</span><span className="tag">Schema Markup</span>
              </div>
            </Subsection>

            <Subsection id="s3-4" num="3.4" title="Annual Influencer Showcase Days" notes={notes} corrections={corrections} onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}>
              <div className="desc-block">Once per year — ideally late May or early June before peak season — host a curated Influencer Day. Invite 8–12 local and regional food influencers (10K–500K followers), Cape Cod lifestyle creators, and travel bloggers. Provide a hosted tasting menu experience with full photo access, branded content moments, and a press kit. The goal is a wave of organic content hitting just before peak tourist season.</div>
              <div className="callout"><strong>Planning timeline:</strong> Begin outreach in March · Lock invites by April 1 · Host event: last week of May · Follow-up content campaign: June 1. Budget: $600–$1,200 in food/beverage cost with zero paid fees.</div>
            </Subsection>
          </Section>

          {/* ══ SECTION 4: MAINTENANCE ══ */}
          <Section id="s4" number="04" title="Maintenance" desc="Preventive, reactive, and capital maintenance for all equipment and facility systems" {...sp}>
            <div className="desc-block">Deferred maintenance is the silent killer of restaurant margins. The maintenance system prevents expensive emergency repairs through scheduled preventive care, a documented equipment list, contractor relationships, and a rapid-response protocol for breakdowns. Every piece of equipment has a PM (preventive maintenance) schedule tied to the calendar.</div>
            <div className="callout"><strong>Goal:</strong> Zero critical equipment failures during service hours. Any equipment issue not resolved within 4 hours triggers an escalation to the owner. All contractor contacts are stored in this system and accessible by the Lead Manager at all times.</div>
            <table className="data-table">
              <thead><tr><th>System / Equipment</th><th>PM Frequency</th><th>Last Service</th><th>Primary Contractor</th><th>Emergency Contact</th></tr></thead>
              <tbody>
                <tr><td>HVAC / Hood System</td><td>Quarterly</td><td>[Date]</td><td>[Vendor]</td><td>[Phone]</td></tr>
                <tr><td>Walk-in Cooler / Freezer</td><td>Monthly visual, biannual service</td><td>[Date]</td><td>[Vendor]</td><td>[Phone]</td></tr>
                <tr><td>Dishwasher / Booster Heater</td><td>Monthly chemical check, quarterly service</td><td>[Date]</td><td>[Vendor]</td><td>[Phone]</td></tr>
                <tr><td>Grease Trap</td><td>Quarterly pump-out</td><td>[Date]</td><td>[Vendor]</td><td>[Phone]</td></tr>
                <tr><td>Fire Suppression System</td><td>Biannual (required by code)</td><td>[Date]</td><td>[Vendor]</td><td>[Phone]</td></tr>
                <tr><td>POS & Network Infrastructure</td><td>Monthly review, annual hardware audit</td><td>[Date]</td><td>[Vendor]</td><td>[Phone]</td></tr>
                <tr><td>Outdoor Space / Ice Rink</td><td>Pre-season inspection, post-season storage</td><td>[Date]</td><td>[Vendor]</td><td>[Phone]</td></tr>
                <tr><td>Generator (if installed)</td><td>Monthly run test, annual service</td><td>[Date]</td><td>[Vendor]</td><td>[Phone]</td></tr>
                <tr><td>Plumbing</td><td>Biannual inspection</td><td>[Date]</td><td>[Vendor]</td><td>[Phone]</td></tr>
              </tbody>
            </table>
          </Section>

          {/* ══ SECTION 5: EVENTS ══ */}
          <Section id="s5" number="05" title="Events" desc="Goodwill, holiday, house events, and the master event calendar" {...sp}>
            <div className="desc-block">Events are one of the highest-leverage activities in the business. A well-run event fills the room, generates social media content, drives word-of-mouth, and builds community loyalty all at once. Every event — from a holiday special to a charity night — must have a planning checklist, a promotion timeline, and a post-event review.</div>
            <div className="leaf-grid" style={{ marginTop: 0 }}>
              <div className="leaf-card"><div className="leaf-num">5.1</div><div className="leaf-title">Goodwill Events</div><div className="leaf-detail">Charity nights, community fundraisers, local organization partnerships. Builds goodwill and press coverage. 2–4x per year.</div></div>
              <div className="leaf-card"><div className="leaf-num">5.2</div><div className="leaf-title">Holiday Events</div><div className="leaf-detail">Valentine's Day, Mother's Day, Christmas Eve, NYE, Fourth of July. Each gets a dedicated prix-fixe or ticketed format and advance reservation system.</div></div>
              <div className="leaf-card"><div className="leaf-num">5.3</div><div className="leaf-title">House Events</div><div className="leaf-detail">Wine tastings, themed dinner nights, chef's table, trivia, live music nights. Managed on the house events calendar — minimum 1 per month off-season, 2–3 in-season.</div></div>
              <div className="leaf-card"><div className="leaf-num">5.4</div><div className="leaf-title">Event Calendar & Links</div><div className="leaf-detail">Master calendar shows all events with: title, date, description (≤200 chars), ticket/RSVP link, estimated covers, and assigned staff. Published to website, Google Calendar, and social media.</div></div>
            </div>
            <div className="callout" style={{ marginTop: 20 }}><strong>Event Planning Template (for each event):</strong> Name · Date & Time · Type (goodwill/holiday/house) · Capacity · Pricing model · Marketing window (days before) · Required staff · Setup/teardown notes · Post-event review date. Every event gets its own task card in the global calendar 60 days before the event date.</div>
          </Section>

          {/* ══ SECTION 6: EMPLOYEE ══ */}
          <Section id="s6" number="06" title="Employee Information" desc="Onboarding, checklists, roles, hierarchy, and troubleshooting by role" {...sp}>
            <div className="leaf-grid">
              <div className="leaf-card"><div className="leaf-num">6.1</div><div className="leaf-title">Onboarding</div><div className="leaf-detail">Day 1 checklist: paperwork, uniform, system access, tour, role intro. Day 7 check-in. Day 30 evaluation. All onboarding material stored in system and assigned via role calendar.</div></div>
              <div className="leaf-card"><div className="leaf-num">6.2</div><div className="leaf-title">Role Checklists</div><div className="leaf-detail">Every role (server, bartender, line cook, host, dishwasher, manager) has a daily open/close checklist. Checklists are tied to the role's calendar view. Completion is logged.</div></div>
              <div className="leaf-card"><div className="leaf-num">6.3</div><div className="leaf-title">Roles & Descriptions</div><div className="leaf-detail">Full job descriptions for every role: responsibilities, hours, comp range, reporting line, and performance criteria. Updated annually.</div></div>
              <div className="leaf-card"><div className="leaf-num">6.4</div><div className="leaf-title">Troubleshooting by Role</div><div className="leaf-detail">A living FAQ per role: "POS won't accept card → [steps]", "Walk-in temperature alarm → [steps]", "Guest complaint escalation → [steps]". Built from real incidents over time.</div></div>
              <div className="leaf-card"><div className="leaf-num">6.5</div><div className="leaf-title">Hierarchy & Chain of Command</div><div className="leaf-detail">Owner → Lead Manager (on-shift) → BOH Manager / FOH Manager → Senior Staff → Staff. Clear escalation path for every type of issue. Cross-domain conflicts go to the Lead Manager; issues beyond their authority escalate to the owner. Org chart maintained in system and distributed to all staff at onboarding.</div></div>
            </div>
          </Section>

          {/* ══ SECTION 7: OWNER ══ */}
          <Section id="s7" number="07" title="Owner Responsibilities" desc="The non-delegatable core — strategy, vision, and final accountability" {...sp}>
            <div className="desc-block">As the business matures through the automation phases, the owner's role evolves from operator to strategist. However, there is a permanent core of responsibilities that cannot and should not be delegated — legal accountability, major financial decisions, culture-setting, and the overall health of the flywheel.</div>
            <div className="timeframe-grid">
              <div className="timeframe-card"><div className="timeframe-label">Daily</div><div className="timeframe-desc">Review dashboard, approve major spending, handle escalations, culture check-in</div></div>
              <div className="timeframe-card"><div className="timeframe-label">Weekly</div><div className="timeframe-desc">P&L snapshot, staff pulse check, review social performance, sign off on payroll</div></div>
              <div className="timeframe-card"><div className="timeframe-label">Monthly</div><div className="timeframe-desc">Full financial review, supplier relationships, GM 1:1, strategic update</div></div>
              <div className="timeframe-card"><div className="timeframe-label">Quarterly</div><div className="timeframe-desc">All-hands meeting, system review, goal re-setting, capital planning</div></div>
              <div className="timeframe-card"><div className="timeframe-label">Annual</div><div className="timeframe-desc">Full business strategy, leases/insurance, bank relationships, CPA, permits, 12-month roadmap</div></div>
            </div>
            <div className="callout"><strong>The owner's primary job in Phase 4 is:</strong> review the system, remove friction, and identify the next flywheel to activate. The measure of success is not how many hours the owner spends in the building — it is whether the restaurant runs well in their absence. Weekly reports, monthly P&L, quarterly audits, and cameras are the remote nervous system that make this possible without a GM.</div>
          </Section>

          {/* ══ SECTION 8: CALENDAR ══ */}
          <Section id="s8" number="08" title="Calendar Systems" desc="Role-based calendars, audit calendars, and the master scheduling infrastructure" {...sp}>
            <div className="desc-block">The calendar system is the operating system of the business. There are three distinct calendar layers: the Global Calendar (all tasks, all departments), Role Calendars (filtered to each staff member's responsibilities), and the Compliance/Audit Calendar (regulatory, municipal, and recurring business obligations).</div>

            <Subsection id="s8-1" num="8.1" title="Calendar by Roles" notes={notes} corrections={corrections} onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}>
              <div className="desc-block">Every staff member logs into their account and sees only the calendar view for their assigned roles. A server sees: shift tasks, table prep, sidework checklists, and any assigned training or review. A chef sees: prep schedules, food cost review dates, ordering deadlines, and menu review dates. A GM sees: their own tasks plus a summary view of all department calendars.</div>
              <table className="data-table">
                <thead><tr><th>Role</th><th>Calendar Contents</th><th>View Scope</th></tr></thead>
                <tbody>
                  <tr><td>Owner</td><td>All departments + financial + compliance + strategic</td><td>Global + All</td></tr>
                  <tr><td>Lead Manager (on-shift designation)</td><td>Full ops, HR, events, financial summary, compliance, incident log, weekly report</td><td>Multi-dept</td></tr>
                  <tr><td>BOH Manager / Chef</td><td>Food cost, prep schedules, ordering, menu review, health inspections, kitchen scheduling</td><td>Food + Maintenance</td></tr>
                  <tr><td>FOH Manager / Floor Lead</td><td>Shift checklists, event prep, FOH schedule, review cycle, reservation management</td><td>Ops + Events + HR (FOH)</td></tr>
                  <tr><td>Servers / Bartenders</td><td>Shift open/close checklists, training tasks, review dates</td><td>Own role only</td></tr>
                  <tr><td>Social Media Manager</td><td>Content calendar, event promotion deadlines, review response reminders</td><td>Social dept only</td></tr>
                </tbody>
              </table>
            </Subsection>

            <Subsection id="s8-2" num="8.2" title="Compliance, Audit & Municipal Calendar" notes={notes} corrections={corrections} onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}>
              <div className="desc-block">The most dangerous calendar is the one no one looks at — until the health department shows up unannounced or a liquor license lapses. This calendar is always-on, visible to the owner and GM, and sends automated reminders 60 days, 30 days, and 7 days before any compliance deadline.</div>
              <table className="data-table">
                <thead><tr><th>Item</th><th>Frequency</th><th>Lead Time</th><th>Owner</th></tr></thead>
                <tbody>
                  <tr><td>Liquor License Renewal</td><td>Annual</td><td>90 days</td><td>Owner</td></tr>
                  <tr><td>Health Dept. Inspection Prep</td><td>Semi-annual (min)</td><td>Ongoing</td><td>BOH Manager + Lead Manager</td></tr>
                  <tr><td>Food Handler Certifications</td><td>Per staff, biannual</td><td>30 days before expiry</td><td>BOH Manager</td></tr>
                  <tr><td>Fire Suppression Inspection</td><td>Biannual</td><td>30 days</td><td>Lead Manager</td></tr>
                  <tr><td>Sales Tax Filing</td><td>Monthly</td><td>5 days</td><td>Accountant</td></tr>
                  <tr><td>Estimated Tax Payments</td><td>Quarterly</td><td>14 days</td><td>Owner + CPA</td></tr>
                  <tr><td>Business Insurance Renewal</td><td>Annual</td><td>60 days</td><td>Owner</td></tr>
                  <tr><td>OSHA / Workplace Compliance</td><td>Annual review</td><td>30 days</td><td>Lead Manager</td></tr>
                  <tr><td>Generator Inspection (if applicable)</td><td>Annual</td><td>30 days</td><td>GM</td></tr>
                  <tr><td>Annual System Architecture Review</td><td>Annual (this document)</td><td>30 days</td><td>Owner</td></tr>
                </tbody>
              </table>
            </Subsection>
          </Section>

          {/* ══ SECTION 9: FOOD ══ */}
          <Section id="s9" number="09" title="Food" desc="Menus, prep standards, recipes, kids offerings, and quality review" {...sp}>
            <div className="desc-block">The food system is the heart of the brand. Everything else in this document exists to serve a great dining experience. The food system documents not just what is served, but how it is sourced, prepared, presented, and reviewed. It also covers the physical menu — its design, binding, and version control.</div>

            <Subsection id="s9-1" num="9.1" title="Menu — Summer & Winter" notes={notes} corrections={corrections} onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}>
              <div className="desc-block">Two primary menu versions: Summer (lighter, seafood-forward, Cape Cod seasonal) and Winter (heartier, Italian-focused, comfort-driven). Each menu is reviewed 30 days before the seasonal transition. Version controlled — each menu has a release date and a retirement date. All staff are briefed on new items 1 week before launch.</div>
              <div className="leaf-grid">
                <div className="leaf-card"><div className="leaf-num">9.1.1</div><div className="leaf-title">Menu Bindings & Printing</div><div className="leaf-detail">Document preferred vendor, binding style (linen/leather/acrylic), unit price, order lead time, and minimum order quantity. Updated when menu changes.</div></div>
                <div className="leaf-card"><div className="leaf-num">9.1.2</div><div className="leaf-title">Quality Review</div><div className="leaf-detail">Monthly menu quality review: taste test of rotating items, guest feedback analysis, item performance (sales mix), and 86'd item frequency. Remove low performers quarterly.</div></div>
                <div className="leaf-card"><div className="leaf-num">9.1.3</div><div className="leaf-title">Kids Menu</div><div className="leaf-detail">Dedicated kids menu: simple, familiar, lower price point. Reviewed seasonally. Includes pasta, pizza, chicken, and simple sides. Presented with kids' coloring activity.</div></div>
                <div className="leaf-card"><div className="leaf-num">9.1.4</div><div className="leaf-title">Kids Coloring Sheets</div><div className="leaf-detail">Branded coloring sheets with the restaurant's characters or Cape Cod / Italian tavern theme. Reprinted seasonally. Doubles as a brand touchpoint and social media shareable moment.</div></div>
              </div>
            </Subsection>

            <Subsection id="s9-2" num="9.2 – 9.3" title="Prep Standards & Recipe Documentation" notes={notes} corrections={corrections} onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}>
              <div className="desc-block"><strong style={{ color: 'var(--text-main)' }}>9.2 How All Items Are Prepped</strong> — Every mise en place task for every item is documented by prep station. Line cooks follow prep lists generated from expected cover counts. Prep levels, storage labels, shelf-life rules, and par levels are all documented. Reviewed when items change or during the quality review cycle.</div>
              <div className="desc-block"><strong style={{ color: 'var(--text-main)' }}>9.3 How Everything Is Made</strong> — Recipe cards for every item, written in step-by-step format with photos where possible. Stored in the system under the Food department. Accessible to kitchen staff only. These are the ground truth — no improvisation without owner or chef sign-off. Recipe cards are the single most important tool for consistency across shifts and staff turnover.</div>
              <div className="callout"><strong>Key rule:</strong> If it's on the menu and it isn't in the recipe system, it doesn't exist. Every item must have a written recipe, a costed recipe card (Section 2.4), and a prep note before it can be added to the menu.</div>
            </Subsection>
          </Section>

          {/* ══ SECTION 10: BRANDING ══ */}
          <Section id="s10" number="10" title="Branding" desc="Visual identity, physical space, digital presence, and the feeling of Laurino's" {...sp}>
            <div className="desc-block">The brand is a promise. It is everything a guest experiences from the moment they see a social media post to the moment they walk out the door. Branding is not just the logo — it is the light level, the music volume, the font on the menu, the color of the walls, and the way a server greets a table.</div>
            <div className="leaf-grid">
              <div className="leaf-card"><div className="leaf-num">10.1</div><div className="leaf-title">Colors, Design & Feel</div><div className="leaf-detail">Brand color palette, typography standards, logo usage guidelines, photography style guide, and the "feel" descriptor: warm, rustic, Italian coastal, Cape Cod charm. All documented in a brand guide.</div></div>
              <div className="leaf-card"><div className="leaf-num">10.2</div><div className="leaf-title">Online Presence Matching</div><div className="leaf-detail">Website, Google Business, all social profiles, DoorDash/Uber Eats listings, Yelp — all use the same photos, language, and tone. Audited quarterly for consistency.</div></div>
              <div className="leaf-card"><div className="leaf-num">10.3</div><div className="leaf-title">Interior Space</div><div className="leaf-detail">Lighting, table settings, wall art, background music playlist (documented and curated), signage, and seasonal decoration standards. Reviewed biannually with owner walkthrough.</div></div>
              <div className="leaf-card"><div className="leaf-num">10.4</div><div className="leaf-title">Exterior Space</div><div className="leaf-detail">Curb appeal standards: signage, planters, outdoor dining setup, pergola bar aesthetic (tile, post wraps), ice cream window visual, ice rink branding in winter. First impression documentation.</div></div>
            </div>
            <div className="callout"><strong>Brand audit frequency:</strong> Full brand review happens once per year (January) and at every major renovation or expansion. Minor updates (photo refresh, copy updates) happen quarterly.</div>
          </Section>

          {/* ══ SECTION 11: HIRING & FIRING ══ */}
          <Section id="s11" number="11" title="Hiring & Firing Protocols" desc="Recruitment, onboarding, disciplinary action, and offboarding" {...sp}>
            <div className="desc-block">People are the most important input in a restaurant. A clear, fair, and documented hiring and firing process protects the business legally, maintains a consistent culture, and ensures that the right people are in the right roles. No employment action should ever happen without documentation.</div>

            <Subsection id="s11-1" num="11.1" title="Disciplinary Action Protocol" notes={notes} corrections={corrections} onAddNote={openNoteModal} onAddCorrection={openCorrectionModal}>
              <table className="data-table">
                <thead><tr><th>Step</th><th>Action</th><th>Documentation Required</th><th>Sign-off</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>Verbal Warning</td><td>Notes logged in system with date and issue</td><td>BOH or FOH Manager</td></tr>
                  <tr><td>2</td><td>Written Warning</td><td>Formal write-up signed by staff member and issuing manager</td><td>Lead Manager + Owner notified</td></tr>
                  <tr><td>3</td><td>Final Warning / PIP</td><td>Performance Improvement Plan with 30-day timeline and goals</td><td>Owner + Lead Manager</td></tr>
                  <tr><td>4</td><td>Termination</td><td>Termination letter, exit checklist, final paycheck processing</td><td>Owner</td></tr>
                </tbody>
              </table>
              <div className="callout"><strong>Zero-tolerance offenses</strong> (immediate termination, no warning steps required): theft, assault, harassment, intoxication on duty, or deliberate sabotage of food/property. Always consult with an employment attorney before any termination. Document everything.</div>
            </Subsection>

            <div className="tag-list">
              <span className="tag">Job Postings (Indeed / Craigslist / Local)</span><span className="tag">Interview Scorecard by Role</span><span className="tag">Background Check Protocol</span><span className="tag">Reference Check Template</span><span className="tag">Offer Letter Template</span><span className="tag">I-9 & W-4 Processing</span><span className="tag">Employee Handbook</span>
            </div>
          </Section>

          {/* ══ SECTION 12: CHECKLISTS ══ */}
          <Section id="s12" number="12" title="Checklists & Reviews Per Role" desc="The operational backbone — documented procedures for every role at every interval" {...sp}>
            <div className="desc-block">Checklists are not bureaucracy — they are the single most effective tool for maintaining quality and consistency across shifts, seasons, and staff changes. Every role has a set of checklists that are reviewed, completed, and logged. Incomplete checklists are an automatic flag for the GM.</div>
            <div className="callout"><strong>Checklist types by role:</strong> Opening · Mid-shift · Closing · Weekly · Monthly. Each checklist is a task in the role's calendar view. Completion is logged with a timestamp and staff name. Exception reports (items not completed) are visible to the Lead Manager and owner in the global calendar.</div>
            <table className="data-table">
              <thead><tr><th>Role</th><th>Checklist Types</th><th>Review Frequency</th></tr></thead>
              <tbody>
                <tr><td>Line Cook</td><td>Prep list, line setup, temp checks, close-down, cleanliness</td><td>Daily (every shift)</td></tr>
                <tr><td>Server</td><td>Section setup, sidework, closing duties, daily specials briefing</td><td>Daily (every shift)</td></tr>
                <tr><td>Bartender</td><td>Bar setup, inventory count, garnish prep, close-down, glass audit</td><td>Daily (every shift)</td></tr>
                <tr><td>Host</td><td>Reservation check, floor plan, wait list management, seating log</td><td>Daily</td></tr>
                <tr><td>Dishwasher</td><td>Machine chemical levels, rack rotation, cleanliness, end-of-shift drain</td><td>Daily (every shift)</td></tr>
                <tr><td>BOH Manager</td><td>Temp logs, receiving inspection, food cost, prep levels, waste log, kitchen close</td><td>Daily + Weekly</td></tr>
                <tr><td>FOH Manager</td><td>FOH open/close, cash drawer, staff sign-in, floor plan, incident log</td><td>Daily + Weekly</td></tr>
                <tr><td>Lead Manager (on-shift)</td><td>Full building sign-off, weekly report, incident review, cross-dept coordination</td><td>Daily when Lead + Weekly</td></tr>
              </tbody>
            </table>
          </Section>

          {/* ══ SECTION 13: SECURITY ══ */}
          <Section id="s13" number="13" title="Security" desc="Cameras, fire alarm systems, and physical security infrastructure" {...sp}>
            <div className="desc-block">Security is both physical protection and liability management. A documented, maintained security system protects the staff, the guests, the inventory, and the owner. All security systems must be tested on schedule, footage must be retained per local requirements, and the alarm vendor must be on file.</div>
            <div className="leaf-grid">
              <div className="leaf-card"><div className="leaf-num">13.1</div><div className="leaf-title">Camera System</div><div className="leaf-detail">Document camera locations (interior: POS areas, bar, walk-in; exterior: parking, entrance, patio). Retention period (min 30 days). Cloud vs. local storage decision. Access: owner (full, remote), Lead Manager (full, on-shift), BOH/FOH managers (own domain cameras). Quarterly test of all cameras documented in compliance calendar.</div></div>
              <div className="leaf-card"><div className="leaf-num">13.2</div><div className="leaf-title">Fire Alarm System</div><div className="leaf-detail">System vendor, last inspection date, next inspection due (biannual minimum), sprinkler status, suppression system under hood, staff training on evacuation procedure. All documented and tied to compliance calendar (Section 8.2).</div></div>
            </div>
            <div className="callout"><strong>Additional security considerations:</strong> Safe combination access log (owner only) · Key holder list (max 3 people) · Alarm code rotation quarterly · Incident report protocol · Cash handling rules (drop safe, dual-witness) · Background checks for all key holders.</div>
          </Section>

          {/* ══ SECTION 14: NOTES & REVIEW ══ */}
          <Section id="s14" number="14" title="Notes, Modifications & Regular Review" desc="The living layer — how this document evolves and improves over time" {...sp}>
            <div className="desc-block">This document is not a monument. It is a living system. Every section should be treated as a hypothesis — reviewed against real-world performance and updated when the evidence demands it. The only way to keep this document useful is to schedule regular reviews and take notes on what is working and what is not.</div>
            <div className="callout"><strong>Review philosophy:</strong> Fast failures, documented. Slow wins, scaled. Anything that isn't tracked doesn't exist. The goal is a compounding system — each review cycle makes the next one easier because the system gets smarter.</div>
            <div className="timeframe-grid">
              <div className="timeframe-card"><div className="timeframe-label">Weekly</div><div className="timeframe-desc">Lead Manager notes on what broke, what worked, what guests said. Sent to owner Monday AM.</div></div>
              <div className="timeframe-card"><div className="timeframe-label">Monthly</div><div className="timeframe-desc">Owner reviews notes, identifies patterns, flags sections for update.</div></div>
              <div className="timeframe-card"><div className="timeframe-label">Quarterly</div><div className="timeframe-desc">Full department review with both managers + owner. Update checklists, roles, and protocols.</div></div>
              <div className="timeframe-card"><div className="timeframe-label">Semi-Annual</div><div className="timeframe-desc">Strategic review of all 13 revenue engines, brand audit, team structure.</div></div>
              <div className="timeframe-card"><div className="timeframe-label">Annual</div><div className="timeframe-desc">Full document review and version update. This document gets a new version number every January.</div></div>
            </div>
            <div className="desc-block" style={{ marginTop: 20, fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-dim)', paddingTop: 20 }}>
              Document Version: 1.0 · Initiated: 2026 · Next Full Review: January 2027 · Owner: Laurino's Tavern / Founder<br />
              All subsystem specifications, staffing numbers, vendor details, and financial targets are to be populated during Phase 1 scaffolding.
            </div>
          </Section>

          {/* ══ CUSTOM SECTIONS FROM DB ══ */}
          {customSections.map(cs => (
            <Section key={cs.id} id={cs.section_id} number={cs.number} title={cs.title} desc={cs.description} {...sp}>
              {cs.content && <div className="desc-block">{cs.content}</div>}
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Added by {cs.author_name}
              </div>
            </Section>
          ))}

          {/* ADD SECTION BUTTON */}
          <button className="add-section-btn" onClick={() => setSectionModal(true)}>
            + Add Section
          </button>

          {/* README PANEL */}
          <ReadmePanel />

        </div>{/* /content */}
      </div>{/* /main */}

      {/* ─── MODALS ─── */}
      {noteModal && (
        <NoteModal
          sectionId={noteModal.sectionId}
          subsectionId={noteModal.subsectionId}
          onClose={() => setNoteModal(null)}
          onSubmit={handleAddNote}
        />
      )}
      {correctionModal && (
        <CorrectionModal
          sectionId={correctionModal.sectionId}
          subsectionId={correctionModal.subsectionId}
          onClose={() => setCorrectionModal(null)}
          onSubmit={handleAddCorrection}
        />
      )}
      {subsectionModal && (
        <AddSubsectionModal
          sectionId={subsectionModal}
          onClose={() => setSubsectionModal(null)}
          onSubmit={handleAddSubsection}
        />
      )}
      {sectionModal && (
        <AddSectionModal
          onClose={() => setSectionModal(false)}
          onSubmit={handleAddSection}
        />
      )}
      {exportModal && (
        <ExportModal
          onClose={() => setExportModal(false)}
          onExport={handleExport}
        />
      )}
    </>
  );
}
