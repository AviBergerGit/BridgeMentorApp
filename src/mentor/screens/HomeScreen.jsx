import React from 'react';
import { VERSION } from '../config.js';

export default function HomeScreen({ c }) {
  const { stats, current, setScreen, setGrp } = c;
  return (
      <>
        <div className="header"><h1>♠♥♦♣ BRIDGE-MENTOR</h1><div className="sub">המאמן האישי שלך לברידג' · שיטת SAYC</div></div>
        <div className="content">
          <button className="chip" onClick={() => setScreen("players")}>✏️ {current} · החלפת שם</button>
          {(() => {
            const st = c.sync || { status: "synced" };
            const failed = !(c.storageStatus === "saved" || c.storageStatus === "saving");
            const base = {fontSize:14, fontWeight:600, textAlign:"center", margin:"4px auto 14px", padding:"7px 14px", borderRadius:999, maxWidth:320, lineHeight:1.45};
            if (failed) return <div style={{...base, color:"#b34434", background:"#f9e4e0"}}>⚠ ההתקדמות לא נשמרה במכשיר - נסו שוב</div>;
            if (st.status === "syncing") return <div style={{...base, color:"#8a6d1a", background:"#f7efd8"}}>מסנכרן…</div>;
            if (st.status === "offline") return <div style={{...base, color:"#b34434", background:"#f9e4e0"}}>⚠ אין חיבור - ההתקדמות נשמרת במכשיר ותסתנכרן כשהחיבור יחזור</div>;
            return <div style={{...base, color:"#3a7d44", background:"#e3f1e4"}}>✓ ההתקדמות מסונכרנת בענן</div>;
          })()}
          <button className="bigbtn" onClick={() => { setGrp(null); setScreen("topics"); }}><span className="em">▶️</span><span>תרגול לפי נושא<small>נושאים ממוקדים ותקצירי תיאוריה</small></span></button>
          <button className="bigbtn" onClick={() => setScreen("stats")}><span className="em">📊</span><span>הסטטיסטיקה שלי<small>התקדמות לפי נושאים</small></span></button>
          <button className="bigbtn" onClick={() => setScreen("settings")}><span className="em">⚙️</span><span>הגדרות<small>נושאי תרגול, גרסה ויצירת קשר</small></span></button>
        </div>
        <div className="foot">גרסה {VERSION} · Developed by Avi Berger</div>
      </>
  );
}
