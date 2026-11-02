import React from 'react';
import { qsOf, qsOfGroup, groupOf } from '../data/index.js';
import { SummaryCards } from '../components/SummaryCards.jsx';

export default function DoneScreen({ c }) {
  const { stats, activeQuestions, tid, backList, startTopic } = c;
  const scopeQs = tid ? (groupOf(tid) ? qsOfGroup(groupOf(tid)) : qsOf(tid)) : activeQuestions;
  const scopeIds = new Set(scopeQs.map(q => q.id));
  const answered = Object.fromEntries(Object.entries(stats.answered).filter(([id]) => scopeIds.has(id)));
  return (
      <>
        <div className="header"><h1>כל הכבוד! 🏆</h1><div className="sub">{Object.keys(answered).length >= scopeQs.length ? 'סיימת את כל השאלות בנושא' : 'סיימת את הסיבוב - נשארו עוד שאלות בנושא'}</div></div>
        <div className="content">
          <SummaryCards stats={{ answered, totalAnswers: 0, totalCorrect: 0 }} total={scopeQs.length} hidePct/>
          <button className="primary" onClick={() => startTopic()}>סיבוב נוסף (סדר אקראי חדש)</button>
          <button className="secondary" onClick={backList}>חזרה לבחירת נושא</button>
        </div>
      </>
  );
}
