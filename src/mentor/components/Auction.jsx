import React from 'react';
import { Bid } from './Bid.jsx';
import { SEAT_ORDER, OPPOSITE } from '../lib/helpers.js';

// Map auction calls to compass seats when the exercise data carries them:
// seat names stay, "אתה" maps to the known player seat, and "שותף" maps to
// the partner seat opposite it. Rivals are mapped only between known seats.
export function toSeats(auction, you) {
  if (!auction.length || !you) return null;
  const partner = OPPOSITE[you];
  const mapped = auction.map(([who, bid]) =>
    [who === "אתה" ? you : who === "שותף" ? partner : who, bid]);
  // A rival between two known opposite seats has exactly one seat in the
  // clockwise auction order. Do not infer rivals in unanchored stretches.
  for (let i = 0; i < mapped.length; i++) {
    if (mapped[i][0] !== "יריב") continue;
    const before = i > 0 ? mapped[i - 1][0] : null;
    const after = i + 1 < mapped.length ? mapped[i + 1][0] : you;
    if (SEAT_ORDER.includes(before) && OPPOSITE[before] === after) {
      mapped[i] = [SEAT_ORDER[(SEAT_ORDER.indexOf(before) + 1) % 4], mapped[i][1]];
    }
  }
  return mapped.every(([w]) => SEAT_ORDER.includes(w)) ? mapped : null;
}

// Vulnerability is read only from the exercise's explicit field.
export function vulnerabilityFor(vul, seat, role) {
  if (vul === "כולם") return true;
  if (vul === "ללא") return false;
  if (vul === "המתנגדים בלבד") return role ? role === "יריב" : null;
  if (!seat || !["מזרח-מערב", "צפון-דרום"].includes(vul)) return null;
  return vul.split("-").includes(seat);
}
function SeatTable({ calls, you, dealer, vul }) {
  const idx = s => SEAT_ORDER.indexOf(s);
  const grid = [];
  let cur = [null, null, null, null];
  let prev = -1;
  calls.forEach(([s, b]) => {
    const ci = idx(s);
    if (ci <= prev) { grid.push(cur); cur = [null, null, null, null]; }
    cur[ci] = b; prev = ci;
  });
  const yi = idx(you);
  if (yi <= prev) { grid.push(cur); cur = [null, null, null, null]; }
  cur[yi] = "?";
  grid.push(cur);
  return (
    <div className="atab" dir="ltr">
      {SEAT_ORDER.map(s => <div key={s} className={"ah" + (s === you ? " you" : "") + (s === dealer ? " dlr" : "") + (vulnerabilityFor(vul, s, you ? (s === you || s === OPPOSITE[you] ? "אתה" : "יריב") : null) === null ? "" : " vheader " + (vulnerabilityFor(vul, s, you ? (s === you || s === OPPOSITE[you] ? "אתה" : "יריב") : null) ? "vulnerable" : "nonvulnerable"))} dir="rtl">{s}</div>)}
      {grid.map((r, ri) => r.map((cell, ci) => (
        <div key={ri + "-" + ci} className={"ac" + (SEAT_ORDER[ci] === you ? " you" : "")}>
          {cell === "?" ? <span className="aq" aria-label="תורך">?</span> : cell ? <Bid b={cell}/> : ""}
        </div>
      )))}
    </div>
  );
}

// Role-only data never establishes compass directions. Partnership-only
// sequences have two stable columns. Competitive sequences use four columns
// only when every supplied call, including the next turn, fits that order.
// Abbreviated/ambiguous sequences keep chronological cells instead of guessing.
export function roleLayout(auction) {
  const calls = [...auction, ["אתה", "?"]];
  const partnershipOnly = calls.every(([w]) => w === "אתה" || w === "שותף");
  const cycle = partnershipOnly ? ["אתה", "שותף"] : ["אתה", "יריב", "שותף", "יריב"];
  const starts = cycle.flatMap((w, i) => w === calls[0][0] ? [i] : []);
  const valid = starts.filter(start => calls.every(([w], i) => cycle[(start + i) % cycle.length] === w));
  if (valid.length !== 1) return { chronological: true, calls };
  const start = valid[0];
  const headers = cycle.map((_, i) => cycle[(start + i) % cycle.length]);
  const cells = calls.map(([, bid]) => bid);
  while (cells.length % headers.length) cells.push(null);
  return { chronological: false, headers, cells };
}

function RoleTable({ auction, qid, you, dealer, vul }) {
  const layout = roleLayout(auction);
  if (/^s14d[1-8]$/.test(qid)) {
    // Source: lesson 14 summary, printed page 4, examples 1-8.
    // Its side P labels are static opponent labels, not three serial calls.
    const responder = /^s14d[1-4]$/.test(qid);
    return <div className="source-auction" dir="ltr" aria-label="תרשים הכרזות לפי שחקן">
      <div className="source-north"><span className="source-role" dir="rtl">שותף</span><div className="source-bids">{responder ? <Bid b="1♥"/> : <><Bid b="P"/><span className="source-slash"> / </span><Bid b="2♣"/></>}</div></div>
      <div className="source-west"><span className="source-role" dir="rtl">יריב</span><Bid b="P"/></div>
      <div className="source-table" aria-hidden="true" />
      <div className="source-east"><span className="source-role" dir="rtl">יריב</span><Bid b="P"/></div>
      <div className="source-south you"><span className="source-role" dir="rtl">אתה</span><div className="source-bids"><Bid b={responder ? "P" : "1♠"}/><span className="source-slash"> / </span><span className="aq">?</span></div></div>
    </div>;
  }

  // Dealer column: only when the dealer's seat is known relative to "you".
  // Headers run clockwise, so the left-hand rival follows "אתה" and the
  // right-hand rival precedes it. Otherwise the dealer chip alone is shown.
  let dealerCol = -1;
  if (!layout.chronological && dealer && you) {
    const h = layout.headers, n = h.length, yi = h.indexOf("אתה");
    if (dealer === you) dealerCol = yi;
    else if (OPPOSITE[you] === dealer) dealerCol = h.indexOf("שותף");
    else if (n === 4) dealerCol = (SEAT_ORDER[(SEAT_ORDER.indexOf(you) + 1) % 4] === dealer) ? (yi + 1) % 4 : (yi + 3) % 4;
  }
  return <div className="role-vul-wrap"><div className="atab role-table" dir="ltr" style={{gridTemplateColumns: `repeat(${layout.headers.length},minmax(0,1fr))`}}>
    {layout.headers.map((who, i) => <div key={i} className={"ah" + (who === "אתה" ? " you" : "") + (i === dealerCol ? " dlr" : "")} dir="rtl">{who}{i === dealerCol && <small className="dtag">דילר</small>}</div>)}
    {layout.cells.map((bid, i) => <div key={i} className={"ac" + (layout.headers[i % layout.headers.length] === "אתה" ? " you" : "")}>
      {bid === "?" ? <span className="aq" aria-label="תורך">?</span> : bid ? <Bid b={bid}/> : ""}
    </div>)}
  </div></div>;
}

export function compassCalls(q, you) {
  // Seat labels recovered from explicit context, or the approved session-18
  // screenshot review (hand 5). Display-only: bid tokens are never changed.
  const sourceSeats = {
    s18b6a: ["דרום", "מערב", "צפון"],
    s18b5a: ["צפון", "מזרח", "דרום", "מערב"],
  }[q.id];
  const auction = sourceSeats
    ? (q.auction || []).map(([, bid], i) => [sourceSeats[i], bid])
    : q.auction || [];
  return toSeats(auction, you);
}

export function Auction({ q, you }) {
  const calls = compassCalls(q, you);
  // Dealer comes only from the exercise data; none is invented.
  const dealer = SEAT_ORDER.includes(q.dealer) ? q.dealer : null;
  let who = "";
  if (dealer && you) who = dealer === you ? "אתה" : OPPOSITE[you] === dealer ? "השותף" : "יריב";
  const body = calls ? <SeatTable calls={calls} you={you} dealer={dealer} vul={q.vul}/> : <RoleTable auction={q.auction || []} qid={q.id} you={you} dealer={dealer} vul={q.vul}/>;
  // Compass headers already label both player and dealer.
  if (!dealer || calls) return body;
  return <div className="auc-wrap">
    <div className="dchip" dir="rtl"><b>דילר:</b> {dealer}{who && <span> · {who}</span>}</div>
    {body}
  </div>;
}
