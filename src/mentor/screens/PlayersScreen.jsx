import React from 'react';

export default function PlayersScreen({ c }) {
  const { users, current, selectUser, nameInput, setNameInput, setScreen } = c;
  return (
      <>
        <div className="header"><div className="navbar">{current && <span className="back" onClick={() => setScreen("home")}>→</span>}<h1>מי מתרגל?</h1></div></div>
        <div className="content">
          {c.deletedNotice && <div className="admin-note">השם "{c.deletedNotice}" הוסר על ידי המנהל.</div>}
          <div className="card">
            <h2>שם חדש</h2>
            <input className="nameinput" value={nameInput} maxLength={20} placeholder="הקלד שם" onChange={e => setNameInput(e.target.value)} />
            <button className={"primary" + (nameInput.trim() ? "" : " disabled")} onClick={() => { if (nameInput.trim()){ selectUser(nameInput); setNameInput(""); if (c.clearDeletedNotice) c.clearDeletedNotice(); setScreen("home"); } }}>המשך</button>
          </div>
          {c.adminToken && Object.keys(users).length > 0 && <div className="card">
            <h2>שמות קיימים</h2>{/* local device-history list - admin session only (Avi, 2026-11-02): non-admins must not see other names */}
            {Object.keys(users).map(n => (
              <button key={n} className={"secondary" + (n === current ? " cur" : "")} onClick={() => { selectUser(n); if (c.clearDeletedNotice) c.clearDeletedNotice(); setScreen("home"); }}>{n}{n === current ? " ✓" : ""}</button>
            ))}
          </div>}
          <div className="expl" style={{fontSize:13}}>ההתקדמות נשמרת בענן לפי שם, וזמינה מכל מכשיר.</div>
        </div>
      </>
  );
}
