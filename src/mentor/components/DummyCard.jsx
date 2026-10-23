import React from 'react';
import { spaced } from '../lib/helpers.jsx';
import { HandView } from './HandView.jsx';
import { TokenText } from './TokenText.jsx';

export function DummyCard({q}) {
  if (q.dummy) {
    const def = q.topic === "t52";
    return (
      <div className="card">
        <h2 className="dummytitle">הדמה ({q.dseat})<span className="tag">{def ? "גלויה לעיניך" : "יורדת אחרי ההובלה"}</span></h2>
        <HandView hand={q.dummy} hcp={q.dhcp} tail={" · " + (def ? q.dseat : "השותף")}/>
      </div>
    );
  }
  if (q.dummyfrag) {
    const red = q.fragSuit === "♥" || q.fragSuit === "♦";
    return (
      <div className="card">
        <h2 className="dummytitle">הדומם ({q.fragSuitName} בלבד)<span className="tag">מיקום חלקי</span></h2>
        <div className="fragline"><div className="hand" dir="ltr"><div><span className={"suit" + (red ? " red" : "")}>{q.fragSuit}</span> {spaced(q.dummyfrag)}</div></div></div>
        {q.playhist && <div className="playhist" dir="rtl"><TokenText t={q.playhist}/></div>}
      </div>
    );
  }
  return null;
}
