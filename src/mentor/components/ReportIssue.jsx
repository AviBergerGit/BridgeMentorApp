import React, { useState } from 'react';
import { EMAIL, VERSION } from '../config.jsx';

export function ReportIssue({settings = false}) {
  const [showHelp, setShowHelp] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const mailto = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("BRIDGE-MENTOR: דיווח על בעיה") + "&body=" + encodeURIComponent("גרסה: " + VERSION + "\n\nתיאור הבעיה:\n");
  async function copyAddress() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(EMAIL);
      setCopyStatus("הכתובת הועתקה");
    } catch {
      setCopyStatus("לא ניתן להעתיק אוטומטית. אפשר לסמן ולהעתיק את הכתובת למעלה.");
    }
  }
  return <div>
    <a className={settings ? "setrow link" : "report"} href={mailto} target="_blank" rel="noopener noreferrer" onClick={() => setShowHelp(true)}>
      {settings ? <><span>דיווח על בעיה</span><span className="setval">✉</span></> : <>דיווח על בעיה: {EMAIL}</>}
    </a>
    {showHelp && <div className="report-help" role="region" aria-label="דיווח על בעיה">
      <p>אם אפליקציית המייל לא נפתחה, אפשר להעתיק את הכתובת ולפתוח הודעה חדשה במייל.</p>
      <input className="report-address" aria-label="כתובת לדיווח" readOnly value={EMAIL} dir="ltr" onFocus={e => e.target.select()} />
      <button className="secondary" onClick={copyAddress}>העתקת הכתובת</button>
      <a className="secondary report-retry" href={mailto} target="_blank" rel="noopener noreferrer">פתיחת הודעה במייל</a>
      <p className="report-status" role="status">{copyStatus}</p>
      <p className="report-note">השליחה מתבצעת רק מתוך אפליקציית המייל, לאחר בדיקת ההודעה.</p>
    </div>}
  </div>;
}
