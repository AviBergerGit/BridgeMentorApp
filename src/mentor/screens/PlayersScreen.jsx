import React from 'react';

export default function PlayersScreen({ c }) {
  const { users, current, selectUser, nameInput, setNameInput, setScreen } = c;
  return (
      <>
        <div className="header"><div className="navbar">{current && <span className="back" onClick={() => setScreen("home")}>→</span>}<h1>מי מתרגל?</h1></div></div>
        <div className="content">
          <div className="card">
            <h2>שם חדש</h2>
            <input className="nameinput" value={nameInput} maxLength={20} placeholder="הקלד שם" onChange={e => setNameInput(e.target.value)} />
            <button className={"primary" + (nameInput.trim() ? "" : " disabled")} onClick={() => { if (nameInput.trim()){ selectUser(nameInput); setNameInput(""); setScreen("home"); } }}>המשך</button>
          </div>
          {Object.keys(users).length > 0 && <div className="card">
            <h2>שמות קיימים</h2>
            {Object.keys(users).map(n => (
              <button key={n} className={"secondary" + (n === current ? " cur" : "")} onClick={() => { selectUser(n); setScreen("home"); }}>{n}{n === current ? " ✓" : ""}</button>
            ))}
          </div>}
          <div className="expl" style={{fontSize:13}}>הסטטיסטיקה נשמרת על המכשיר הזה, לפי שם.</div>
        </div>
      </>
  );
}
