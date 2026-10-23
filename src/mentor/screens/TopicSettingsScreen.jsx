import React from 'react';
import { TOPICS, GROUPS, topicOf, qsOf } from '../data/index.jsx';

export default function TopicSettingsScreen({ c }) {
  const { preferenceMessage, enabled, activeQuestions, activeTopics, setEnabled, expanded, setExpanded, setScreen, setGrp } = c;
  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("settings")}>→</span><h1>הגדרות נושאים</h1></div></div>
        <div className="content">
          <section className="topic-settings" aria-label="נושאי תרגול">
            <p className="settings-note">בחר אילו נושאים יופיעו בתרגול ובסיבובים האקראיים. ברירת המחדל: כולם מאופשרים.</p>
            <div className="bulk-actions"><button className="secondary" onClick={() => setEnabled(TOPICS.map(t => t.id), true)} disabled={activeTopics.length === TOPICS.length}>אפשר הכול</button><button className="secondary" onClick={() => setEnabled(TOPICS.map(t => t.id), false)} disabled={!activeTopics.length}>בטל הכול</button></div>
            <p className="selection-count" role="status">{activeTopics.length} מתוך {TOPICS.length} תתי־נושאים מאופשרים · {activeQuestions.length} שאלות</p>
            <p className="settings-note">הבחירה נשמרת אוטומטית לפי שם המתרגל בדפדפן הזה, ללא סנכרון בין מכשירים. ביטול נושא אינו מוחק את ההתקדמות או את הסטטיסטיקה.</p>
            {preferenceMessage && <p className="settings-note" role="status">{preferenceMessage}</p>}
            {!activeTopics.length && <p className="empty-notice" role="status">כל הנושאים בוטלו. לא ניתן להתחיל תרגול עד שתאפשר לפחות תת־נושא אחד.</p>}
            <div className="setting-groups">{GROUPS.map(g => {
              const count = g.topics.filter(enabled).length;
              const mixed = count > 0 && count < g.topics.length;
              return <div className="setting-group" key={g.id}>
                <div className="setting-group-head">
                  <label className="setting-parent"><input type="checkbox" checked={count === g.topics.length} ref={el => { if(el) el.indeterminate = mixed; }} aria-checked={mixed ? "mixed" : count === g.topics.length} onChange={() => setEnabled(g.topics, count !== g.topics.length)} /><span><strong>{g.icon} {g.name}</strong><small>{count} מתוך {g.topics.length} מאופשרים{mixed ? " · חלקית" : count === 0 ? " · מבוטל" : ""}</small></span></label>
                  <button className="expand-topics" aria-label={(expanded[g.id] ? "הסתר תתי־נושאים: " : "הצג תתי־נושאים: ") + g.name} aria-expanded={!!expanded[g.id]} aria-controls={"children-" + g.id} onClick={() => setExpanded({...expanded, [g.id]: !expanded[g.id]})}>{expanded[g.id] ? "⌃" : "⌄"}</button>
                </div>
                {expanded[g.id] && <div className="setting-children" id={"children-" + g.id}>{g.topics.map(id => { const t = topicOf(id); return <label className={"setting-child" + (!enabled(id) ? " is-off" : "")} key={id}><input type="checkbox" checked={enabled(id)} onChange={e => setEnabled([id], e.target.checked)} /><span>{t.name}<small>{qsOf(id).length} שאלות{!enabled(id) ? " · לא מאופשר" : ""}</small></span></label>; })}</div>}
              </div>;
            })}</div>
            <button className="primary" onClick={() => {setGrp(null); setScreen("topics");}}>חזרה לבחירת נושא</button>
          </section>
        </div>
      </>
  );
}
