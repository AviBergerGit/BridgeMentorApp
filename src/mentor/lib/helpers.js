export function spaced(cards){ return cards.split("").map(ch => ch === "T" ? "10" : ch).join(" "); }
export function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export function loadStats(){
  try { const s = JSON.parse(localStorage.getItem("bm-stats-v1")); if (s && typeof s === "object") return s; } catch(e){}
  return { answered: {}, totalAnswers: 0, totalCorrect: 0 };
}
export function saveStats(s){ try { localStorage.setItem("bm-stats-v1", JSON.stringify(s)); } catch(e){} }

export const SUITS = [["♣","black"],["♦","red"],["♥","red"],["♠","black"]];

const SEAT_ORDER = ["מערב", "צפון", "מזרח", "דרום"];
const OPPOSITE = { "מזרח": "מערב", "מערב": "מזרח", "צפון": "דרום", "דרום": "צפון" };
export function youSeat(q){
  if (q.you) return q.you;
  if (q.seat) return q.seat;
  const m = q.ctx && q.ctx.match(/אתה (מזרח|מערב|צפון|דרום)/);
  if (m) return m[1];
  const o = q.ctx && q.ctx.match(/אתה הפותח ב(מזרח|מערב|צפון|דרום)/);
  return o ? o[1] : null;
}
// Ground "your" seat from the exercise text when no explicit "אתה X" exists:
// the text says the partner opened a specific bid and the auction's first
// call names a compass seat with that exact bid, so that seat is the partner.
export function groundedSeat(q){
  const you = youSeat(q);
  if (you) return you;
  const a = q.auction || [];
  if (!a.length || !q.ctx) return null;
  // s16t2: West opens 1NT, you transfer, West completes the transfer.
  // The exercise therefore identifies West as partner, without "השותף פתח".
  if (q.id === "s16t2") return "מזרח";
  const pm = q.ctx.match(/השותף פתח ([1-7](?:NT|♣|♦|♥|♠))/);
  if (pm && SEAT_ORDER.includes(a[0][0]) && a[0][1] === pm[1]) return OPPOSITE[a[0][0]];
  return null;
}
export { SEAT_ORDER, OPPOSITE };
