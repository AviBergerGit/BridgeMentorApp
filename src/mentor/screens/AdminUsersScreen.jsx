import React, { useEffect, useState } from 'react';
import { listCloudUsers } from '../lib/admin.js';

// User management (admin only, after password sign-in). Deleting a name
// removes its cloud progress and settings permanently; the name currently in
// use on this device cannot be deleted from here.
export default function AdminUsersScreen({ c }) {
  const { current, adminToken, setScreen, setAdminTarget, setAdminToken } = c;
  const [rows, setRows] = useState(c.adminTestUsers || null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    listCloudUsers(adminToken).then(setRows).catch((e) => {
      if (e && e.status === 401) { setAdminToken(null); setScreen("admin-code"); return; } // session expired: sign in again
      setFailed(true);
    });
  };
  useEffect(() => {
    if (c.adminTestUsers) { setRows(c.adminTestUsers); return; }
    if (!adminToken) { setScreen("admin-code"); return; } // no verified admin session: back to the code gate
    load();
  }, []);

  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("settings")}>→</span><h1>ניהול משתמשים</h1></div></div>
        <div className="content">
          <div className="admin-note">מחיקה מסירה את השם, כל ההתקדמות וההגדרות מהענן - לצמיתות, ללא אפשרות שחזור.</div>
          {failed && <div className="banner-bad" style={{fontSize:18}}>לא ניתן לטעון את רשימת המשתמשים - בדקו את החיבור ונסו שוב</div>}
          {failed && <button className="secondary" onClick={load}>נסו שוב</button>}
          {!failed && !rows && <div className="expl" style={{textAlign:'center'}}>טוען…</div>}
          {rows && rows.length === 0 && <div className="expl" style={{textAlign:'center'}}>אין משתמשים בענן עדיין.</div>}
          {rows && rows.map(u => (
            <div className="userrow" key={u.name}>
              <span className="uname">{u.name}<span className="usub">{u.answered} שאלות נענו · {u.correct} נכון</span></span>
              {u.name === current
                ? <span className="me">מנהל</span>
                : <button className="del" onClick={() => { setAdminTarget(u); setScreen("admin-confirm"); }}>🗑 מחיקה</button>}
            </div>
          ))}
        </div>
      </>
  );
}
