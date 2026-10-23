import React from 'react';
import { Bid } from '../components/Bid.jsx';
import { TokenText } from '../components/TokenText.jsx';
import { FullAuction } from '../components/FullAuction.jsx';

export default function FeedbackScreen({ c }) {
  const { setScreen, order, pos, fb, backList, setSumTid, curName, q, isPlay, next } = c;
  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={backList}>→</span><h1 className="tname">{curName}</h1><span className="counter">שאלה {pos + 1} מתוך {order.length}</span></div></div>
        <div className="content scroll">
          <div className={fb.ok ? "banner-ok" : "banner-bad"}>{fb.ok ? "נכון! ✔" : "לא נכון ✖"}</div>
          <div className="card">
            <div className="ansrow"><span>{isPlay ? "המהלך שלך:" : "ההכרזה שלך:"}</span> {isPlay ? <TokenText t={fb.bid}/> : <Bid b={fb.bid}/>}</div>
            {!fb.ok && <div className="ansrow"><span>התשובה הנכונה:</span> {isPlay ? <TokenText t={q.answer}/> : <Bid b={q.answer}/>}</div>}
            <h2>הסבר</h2>
            <div className="expl">{isPlay ? <><TokenText t={q.answer}/> · <TokenText t={q.expl}/></> : <><Bid b={q.answer}/> · {q.expl}</>}</div>
            {q.full && (<>
              <h2 style={{marginTop:12}}>המכרז המלא</h2>
              <FullAuction text={q.full} you={q.you}/>
            </>)}
          </div>
          <button className="primary" onClick={next}>{pos + 1 >= order.length ? "סיום הסיבוב" : "שאלה הבאה"}</button>
          <button className="secondary" onClick={() => { setSumTid(q.topic); setScreen("summary"); }}>תקציר הנושא</button>
        </div>
      </>
  );
}
