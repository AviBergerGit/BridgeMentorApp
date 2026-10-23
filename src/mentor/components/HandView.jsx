import React from 'react';
import { spaced } from '../lib/helpers.jsx';

export function HandView({hand, hcp, tail, partial}) {
  const rows = [["♠","s",false],["♥","h",true],["♦","d",true],["♣","c",false]];
  const shown = partial ? rows.filter(([sym,k]) => hand[k]) : rows;
  return (
    <div className="hand" dir="ltr">
      {shown.map(([sym,k,red]) => <div key={k}><span className={"suit" + (red ? " red" : "")}>{sym}</span> {spaced(hand[k] || "")}</div>)}
      {!partial && <div className="hcp" dir="rtl">{hcp} נק'{tail || ""}</div>}
    </div>
  );
}
