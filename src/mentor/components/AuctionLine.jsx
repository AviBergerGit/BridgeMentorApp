import React from 'react';
import { Bid } from './Bid.jsx';

export function AuctionLine({auction}) {
  return (
    <div className="auction auc-flex" dir="ltr">
      {auction.map(([who, bid], i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="auc-sep">·</span>}
          <span className="auc-item" dir="rtl">{who}: <Bid b={bid}/></span>
        </React.Fragment>
      ))}
      <span className="auc-sep">·</span>
      <span className="auc-you" dir="rtl">אתה: ?</span>
    </div>
  );
}
