import React from 'react';
import { TokenText } from './TokenText.jsx';

export function ChoicePad({options, selected, onSelect}) {
  return <div>{options.map(o => (
    <button key={o} className={"choicebtn" + (selected === o ? " sel" : "")} onClick={() => onSelect(o)}><TokenText t={o}/></button>
  ))}</div>;
}
