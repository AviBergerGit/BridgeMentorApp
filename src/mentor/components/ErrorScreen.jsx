import React from 'react';
import { ReportIssue } from './ReportIssue.jsx';

export function ErrorScreen({onRetry, onHome}) {
  return (
    <div className="content">
      <div className="card center-card">
        <div className="err-emoji">⚠️</div>
        <div className="err-title">השאלה לא נטענה</div>
        <div className="expl">אירעה שגיאה טכנית. בדוק את החיבור ונסה שוב.</div>
        <button className="primary" onClick={onRetry}>נסה שוב</button>
        <button className="secondary" onClick={onHome}>חזרה לבחירת נושא</button>
        <ReportIssue/>
      </div>
    </div>
  );
}
