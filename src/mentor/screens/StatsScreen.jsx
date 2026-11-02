import React from 'react';
import { TOPICS, GROUPS, topicOf, groupedIds, qsOfGroup, qsOf } from '../data/index.js';
import { SummaryCards } from '../components/SummaryCards.jsx';

export default function StatsScreen({ c }) {
  const { stats, users, current, enabled, activeQuestions, setScreen, EmptyTopics } = c;
  const [open, setOpen] = React.useState({});
  const activeIds = new Set(activeQuestions.map(q => q.id));
  const activeAnswered = a => Object.fromEntries(Object.entries(a || {}).filter(([id]) => activeIds.has(id)));
  const ownAnswered = activeAnswered(stats.answered);
  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("home")}>→</span><h1>{"הסטטיסטיקה של " + current}</h1></div></div>
        <div className="content">
          <p className="settings-note">הסטטיסטיקה מוצגת רק עבור נושאים המאופשרים לתרגול. ביטול נושא אינו מוחק תשובות - ההתקדמות תחזור אם תפעיל אותו מחדש.</p>
          <p className="settings-note">לחיצה על נושא ראשי פותחת או סוגרת את הפירוט לפי תתי־הנושאים.</p>
          {activeQuestions.length === 0 ? <EmptyTopics/> : <>
          <SummaryCards stats={{ answered: ownAnswered, totalAnswers: 0, totalCorrect: 0 }} total={activeQuestions.length} hidePct/>
          {[...GROUPS.map(g => ({ g, list: g.topics.map(topicOf).filter(t => enabled(t.id)) })), ...TOPICS.filter(t => !groupedIds.includes(t.id) && enabled(t.id)).map(t => ({ g: null, list: [t] }))].filter(blk => blk.list.length > 0).map((blk, bi) => {
            const row = (t, key, main) => {
              const qs = qsOf(t.id);
              const done = qs.filter(x => stats.answered[x.id]).length;
              const ok = qs.filter(x => stats.answered[x.id] && stats.answered[x.id].correct).length;
              const wrong = done - ok;
              return (
                <div className={"bar-row" + (main ? " main" : "")} key={key}>
                  <div className="ttl"><span className="ico">{t.icon}</span><span className="tn">{t.name}</span></div>
                  <div className="meter"><div className="bar"><div style={{width: Math.round(100 * done / qs.length) + "%"}}></div></div><span className="cnt">{qs.length} שאלות · {ok} נכון · {wrong} לא נכון</span></div>
                </div>
              );
            };
            if (!blk.g) return row(blk.list[0], "o" + bi, true);
            const gq = qsOfGroup(blk.g).filter(x => enabled(x.topic));
            const gd = gq.filter(x => stats.answered[x.id]).length;
            const gk = gq.filter(x => stats.answered[x.id] && stats.answered[x.id].correct).length;
            const gw = gd - gk;
            return (
              <div key={blk.g.id}>
                <button type="button" className="bar-row grow main" aria-expanded={!!open[blk.g.id]} aria-controls={"stat-children-" + blk.g.id} aria-label={(open[blk.g.id] ? "הסתר פירוט: " : "הצג פירוט: ") + blk.g.name} onClick={() => setOpen({...open, [blk.g.id]: !open[blk.g.id]})}>
                  <div className="ttl"><span className="ico">{blk.g.icon}</span><span className="tn">{blk.g.name}</span><span className="chev" aria-hidden="true">{open[blk.g.id] ? "⌃" : "⌄"}</span></div>
                  <div className="meter"><div className="bar"><div style={{width: Math.round(100 * gd / gq.length) + "%"}}></div></div><span className="cnt">{gq.length} שאלות · {gk} נכון · {gw} לא נכון</span></div>
                </button>
                {open[blk.g.id] && <div className="stat-children" id={"stat-children-" + blk.g.id}>{blk.list.map(t => row(t, t.id, false))}</div>}
              </div>
            );
          })}
          </>}
          {Object.keys(users).length > 1 && <div className="card">
            <h2>כל השמות במכשיר</h2>
            {Object.entries(users).map(([n, u]) => {
              const ua = activeAnswered(u.answered);
              const a = Object.keys(ua).length;
              const cc = Object.values(ua).filter(x => x.correct).length;
              const ww = a - cc;
              return <div className="setrow" key={n}><span>{n}</span><span className="setval">{activeQuestions.length} שאלות · {cc} נכון · {ww} לא נכון</span></div>;
            })}
          </div>}
        </div>
      </>
  );
}
