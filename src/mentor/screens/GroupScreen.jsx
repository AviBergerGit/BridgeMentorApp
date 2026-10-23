import React from 'react';
import { topicOf, groupOf } from '../data/index.jsx';

export default function GroupScreen({ c }) {
  const { enabled, activeGroupQs, EmptyTopics, setScreen, grp, setGrp, TopicRow, startTopic } = c;
  return (
      <>
        <div className="header"><div className="navbar"><span className="back" onClick={() => { setGrp(null); setScreen("topics"); }}>→</span><h1>{groupOf(grp).name}</h1></div></div>
        <div className="content">
          {groupOf(grp).topics.filter(enabled).map(id => <TopicRow key={id} t={topicOf(id)}/>)}
          {activeGroupQs(groupOf(grp)).length === 0 ? <EmptyTopics/> : <div className="topicrow" onClick={() => startTopic(grp)}>
            <span className="em">🃏</span>
            <span className="name">כל נושאי {groupOf(grp).name}, בסדר אקראי<small className="tsub">{Math.min(10, activeGroupQs(groupOf(grp)).length)} מתוך {activeGroupQs(groupOf(grp)).length} שאלות</small></span>
          </div>}
        </div>
      </>
  );
}
