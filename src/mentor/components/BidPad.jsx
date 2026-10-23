import React from 'react';
import { Bid } from './Bid.jsx';

export function BidPad({options, selected, onSelect}) {
  return (
    <div className="opts" dir="ltr">
      {options.map(o => (
        <button key={o} className={"opt-btn" + (selected === o ? " sel" : "")} onClick={() => onSelect(o)}><Bid b={o}/></button>
      ))}
    </div>
  );
}
