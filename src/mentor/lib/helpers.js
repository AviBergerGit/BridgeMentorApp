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
