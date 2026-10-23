import React from 'react';

export function TokenText({t}) {
  if (!t) return null;
  const parts = String(t).split(/((?:(?:[AKQJT]|10|[1-9])[♠♥♦♣])(?:\s+(?:(?:[AKQJT]|10|[1-9])[♠♥♦♣]))*)/g);
  return <>{parts.map((p, i) => /^(?:[AKQJT]|10|[1-9])[♠♥♦♣]/.test(p)
    ? <span key={i} dir="ltr" className="cd">{p}</span>
    : <React.Fragment key={i}>{p}</React.Fragment>)}</>;
}
