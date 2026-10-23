import React from 'react';
import { Bid } from '../components/Bid.jsx';
import { HandView } from '../components/HandView.jsx';
import { TokenText } from '../components/TokenText.jsx';
import { ChoicePad } from '../components/ChoicePad.jsx';
import { DummyCard } from '../components/DummyCard.jsx';
import { AuctionLine } from '../components/AuctionLine.jsx';
import { BidPad } from '../components/BidPad.jsx';

export default function QuestionScreen({ c }) {
  const { setScreen, order, pos, selected, setSelected, backList, setSumTid, curName, q, options, isPlay, check } = c;
  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={backList}>→</span><h1 className="tname">{curName}</h1><span className="counter">שאלה {pos + 1} מתוך {order.length}</span><button className="tsum" onClick={() => { setSumTid(q.topic); setScreen("summary"); }}>תקציר</button></div></div>
        <div className="content scroll">
          <div className="card">
            <h2>{isPlay && q.seat ? "היד שלך (" + q.seat + ")" : "היד שלך"}</h2>
            {isPlay && q.partial
              ? <><HandView hand={q.hand} partial/><div className="scopenote">מוצגת רק סדרת ה{q.fragSuitName} - שאר הסדרות אינן חלק מהתרגיל</div></>
              : <HandView hand={q.hand} hcp={q.hcp} tail={isPlay ? " · אתה" : ""}/>}
          </div>
          {isPlay && <DummyCard q={q}/>}
          {(!isPlay || q.contract || q.lead || q.ctx || (q.playhist && !q.dummyfrag) || q.auction.length > 0) && (
          <div className="card">
            <h2>{!isPlay ? "המכרז" : (q.topic === "t47" || q.topic === "t48" || q.topic === "t49" ? "המכרז וההובלה" : "החוזה והמשחק")}</h2>
            {isPlay && (q.contract || q.lead) && (
            <div className="contract">
              {q.contract && <span className="pill">חוזה: <TokenText t={q.contract}/>{q.contractBy ? " " + q.contractBy : ""}</span>}
              {q.lead && <span className="pill">הובלה: <TokenText t={q.lead}/> {q.leadBy}</span>}
            </div>)}
            {!isPlay && <AuctionLine auction={q.auction}/>}
            {isPlay && q.auction.length > 0 && <div className="ctx"><TokenText t={q.auction.map(([who, bid]) => who + ": " + bid).join(" · ")}/></div>}
            {isPlay && q.playhist && !q.dummyfrag && <div className="playhist"><TokenText t={q.playhist}/></div>}
            {(!isPlay || q.ctx) && <div className="ctx">{isPlay ? <TokenText t={q.ctx}/> : <>{q.ctx}{q.dealer ? " · דילר: " + q.dealer : ""}{q.vul ? " · פגיעים: " + q.vul : ""}</>}</div>}
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
