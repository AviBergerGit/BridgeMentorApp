import React from 'react';

export function SummaryCards({stats, total, hidePct}){
  const uniqueAnswered = Object.keys(stats.answered).length;
  const correctUnique = Object.values(stats.answered).filter(a => a.correct).length;
  const pct = stats.totalAnswers ? Math.round(100 * stats.totalCorrect / stats.totalAnswers) : 0;
  return (
    <div className="statbig">
      <div className="statbox"><div className="n">{uniqueAnswered}/{total}</div><div className="l">שאלות נענו</div></div>
      <div className="statbox"><div className="n">{correctUnique}</div><div className="l">תשובות נכונות</div></div>
      <div className="statbox"><div className="n">{hidePct ? (uniqueAnswered ? Math.round(100 * correctUnique / uniqueAnswered) : 0) : pct}%</div><div className="l">{hidePct ? "אחוז הצלחה" : "אחוז הצלחה בכל הניסיונות"}</div></div>
    </div>
  );
}
