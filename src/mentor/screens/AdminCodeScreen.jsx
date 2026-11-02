import React, { useState } from 'react';
import { adminSignIn, adminBootstrapPassword } from '../lib/admin.js';

// Admin entry: fixed admin password (no email), verified server-side with a
// 5-failure / 15-minute lockout - the only admin sign-in path. First-time
// enrollment happens once, gated by a one-time setup key (operator only).
// Regular practice stays name-only.
export default function AdminCodeScreen({ c }) {
  const { setScreen, setAdminToken } = c;
  const setupKey = c.adminSetupKey || null;
  const isSetup = !!setupKey || c.adminTestState === 'setup';
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(c.adminTestState && c.adminTestState !== 'idle' && c.adminTestState !== 'setup' ? c.adminTestState : null); // 'wrong' | 'locked' | 'offline'
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(4); // demo default for mockups
  const [lockMin, setLockMin] = useState(15);

  const submit = async () => {
    if (busy) return;
    if (isSetup ? pw.length < 10 || !setupKey : pw.length === 0) return;
    setBusy(true); setErr(null);
    try {
      if (isSetup) {
        const r = await adminBootstrapPassword(pw, setupKey);
        if (r.status === 'ok') {
          const s = await adminSignIn(pw);
          if (s.status === 'ok') { setAdminToken(s.token); setScreen("admin-users"); }
          else setErr('offline');
        } else if (r.status === 'too_short') setErr('short');
        else setErr('offline');
      } else {
        const r = await adminSignIn(pw);
        if (r.status === 'ok') { setAdminToken(r.token); setScreen("admin-users"); }
        else if (r.status === 'invalid') { setAttempts(r.attempts_left); setErr('wrong'); }
        else if (r.status === 'locked') { setLockMin(Math.max(1, Math.ceil((r.retry_after_seconds || 900) / 60))); setErr('locked'); }
        else setErr('offline');
      }
    } catch { setErr('offline'); }
    setBusy(false);
  };

  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("settings")}>→</span><h1>{isSetup ? "הגדרת מנהל" : "כניסת מנהל"}</h1></div></div>
        <div className="content">
          <div className="card">
            <h2>🔒 {isSetup ? "הגדרת סיסמת מנהל" : "כניסת מנהל"}</h2>
            {err === 'wrong' && <div className="banner-bad" style={{fontSize:18}}>סיסמה שגויה - {attempts === 1 ? "נותר ניסיון אחד" : `נותרו ${attempts} ניסיונות`}</div>}
            {err === 'locked' && <div className="banner-bad" style={{fontSize:18}}>יותר מדי ניסיונות שגויים - הכניסה נעולה. נסו שוב בעוד כ-{lockMin} דקות</div>}
            {err === 'offline' && <div className="banner-bad" style={{fontSize:18}}>אין חיבור לאינטרנט - לא ניתן לאמת כרגע. נסו שוב כשהחיבור יחזור</div>}
            {err === 'short' && <div className="banner-bad" style={{fontSize:18}}>הסיסמה קצרה מדי - לפחות 10 תווים</div>}
            <div className="expl" style={{fontSize:16}}>
              {isSetup
                ? <>בחרו סיסמת מנהל חזקה - לפחות 10 תווים, עדיף שילוב אותיות וספרות.<br/>שמרו אותה במקום בטוח; היא תשמש לניהול משתמשים בלבד.</>
                : "הזינו את סיסמת המנהל."}
            </div>
            <input className="codeinput" type="password" dir="ltr" placeholder="••••••••••" value={pw} onChange={e => setPw(e.target.value)} />
            <button className={"primary" + ((isSetup ? pw.length >= 10 && setupKey : pw.length > 0) && !busy ? "" : " disabled")} onClick={submit}>{isSetup ? "שמירת סיסמה" : "כניסה"}</button>
          </div>
          <div className="expl" style={{fontSize:13, textAlign:'center'}}>הסיסמה נדרשת רק לניהול משתמשים. התרגול הרגיל נשאר ללא סיסמה, לפי שם בלבד.<br/>לאחר 5 ניסיונות שגויים הכניסה ננעלת ל-15 דקות.</div>
        </div>
      </>
  );
}
