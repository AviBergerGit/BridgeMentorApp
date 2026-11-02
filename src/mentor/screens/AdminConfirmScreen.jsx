import React, { useState } from 'react';
import { adminDeleteUser } from '../lib/admin.js';

// Final confirmation before permanently deleting a user from the cloud.
export default function AdminConfirmScreen({ c }) {
  const { current, adminToken, adminTarget, setScreen } = c;
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selfBlocked, setSelfBlocked] = useState(false);
  const t = adminTarget || { name: "", answered: 0, correct: 0 };

  const del = async () => {
    if (busy || !adminToken) return;
    setBusy(true); setFailed(false);
    try {
      const r = await adminDeleteUser(adminToken, t.name, current);
      if (r.ok) { setScreen("admin-users"); return; }
      if (r.selfBlocked) { setSelfBlocked(true); setBusy(false); return; }
    } catch { /* fall through */ }
    setFailed(true); setBusy(false);
  };

  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("admin-users")}>→</span><h1>ניהול משתמשים</h1></div></div>
        <div className="content">
          <div className="card center-card">
            <div className="err-emoji">🗑</div>
            <div className="err-title">למחוק את {t.name}?</div>
            <div className="warnbox">
              {t.answered} שאלות שנענו, כל ההתקדמות וההגדרות של <b>{t.name}</b> יימחקו מהענן <b>לצמיתות</b>. אין אפשרות שחזור.
            </div>
            {failed && <div className="banner-bad" style={{fontSize:18}}>המחיקה נכשלה - בדקו את החיבור ונסו שוב</div>}
            {selfBlocked && <div className="banner-bad" style={{fontSize:18}}>לא ניתן למחוק את השם שבשימוש כרגע במכשיר זה</div>}
            <button className={"danger" + (busy ? " disabled" : "")} onClick={del}>מחיקה לצמיתות</button>
            <button className="secondary" onClick={() => setScreen("admin-users")}>ביטול</button>
          </div>
        </div>
      </>
  );
}
