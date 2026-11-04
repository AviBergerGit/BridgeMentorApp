import React from 'react';
import { Bid } from '../components/Bid.jsx';
import { HandView } from '../components/HandView.jsx';
import { TokenText } from '../components/TokenText.jsx';
import { ChoicePad } from '../components/ChoicePad.jsx';
import { DummyCard } from '../components/DummyCard.jsx';
import { Auction, compassCalls } from '../components/Auction.jsx';
import { groundedSeat } from '../lib/helpers.js';
import { BidPad } from '../components/BidPad.jsx';
import { AUCTION_NOTES } from '../data/auction-notes.js';

export default function QuestionScreen({ c }) {
  const { setScreen, order, pos, selected, setSelected, backList, setSumTid, curName, q, options, isPlay, check } = c;
  const seat = groundedSeat(q);
  const compass = !isPlay && compassCalls(q, seat);
  // Explicit per-exercise notes: no regex strips meaning from future content.
  const auctionNote = Object.prototype.hasOwnProperty.call(AUCTION_NOTES, q.id) ? AUCTION_NOTES[q.id] : q.ctx;
  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={backList}>→</span><h1 className="tname">{curName}</h1><span className="counter">שאלה {pos + 1} מתוך {order.length}</span><button className="tsum" onClick={() => { setSumTid(q.topic); setScreen("summary"); }}>תקציר</button></div></div>
        <div className="content scroll">
          {isPlay && (q.dummy || q.dummyfrag) ? (
          <div className="tableview">
            <DummyCard q={q} bare/>
            <div className="table-square" aria-hidden="true" />
            <h2 className="tv-title">היד שלך</h2>
            {q.partial
              ? <><HandView hand={q.hand} partial/><div className="scopenote">בתרגיל מוצגת סדרת ה{q.fragSuitName} בלבד</div></>
              : <HandView hand={q.hand} hcp={q.hcp} tail=" · אתה"/>}
          </div>
          ) : (
          <div className="card">
            <h2>{seat ? "היד שלך - " + seat : "היד שלך"}</h2>
            {isPlay && q.partial
              ? <><HandView hand={q.hand} partial/><div className="scopenote">מוצגת רק סדרת ה{q.fragSuitName} - שאר הסדרות אינן חלק מהתרגיל</div></>
              : <HandView hand={q.hand} hcp={q.hcp} tail={isPlay ? " · אתה" : ""}/>}
          </div>
          )}
          {(!isPlay || q.contract || q.lead || q.ctx || (q.playhist && !q.dummyfrag) || q.auction.length > 0) && (
          <div className="card">
            <h2>{!isPlay ? "המכרז" : (q.topic === "t47" || q.topic === "t48" || q.topic === "t49" ? "המכרז וההובלה" : "החוזה והמשחק")}</h2>
            {isPlay && (q.contract || q.lead) && (
            <div className="contract">
              {q.contract && <span className="pill">חוזה: <TokenText t={q.contract}/>{q.contractBy ? " " + q.contractBy : ""}</span>}
              {q.lead && <span className="pill">הובלה: <TokenText t={q.lead}/> {q.leadBy}</span>}
            </div>)}
            {!isPlay && <Auction q={q} you={seat}/>}
            {isPlay && q.auction.length > 0 && <div className="ctx"><TokenText t={q.auction.map(([who, bid]) => who + ": " + bid).join(" · ")}/></div>}
            {isPlay && q.playhist && !q.dummyfrag && <div className="playhist"><TokenText t={q.playhist}/></div>}
            {isPlay && q.ctx && <div className="ctx"><TokenText t={q.ctx}/></div>}
            {!isPlay && !compass && q.vul && <div className="ctx">פגיעים: {q.vul}</div>}
            {!isPlay && auctionNote && <div className="ctx">{auctionNote && <div><TokenText t={auctionNote}/></div>}</div>}
          </div>)}
          <div className="q">{isPlay ? "מה תשחק?" : "מה תכריז?"}</div>
          {isPlay
            ? <ChoicePad options={options} selected={selected} onSelect={setSelected}/>
            : <BidPad options={options} selected={selected} onSelect={setSelected}/>}
          <div className="selbar">
            <span>בחרת: {isPlay ? (selected ? <TokenText t={selected}/> : "-") : <Bid b={selected}/>}</span>
            <button className={"check" + (selected ? "" : " disabled")} onClick={check}>בדיקה ✓</button>
          </div>
        </div>
      </>
  );
}
