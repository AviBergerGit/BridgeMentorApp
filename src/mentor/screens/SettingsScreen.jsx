import React from 'react';
import { EMAIL, VERSION } from '../config.jsx';
import { TOPICS } from '../data/index.jsx';
import { ReportIssue } from '../components/ReportIssue.jsx';

export default function SettingsScreen({ c }) {
  const { activeTopics, setScreen } = c;
  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("home")}>→</span><h1>הגדרות</h1></div></div>
        <div className="content">
          <div className="setrow link setlink" role="button" tabIndex={0} onClick={() => setScreen("topic-settings")} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setScreen("topic-settings"); } }}><span className="settop"><span className="settitle">הגדרות נושאים</span><span className="chev">‹</span></span><span className="setval setcount">{activeTopics.length} מתוך {TOPICS.length} מאופשרים</span><small className="setsub">בחירת נושאים ותתי־נושאים לתרגול</small></div>
          <div className="setrow"><span>שיטת הכרזות</span><span className="setval">SAYC</span></div>
          <div className="setrow"><span>גרסה</span><span className="setval">{VERSION}</span></div>
          <ReportIssue settings/>
          <div className="about">
            <div className="dev">Developed by Avi Berger</div>
            <div>{EMAIL}</div>
          </div>
        </div>
      </>
  );
}
