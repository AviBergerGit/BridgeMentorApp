import React from 'react';
import { spaced } from '../lib/helpers.js';
import { HandView } from './HandView.jsx';
import { TokenText } from './TokenText.jsx';

export function DummyCard({q, bare}) {
  // bare: render inside the hand card (single integrated table view), without
  // a separate card wrapper.
  const Wrap = bare ? React.Fragment : "div";
  const wrapProps = bare ? {} : { className: "card" };
  if (q.dummy) {
    const def = q.topic === "t52";
    return (
      <Wrap {...wrapProps}>
        <h2 className="dummytitle">{bare ? "הדמה" : `הדמה (${q.dseat})`}<span className="tag">{def ? "גלויה לעיניך" : "יורדת אחרי ההובלה"}</span></h2>
        <HandView hand={q.dummy} hcp={q.dhcp} tail={bare && def ? "" : " · " + (def ? q.dseat : "השותף")}/>
      </Wrap>
    );
  }
  if (q.dummyfrag) {
    const red = q.fragSuit === "♥" || q.fragSuit === "♦";
    return (
      <Wrap {...wrapProps}>
        <h2 className="dummytitle">{bare ? "הדומם" : `הדומם (${q.fragSuitName} בלבד)`}{!bare && <span className="tag">מיקום חלקי</span>}</h2>
        <div className="fragline"><div className="hand" dir="ltr"><div><span className={"suit" + (red ? " red" : "")}>{q.fragSuit}</span> {spaced(q.dummyfrag)}</div></div></div>
        {q.playhist && <div className="playhist" dir="rtl"><TokenText t={q.playhist}/></div>}
      </Wrap>
    );
  }
  return null;
}
