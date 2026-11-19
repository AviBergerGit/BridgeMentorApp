import React, { useEffect, useState } from 'react';
import { TOPICS, GROUPS, topicOf, groupedIds, qsOfGroup, qsOf } from '../data/index.js';
import { loadUser } from '../lib/sync.js';
import { SegBar } from '../components/SegBar.jsx';

// Practiced-topics view for one cloud user (admin only, reached by tapping a
// row in ניהול משתמשים). Shows only main topics where the user answered at
// least one question, with per-topic answered/correct/wrong counts in the
// same style as the personal statistics screen. Counts follow the app
// convention: last answer per question. Practice dates are not recorded, so
// none are shown.
export default function AdminUserTopicsScreen({ c }) {
  const { adminTarget, adminToken, setScreen } = c;
  const t = adminTarget || { name: "", answered: 0, correct: 0 };
  const [answered, setAnswered] = useState(c.adminTestDetail || null); // {qid: {correct}}
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState({});

  const load = () => {
    setFailed(false);
    loadUser(t.name).then(s => {
      const bankIds = new Set(TOPICS.flatMap(tp => qsOf(tp.id)).map(q => q.id));
      const a = {};
      Object.entries((s && s.answered) || {}).forEach(([qid, v]) => { if (bankIds.has(qid)) a[qid] = v; });
      setAnswered(a);
    }).catch(() => setFailed(true));
  };
  useEffect(() => {
    if (c.adminTestDetail) { setAnswered(c.adminTestDetail); return; }
    if (!adminToken) { setScreen("admin-code"); return; } // no verified admin session: back to the code gate
    load();
  }, []);

  const blocks = () => {
    const has = tid => qsOf(tid).some(q => answered[q.id]);
    const list = [
      ...GROUPS.map(g => ({ g, list: g.topics.map(topicOf).filter(tp => tp && has(tp.id)) })),
      ...TOPICS.filter(tp => !groupedIds.includes(tp.id) && has(tp.id)).map(tp => ({ g: null, list: [tp] })),
    ].filter(blk => blk.list.length > 0);
    return list;
  };

  const row = (tp, key, main) => {
    const qs = qsOf(tp.id);
    const done = qs.filter(x => answered[x.id]).length;
    const ok = qs.filter(x => answered[x.id] && answered[x.id].correct).length;
    const wrong = done - ok;
    return (
      <div className={"bar-row" + (main ? " main" : "")} key={key}>
        <div className="ttl"><span className="ico">{tp.icon}</span><span className="tn">{tp.name}</span></div>
        <div className="meter"><SegBar ok={ok} bad={wrong} total={qs.length}/><span className="cnt">{qs.length} שאלות · {ok} נכון · {wrong} לא נכון</span></div>
      </div>
    );
  };

  const ready = !!answered;
  const blkList = ready ? blocks() : [];
  // Open the first practiced main topic by default, like the approved mockup.
  useEffect(() => {
    if (ready && blkList.length && blkList[0].g && Object.keys(open).length === 0) setOpen({ [blkList[0].g.id]: true });
  }, [ready]);

  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("admin-users")}>→</span><h1>{"התרגול של " + t.name}</h1></div></div>
        <div className="content">
          {failed && <div className="banner-bad" style={{fontSize:18}}>לא ניתן לטעון את התרגול של {t.name} - בדקו את החיבור ונסו שוב</div>}
          {failed && <button className="secondary" onClick={load}>נסו שוב</button>}
          {!failed && !ready && <div className="expl" style={{textAlign:'center'}}>טוען…</div>}
          {!failed && ready && <>
            <p className="settings-note">מוצגים רק נושאים ש{t.name} ענה על שאלות מהם. לחיצה על נושא ראשי פותחת או סוגרת את הפירוט.</p>
            {blkList.length === 0 && <div className="expl" style={{textAlign:'center'}}>{t.name} עוד לא ענה על שאלות.</div>}
            {blkList.map((blk, bi) => {
              if (!blk.g) return row(blk.list[0], "o" + bi, true);
              const gq = qsOfGroup(blk.g);
              const gd = gq.filter(x => answered[x.id]).length;
              const gk = gq.filter(x => answered[x.id] && answered[x.id].correct).length;
              const gw = gd - gk;
              return (
                <div key={blk.g.id}>
                  <button type="button" className="bar-row grow main" aria-expanded={!!open[blk.g.id]} aria-controls={"aut-children-" + blk.g.id} aria-label={(open[blk.g.id] ? "הסתר פירוט: " : "הצג פירוט: ") + blk.g.name} onClick={() => setOpen({...open, [blk.g.id]: !open[blk.g.id]})}>
                    <div className="ttl"><span className="ico">{blk.g.icon}</span><span className="tn">{blk.g.name}</span><span className="chev" aria-hidden="true">{open[blk.g.id] ? "⌃" : "⌄"}</span></div>
                    <div className="meter"><SegBar ok={gk} bad={gw} total={gq.length}/><span className="cnt">{gq.length} שאלות · {gk} נכון · {gw} לא נכון</span></div>
                  </button>
                  {open[blk.g.id] && <div className="stat-children" id={"aut-children-" + blk.g.id}>{blk.list.map(tp => row(tp, tp.id, false))}</div>}
                </div>
              );
            })}
            {blkList.length > 0 && <p className="settings-note" style={{marginTop:18}}>נושאים ש{t.name} עוד לא תירגל אינם מוצגים.</p>}
          </>}
        </div>
      </>
  );
}
