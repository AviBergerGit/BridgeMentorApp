import React from 'react';
import { topicOf, qsOf } from '../data/index.jsx';
import { SummaryCards } from '../components/SummaryCards.jsx';

export default function SummaryScreen({ c }) {
  const { stats, backList, sumTid, startTopic } = c;
  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={backList}>→</span><h1>סיכום נושא</h1></div></div>
        <div className="content">
          <div className="card"><h2>{topicOf(sumTid).icon} {topicOf(sumTid).name}</h2>
            {topicOf(sumTid).summary.map(([h, t], i) => (
              <div className="sumitem" key={i}><div className="sumh">{h}</div><div className="expl">{t}</div></div>
            ))}
          </div>
          <SummaryCards stats={{ answered: Object.fromEntries(qsOf(sumTid).filter(x => stats.answered[x.id]).map(x => [x.id, stats.answered[x.id]])), totalAnswers: 0, totalCorrect: 0 }} total={qsOf(sumTid).length} hidePct/>
          <button className="primary" onClick={() => startTopic(sumTid)}>תרגול הנושא</button>
        </div>
      </>
  );
}
