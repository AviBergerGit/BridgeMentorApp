import React from 'react';
import { QUESTIONS, TOPICS, GROUPS, topicOf, groupedIds, qsOfGroup, qsOf } from '../data/index.jsx';
import { SummaryCards } from '../components/SummaryCards.jsx';

export default function StatsScreen({ c }) {
  const { stats, users, current, enabled, setScreen } = c;
  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("home")}>→</span><h1>{"הסטטיסטיקה של " + current}</h1></div></div>
        <div className="content">
          <p className="settings-note">הסטטיסטיקה כוללת את כל הנושאים, גם נושאים שאינם מאופשרים לתרגול. שינוי הבחירה אינו מוחק תשובות.</p>
          <SummaryCards stats={stats} total={QUESTIONS.length}/>
          {[...GROUPS.map(g => ({ g, list: g.topics.map(topicOf) })), ...TOPICS.filter(t => !groupedIds.includes(t.id)).map(t => ({ g: null, list: [t] }))].map((blk, bi) => {
            const row = (t, key) => {
              const qs = qsOf(t.id);
              const done = qs.filter(x => stats.answered[x.id]).length;
              const ok = qs.filter(x => stats.answered[x.id] && stats.answered[x.id].correct).length;
              return (
                <div className="bar-row" key={key}>
                  <div className="ttl"><span className="ico">{t.icon}</span><span className="tn">{t.name}{!enabled(t.id) && <small className="inactive-label">לא מאופשר לתרגול</small>}</span></div>
                  <div className="meter"><div className="bar"><div style={{width: Math.round(100 * done / qs.length) + "%"}}></div></div><span className="cnt">{done}/{qs.length} נענו · {ok} נכון</span></div>
                </div>
              );
            };
            if (!blk.g) return row(blk.list[0], "o" + bi);
            const gq = qsOfGroup(blk.g);
            const gd = gq.filter(x => stats.answered[x.id]).length;
            const gk = gq.filter(x => stats.answered[x.id] && stats.answered[x.id].correct).length;
            return (
              <div key={blk.g.id}>
                <div className="gtitle"><span>{blk.g.icon} {blk.g.name}</span><span className="cnt">{gd}/{gq.length} נענו · {gk} נכון</span></div>
                {blk.list.map(t => row(t, t.id))}
              </div>
            );
          })}
          {Object.keys(users).length > 1 && <div className="card">
            <h2>כל השמות במכשיר</h2>
            {Object.entries(users).map(([n, u]) => {
              const a = Object.keys(u.answered || {}).length;
              const c = Object.values(u.answered || {}).filter(x => x.correct).length;
              return <div className="setrow" key={n}><span>{n}</span><span className="setval">{a}/{QUESTIONS.length} נענו · {c} נכון</span></div>;
            })}
          </div>}
        </div>
      </>
  );
}
