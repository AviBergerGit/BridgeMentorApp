import React from 'react';
import {HandView} from './HandView.jsx';

// Drawn-table positions, clockwise, mapped onto the existing grid-area classes.
const POSITIONS=[['top','north'],['right','east'],['bottom','south'],['left','west']];
const COMPASS=['צפון','מזרח','דרום','מערב']; // clockwise N,E,S,W
const ROLE_LABEL={you:'אתה',partner:'השותף',dummy:'הדומם',declarer:'הכרוז'};
const SUIT={s:'♠',h:'♥',d:'♦',c:'♣'};

export function DefenseDiagram({d,hand}) {
 const own=d.hand||hand;
 const hasDummy=!!(d.dummy||d.dummyRanks);
 const holding=(h,r)=>h?<HandView hand={h} partial/>:<div className="rank-hand" dir="ltr">{r}</div>;
 const block=(dummy)=> <><h2 className="tv-title">{dummy?'הדומם':d.title||'היד שלך'}</h2>{holding(dummy?d.dummy:own,dummy?d.dummyRanks:d.ranks)}</>;
 const scope=d.scope||(d.ranks?'הסדרה לא צוינה בתרגיל':(own&&Object.keys(own).length===1&&(!d.dummy||Object.keys(d.dummy).length===1)?'בתרגיל מוצגת סדרה אחת בלבד':null));
 // A card already played in the trick, shown on the table next to the seat that
 // played it. Only cards stated in the question are annotated; never guessed.
 // p.g marks a card the question says was played without naming it (e.g.
 // "הכרוז משחק קלף קטן"): a generic, visually distinct chip - never a rank.
 const chip=(p)=><div className="played"><span className={"played-chip"+(p.g?' generic':'')}>{p.s&&<span className={"suit"+((p.s==='h'||p.s==='d')?' red':'')}>{SUIT[p.s]}</span>}{p.g||p.r}</span></div>;
 const addPlayed=(seats,posOf,key)=>{(d.played||[]).forEach(p=>{const pos=posOf(p[key]);if(pos>=0)seats[pos]={...(seats[pos]||{}),played:chip(p)};});};

 // Seat assignment. The user is always at the bottom; every other seat rotates
 // around the table so clockwise play order (and relative compass directions)
 // stays correct. Two grounded sources, never invented:
 //  - you + dummySeat: absolute compass directions stated in the question
 //    (explicitly, or derived from a stated direction plus who plays next).
 //  - playOrder: roles clockwise from the leader, when the question fixes the
 //    play sequence but no absolute directions. Labels show roles, not compass.
 // Questions whose seats cannot be derived keep the plain top/bottom layout.
 let seats=null;
 if(d.you&&d.dummySeat){
   const ui=COMPASS.indexOf(d.you);
   const posOf=seat=>(COMPASS.indexOf(seat)-ui+2)%4;
   seats={};
   COMPASS.forEach(s=>{seats[posOf(s)]={label:s};});
   seats[posOf(d.you)]={label:d.you,content:block(false)};
   if(hasDummy)seats[posOf(d.dummySeat)]={label:d.dummySeat,content:block(true)};
   addPlayed(seats,posOf,'seat');
 } else if(d.playOrder){
   const ui=d.playOrder.indexOf('you');
   const posOf=role=>(d.playOrder.indexOf(role)-ui+2)%4;
   seats={};
   ['you','partner','dummy','declarer'].forEach(r=>{
     const p=posOf(r);
     if(r==='you')seats[p]={content:block(false)};
     else if(r==='dummy'&&hasDummy)seats[p]={content:block(true)};
     else seats[p]={label:ROLE_LABEL[r]};
   });
   addPlayed(seats,posOf,'role');
 }
 const sideHand=seats?(seats[1]&&seats[1].content?' hand-east':(seats[3]&&seats[3].content?' hand-west':'')):'';
 return <div className={'tableview defense-diagram'+(seats?' compass':'')+sideHand}>
 {seats?<>{POSITIONS.map(([pos,cl],i)=>{const s=seats[i]||{};const lbl=s.label&&<span className="direction">{s.label}</span>;// played chips render beside the table square in the center column (table-row); a label-only top seat groups its label with its chip at the table
 const topFloat=i===0&&s.label&&!s.content;
 return <div key={pos} className={cl}>{!topFloat&&<div className="seat-main">{lbl}{s.content}</div>}</div>;})}<div className="center"><div className="table-grid"><div/><div className="tg-n">{seats[0]&&seats[0].label&&!seats[0].content&&<span className="direction">{seats[0].label}</span>}{seats[0]&&seats[0].played}</div><div/><div className="tg-w">{seats[3]&&seats[3].played}</div><div className="table-square" aria-hidden="true"/><div className="tg-e">{seats[1]&&seats[1].played}</div><div/><div className="tg-s">{seats[2]&&seats[2].played}</div><div/></div></div></>:<>{hasDummy&&block(true)}<div className="table-square" aria-hidden="true"/>{block(false)}</>}
 {(scope||d.illustrativeLow)&&<div className="scopenote">{[scope,d.illustrativeLow?'הקלפים הקטנים להמחשה בלבד':null].filter(Boolean).join('; ')}</div>}
 </div>;
}
