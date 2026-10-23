import React from 'react';
import { VERSION } from '../config.jsx';

export default function HomeScreen({ c }) {
  const { stats, current, setScreen, setGrp } = c;
  return (
      <>
        <div className="header"><h1>♠♥♦♣ BRIDGE-MENTOR</h1><div className="sub">המאמן האישי שלך לברידג' · שיטת SAYC</div></div>
        <div className="content">
          <button className="chip" onClick={() => setScreen("players")}>✏️ {current} · החלפת שם</button>
          <button className="bigbtn" onClick={() => { setGrp(null); setScreen("topics"); }}><span className="em">▶️</span><span>תרגול לפי נושא<small>נושאים ממוקדים ותקצירי תיאוריה</small></span></button>
          <button className="bigbtn" onClick={() => setScreen("stats")}><span className="em">📊</span><span>הסטטיסטיקה שלי<small>התקדמות לפי נושאים</small></span></button>
          <button className="bigbtn" onClick={() => setScreen("settings")}><span className="em">⚙️</span><span>הגדרות<small>נושאי תרגול, גרסה ויצירת קשר</small></span></button>
        </div>
        <div className="foot">גרסה {VERSION} · Developed by Avi Berger</div>
      </>
  );
}
