import React from 'react';

export default function Sidebar({ profile, onSignOut, onExport, customSections, sidebarOpen, onCloseSidebar }) {
  function scrollTo(e, id) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (onCloseSidebar) onCloseSidebar();
  }

  return (
    <nav id="sidebar" className={sidebarOpen ? 'open' : ''}>
      <div className="sidebar-brand">
        <div className="restaurant-name">Laurino's Tavern</div>
        <div className="doc-label">System Architecture — Master Doc</div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-name">👤 {profile.full_name}</div>
        <div className={`sidebar-user-role ${profile.role}`}>{profile.role}</div>
        <button className="sidebar-signout" onClick={onSignOut}>Sign out</button>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-label">Overview</div>
        <a className="nav-item" href="#overview" onClick={e => scrollTo(e, 'overview')}><span className="nav-num">00</span> Vision & Flywheel</a>
        <a className="nav-item" href="#platform" onClick={e => scrollTo(e, 'platform')}><span className="nav-num">P</span> Platform & Daily Use</a>
        <a className="nav-item" href="#phases" onClick={e => scrollTo(e, 'phases')}><span className="nav-num">→</span> Automation Phases</a>
        <a className="nav-item sub" href="#phases" onClick={e => scrollTo(e, 'phases')}><span className="nav-num">P1.2</span> Mgmt Structure & Matrix</a>
        <a className="nav-item" href="#calendar-system" onClick={e => scrollTo(e, 'calendar-system')}><span className="nav-num">◈</span> Calendar System</a>
        <a className="nav-item" href="#access-control" onClick={e => scrollTo(e, 'access-control')}><span className="nav-num">⊕</span> Access Control</a>

        <div className="nav-section-label">Departments</div>
        <a className="nav-item" href="#s1" onClick={e => scrollTo(e, 's1')}><span className="nav-num">01</span> Accounting</a>
        <a className="nav-item" href="#s2" onClick={e => scrollTo(e, 's2')}><span className="nav-num">02</span> Financial Health</a>
        <a className="nav-item sub" href="#s2-1" onClick={e => scrollTo(e, 's2-1')}><span className="nav-num">2.1</span> Downward Spend</a>
        <a className="nav-item sub" href="#s2-2" onClick={e => scrollTo(e, 's2-2')}><span className="nav-num">2.2</span> Revenue Growth</a>
        <a className="nav-item sub" href="#s2-3" onClick={e => scrollTo(e, 's2-3')}><span className="nav-num">2.3–4</span> Accounting / Food Cost</a>
        <a className="nav-item" href="#s3" onClick={e => scrollTo(e, 's3')}><span className="nav-num">03</span> Social Media</a>
        <a className="nav-item" href="#s4" onClick={e => scrollTo(e, 's4')}><span className="nav-num">04</span> Maintenance</a>
        <a className="nav-item" href="#s5" onClick={e => scrollTo(e, 's5')}><span className="nav-num">05</span> Events</a>
        <a className="nav-item" href="#s6" onClick={e => scrollTo(e, 's6')}><span className="nav-num">06</span> Employee Info</a>
        <a className="nav-item" href="#s7" onClick={e => scrollTo(e, 's7')}><span className="nav-num">07</span> Owner Responsibilities</a>
        <a className="nav-item" href="#s8" onClick={e => scrollTo(e, 's8')}><span className="nav-num">08</span> Calendar</a>
        <a className="nav-item" href="#s9" onClick={e => scrollTo(e, 's9')}><span className="nav-num">09</span> Food</a>
        <a className="nav-item" href="#s10" onClick={e => scrollTo(e, 's10')}><span className="nav-num">10</span> Branding</a>
        <a className="nav-item" href="#s11" onClick={e => scrollTo(e, 's11')}><span className="nav-num">11</span> Hiring & Firing</a>
        <a className="nav-item" href="#s12" onClick={e => scrollTo(e, 's12')}><span className="nav-num">12</span> Checklists & Reviews</a>
        <a className="nav-item" href="#s13" onClick={e => scrollTo(e, 's13')}><span className="nav-num">13</span> Security</a>
        <a className="nav-item" href="#s14" onClick={e => scrollTo(e, 's14')}><span className="nav-num">14</span> Notes & Review Cycles</a>

        {customSections.map(cs => (
          <a key={cs.id} className="nav-item" href={`#${cs.section_id}`} onClick={e => scrollTo(e, cs.section_id)}>
            <span className="nav-num">{cs.number}</span> {cs.title}
          </a>
        ))}
      </div>

      <div className="sidebar-export">
        <button className="export-btn" onClick={onExport}>↓ Export Document</button>
      </div>
    </nav>
  );
}
