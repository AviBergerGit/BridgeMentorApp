import React from 'react';

// Progress bar split by outcome (Avi, 2026-11-13): green = correct, red = wrong,
// grey track = unanswered. The two segments sum to the answered share, so the
// existing % label (answered out of total) stays truthful.
export function SegBar({ ok, bad, total }) {
  const okP = total ? Math.round(100 * ok / total) : 0;
  const badP = total ? Math.round(100 * bad / total) : 0;
  return (
    <div className="bar segs">
      <div className="seg-ok" style={{ width: okP + "%" }}></div>
      <div className="seg-bad" style={{ width: badP + "%" }}></div>
    </div>
  );
}
