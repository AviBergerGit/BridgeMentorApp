import React from 'react';
import { DEFENSE_TOPICS, DEFENSE_QUESTIONS } from '../data/g13-defense-nt-lead.js';
import { HandView } from '../components/HandView.jsx';
import { SegBar } from '../components/SegBar.jsx';
import { Bid } from '../components/Bid.jsx';
import { DefenseDiagram } from '../components/DefenseDiagram.jsx';
import { DEFENSE_DIAGRAMS } from '../data/defense-diagrams.js';
import { TokenText } from '../components/TokenText.jsx';
import { SEAT_ORDER } from '../lib/helpers.js';

// Defense questions store a hand as four display lines ("♠ Q 9 3"); adapt to the
// shared HandView shape ({s,h,d,c}, "10" as T) so defense hands use the same
// colored, spaced rendering as the competition branch. Cards are unchanged.
function defHand(lines){
  const key = {"♠":"s","♥":"h","♦":"d","♣":"c"};
  const h = {};
  for (const line of lines){
    const t = line.trim();
    h[key[t[0]]] = t.slice(1).trim().replace(/10/g,"T").replace(/\s+/g,"");
  }
  return h;
}

function topicOf(defTid){ return DEFENSE_TOPICS.find(t => t.id === defTid) || DEFENSE_TOPICS[0]; }

// Defense auctions are stored as explicit [seat, bid, note?] calls (seats grounded
// in the source string plus clockwise rotation; no calls invented). Rendered with
// the shared auction-table look (Bid chips, SEAT_ORDER columns) so the sequence is
// readable at a glance instead of a wrapping inline sentence.
function DefAuction({auction}){
  const idx = s => SEAT_ORDER.indexOf(s);
  const grid = [];
  let cur = [null, null, null, null];
  let prev = -1;
  for (const call of auction){
    const ci = idx(call[0]);
    if (ci <= prev){ grid.push(cur); cur = [null, null, null, null]; }
    cur[ci] = call; prev = ci;
  }
  grid.push(cur);
  // Per Avi: a skipped seat turn inside the auction's span shows P (an actual pass);
  // cells before the first or after the last shown call are outside the auction and stay empty.
  const flat = grid.flat();
  const first = flat.findIndex(c => c);
  const last = flat.length - 1 - [...flat].reverse().findIndex(c => c);
  return (
    <div style={{marginTop:12}}>
      <div className="ctx" style={{marginBottom:6}}>הכרזה:</div>
      <div className="atab" dir="ltr">
        {SEAT_ORDER.map(s => <div key={s} className="ah" dir="rtl">{s}</div>)}
        {grid.map((r, ri) => r.map((cell, ci) => {
          const fi = ri * 4 + ci;
          const inferred = !cell && fi > first && fi < last;
          return (
            <div key={ri + "-" + ci} className="ac">
              {cell ? <span className="acell"><Bid b={cell[1]}/>{cell[2] && <span className="an" dir="rtl">{cell[2]}</span>}</span> : inferred ? <Bid b="P"/> : ""}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

function stat(stats, tid) {
  const qs = tid ? DEFENSE_QUESTIONS.filter(x => x.topic === tid) : DEFENSE_QUESTIONS;
  const done = qs.filter(x => stats.answered[x.id]).length;
  const ok = qs.filter(x => stats.answered[x.id] && stats.answered[x.id].correct).length;
  return { done, ok, wrong: done - ok, total: qs.length };
}

export function DefenseHomeScreen({ c }) {
  const { stats, setScreen, startDefense, setDefTid } = c;
  const all = stat(stats, null);
  return (
    <>
      <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("home")}>→</span><h1>תירגול הגנה</h1></div></div>
      <div className="content">
        {DEFENSE_TOPICS.map(t => {
          const s = stat(stats, t.id);
          const p = s.total ? Math.round(100 * s.done / s.total) : 0;
          const openSummary = () => { setDefTid(t.id); setScreen("def-sum"); };
          return (
            <div key={t.id} className="topicrow trow" onClick={() => { if (s.total) startDefense(t.id); else openSummary(); }}>
              <span className="em">{t.icon}</span>
              <span className="name">{t.name}</span>
              <span className="tsub">{s.total} שאלות</span>
              <button className="tsum" onClick={e => { e.stopPropagation(); openSummary(); }}>תקציר</button>
              <span className="pct">{p}%</span>
              <div className="tmeter"><SegBar ok={s.ok} bad={s.wrong} total={s.total}/><span className="cnt">{s.ok} נכון · {s.wrong} לא נכון</span></div>
            </div>
          );
        })}
        <div className="topicrow" onClick={() => startDefense(null)}>
          <span className="em">🃏</span>
          <span className="name">כל שאלות ההגנה, בסדר אקראי<small className="tsub">{Math.min(10, all.total)} מתוך {all.total} שאלות</small></span>
        </div>
      </div>
    </>
  );
}

export function DefenseSummaryScreen({ c }) {
  const { stats, setScreen, startDefense, defTid } = c;
  const t = topicOf(defTid);
  const s = stat(stats, t.id);
  return (
    <>
      <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("defense")}>→</span><h1>סיכום נושא</h1></div></div>
      <div className="content">
        <div className="card"><h2>{t.icon} {t.name}</h2>
          {t.summary.map(([h, txt], i) => (
            <div className="sumitem" key={i}><div className="sumh">{h}</div>{txt ? <div className="expl">{txt}</div> : null}</div>
          ))}
        </div>
        <div className="statbig">
          <div className="statbox"><div className="n">{s.done}/{s.total}</div><div className="l">שאלות נענו</div></div>
          <div className="statbox"><div className="n">{s.ok}</div><div className="l">תשובות נכונות</div></div>
          <div className="statbox"><div className="n">{s.done ? Math.round(100 * s.ok / s.done) : 0}%</div><div className="l">אחוז הצלחה</div></div>
        </div>
        {s.total > 0 && <button className="primary" onClick={() => startDefense(t.id)}>תרגול הנושא</button>}
      </div>
    </>
  );
}

export function DefenseQuestionScreen({ c }) {
  const { setScreen, defOrder, defPos, defSel, setDefSel, defOptions, checkDefense, defTid } = c;
  const q = DEFENSE_QUESTIONS[defOrder[defPos]];
  const d = DEFENSE_DIAGRAMS[q.id] || (q.hand ? {} : null);
  const context = d && d.text !== undefined ? d.text : q.q;
  return (
    <>
      <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("defense")}>→</span><h1 className="tname">{defTid ? topicOf(defTid).name : "תירגול הגנה"}</h1><span className="counter">שאלה {defPos + 1} מתוך {defOrder.length}</span><button className="tsum" onClick={() => setScreen("def-sum")}>תקציר</button></div></div>
      <div className="content scroll">
        {(context || q.auction) && <div className="card">{context && <div className="def-context"><TokenText t={context}/></div>}{q.auction && <DefAuction auction={q.auction}/>}</div>}
        {d && <DefenseDiagram d={d} hand={q.hand ? defHand(q.hand) : null}/>}
        {d && d.ask && <div className="q"><TokenText t={d.ask}/></div>}
        <div>{defOptions.map(o => (
          <button key={o} className={"choicebtn" + (defSel === o ? " sel" : "")} onClick={() => setDefSel(o)}><TokenText t={o}/></button>
        ))}</div>
        <div className="selbar">
          <span>בחרת: {defSel || "-"}</span>
          <button className={"check" + (defSel ? "" : " disabled")} onClick={checkDefense}>בדיקה ✓</button>
        </div>
      </div>
    </>
  );
}

export function DefenseFeedbackScreen({ c }) {
  const { setScreen, defOrder, defPos, defFb, nextDefense, startDefense, defTid } = c;
  const q = DEFENSE_QUESTIONS[defOrder[defPos]];
  return (
    <>
      <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("defense")}>→</span><h1 className="tname">{defTid ? topicOf(defTid).name : "תירגול הגנה"}</h1><span className="counter">שאלה {defPos + 1} מתוך {defOrder.length}</span></div></div>
      <div className="content scroll">
        <div className={defFb.ok ? "banner-ok" : "banner-bad"}>{defFb.ok ? "נכון! ✔" : "לא נכון ✖"}</div>
        <div className="card">
          <div className="ansrow"><span>התשובה שלך:</span> {defFb.sel}</div>
          {!defFb.ok && <div className="ansrow"><span>התשובה הנכונה:</span> {q.answer}</div>}
          <h2>הסבר</h2>
          <div className="expl">{q.answer} · {q.expl}</div>
        </div>
        {defPos + 1 >= defOrder.length ? (
          <>
            <button className="primary" onClick={() => startDefense(defTid)}>סיבוב נוסף (סדר אקראי חדש)</button>
            <button className="secondary" onClick={nextDefense}>סיום הסיבוב</button>
          </>
        ) : (
          <button className="primary" onClick={nextDefense}>שאלה הבאה</button>
        )}
        <button className="secondary" onClick={() => setScreen("def-sum")}>תקציר הנושא</button>
      </div>
    </>
  );
}

export function DefenseDoneScreen({ c }) {
  const { stats, setScreen, startDefense, defTid } = c;
  const s = stat(stats, defTid);
  return (
    <>
      <div className="header"><h1>כל הכבוד! 🏆</h1><div className="sub">{s.done >= s.total ? 'סיימת את כל השאלות בנושא' : 'סיימת את הסיבוב - נשארו עוד שאלות בנושא'}</div></div>
      <div className="content">
        <div className="statbig">
          <div className="statbox"><div className="n">{s.done}/{s.total}</div><div className="l">שאלות נענו</div></div>
          <div className="statbox"><div className="n">{s.ok}</div><div className="l">תשובות נכונות</div></div>
          <div className="statbox"><div className="n">{s.done ? Math.round(100 * s.ok / s.done) : 0}%</div><div className="l">אחוז הצלחה</div></div>
        </div>
        <button className="primary" onClick={() => startDefense(defTid)}>סיבוב נוסף (סדר אקראי חדש)</button>
        <button className="secondary" onClick={() => setScreen("defense")}>חזרה לתירגול הגנה</button>
      </div>
    </>
  );
}
