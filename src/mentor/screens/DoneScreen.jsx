import React from 'react';
import { QUESTIONS } from '../data/index.jsx';
import { SummaryCards } from '../components/SummaryCards.jsx';

export default function DoneScreen({ c }) {
  const { stats, backList, startTopic } = c;
  return (
      <>
        <div className="header"><h1>כל הכבוד! 🏆</h1><div className="sub">סיימת את כל השאלות בנושא</div></div>
        <div className="content">
          <SummaryCards stats={stats} total={QUESTIONS.length}/>
          <button className="primary" onClick={() => startTopic()}>סיבוב נוסף (סדר אקראי חדש)</button>
          <button className="secondary" onClick={backList}>חזרה לבחירת נושא</button>
        </div>
      </>
  );
}
