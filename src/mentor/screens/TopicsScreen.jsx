import React from 'react';
import { TOPICS, GROUPS, groupedIds } from '../data/index.jsx';

export default function TopicsScreen({ c }) {
  const { stats, enabled, activeQuestions, activeTopics, activeGroupQs, EmptyTopics, setScreen, setGrp, TopicRow, pct, startTopic } = c;
  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={() => setScreen("home")}>→</span><h1>בחירת נושא</h1></div></div>
        <div className="content">
          <div className="practice-selection"><span>{activeTopics.length} מתוך {TOPICS.length} תתי־נושאים מאופשרים</span><button className="text-control" onClick={() => setScreen("topic-settings")}>שינוי בהגדרות</button></div>
          {!activeTopics.length && <EmptyTopics/>}
          {GROUPS.filter(g => g.topics.some(enabled)).map(g => {
            const qs = activeGroupQs(g);
            const done = qs.filter(x => stats.answered[x.id]).length;
            return (
              <div className="topicrow" key={g.id} onClick={() => { setGrp(g.id); setScreen("group"); }}>
                <span className="em">{g.icon}</span>
                <span className="name">{g.name}<small className="tsub">{g.topics.filter(enabled).length} נושאים · {qs.length} שאלות</small></span>
                <span className="pct">{Math.round(100 * done / qs.length)}%</span>
                <span className="chev">‹</span>
              </div>
            );
          })}
          {TOPICS.filter(t => enabled(t.id) && !groupedIds.includes(t.id)).map(t => <TopicRow key={t.id} t={t}/>)}
          {!!activeTopics.length && <div className="topicrow" onClick={() => startTopic(null)}>
            <span className="em">🃏</span>
            <span className="name">כל השאלות המאופשרות, בסדר אקראי<small className="tsub">{Math.min(10, activeQuestions.length)} מתוך {activeQuestions.length} שאלות</small></span>
            <span className="pct">{Math.round(100 * activeQuestions.filter(x => stats.answered[x.id]).length / (activeQuestions.length || 1))}%</span>
          </div>}
        </div>
      </>
  );
}
