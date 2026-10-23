import React from 'react';

export function Bid({b}) {
  if (!b) return null;
  const suit = b.slice(-1);
  const red = suit === "♥" || suit === "♦";
  return <span className={"bid" + (red ? " red" : "")} dir="ltr">{b}</span>;
}
