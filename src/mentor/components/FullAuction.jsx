import React from 'react';
import { Bid } from './Bid.jsx';

export function FullAuction({text, you}) {
  const calls = text.split(/\s+/).filter(Boolean).map(t => t.replace(/[()]/g, ""));
  const seats = ["מערב", "צפון", "מזרח", "דרום"];
  const rows = [];
  for (let i = 0; i < calls.length; i += 4) rows.push(calls.slice(i, i + 4));
  return (
    <div className="atab" dir="ltr">
      {seats.map(x => <div key={x} className={"ah" + (x === (you || "מזרח") ? " you" : "")} dir="rtl">{x}</div>)}
      {rows.map((r, ri) => [0, 1, 2, 3].map(ci => (
        <div key={ri + "-" + ci} className={"ac" + (seats[ci] === (you || "מזרח") ? " you" : "")}>{r[ci] ? <Bid b={r[ci]}/> : ""}</div>
      )))}
    </div>
  );
}
