import React, { useState, useEffect, useMemo } from 'react';
import './mentor.css';
import { shuffle } from './lib/helpers.js';
import { QUESTIONS, TOPICS, PLAY_TOPICS, topicOf, groupOf, qsOfGroup, qsOf } from './data/index.js';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { ErrorScreen } from './components/ErrorScreen.jsx';
import TopicSettingsScreen from './screens/TopicSettingsScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';
import StatsScreen from './screens/StatsScreen.jsx';
import SummaryScreen from './screens/SummaryScreen.jsx';
import DoneScreen from './screens/DoneScreen.jsx';
import FeedbackScreen from './screens/FeedbackScreen.jsx';
import QuestionScreen from './screens/QuestionScreen.jsx';
import TopicsScreen from './screens/TopicsScreen.jsx';
import GroupScreen from './screens/GroupScreen.jsx';
import PlayersScreen from './screens/PlayersScreen.jsx';
import AdminCodeScreen from './screens/AdminCodeScreen.jsx';
import AdminUsersScreen from './screens/AdminUsersScreen.jsx';
import AdminConfirmScreen from './screens/AdminConfirmScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';

// Dev/preview deep links shared by the runtime hash handler and static renders
// (window.instinctFile.initialRoute, used by the file renderer for screenshots).
function adminRoute(h){
  if (h === "players") return { screen: "players" };
  if (h === "admin-code-demo" || h === "admin-code") return { screen: "admin-code", test: h === "admin-code-demo" ? "idle" : null };
  if (h === "admin-code-wrong") return { screen: "admin-code", test: "wrong" };
  if (h === "admin-code-locked") return { screen: "admin-code", test: "locked" };
  if (h === "admin-offline") return { screen: "admin-code", test: "offline" };
  if (h === "admin-setup") return { screen: "admin-code", test: "setup" };
  if (h.startsWith("admin-setup-")) return { screen: "admin-code", test: "setup", setupKey: h.slice("admin-setup-".length) };
  if (h === "admin-users") return { screen: "admin-users", testUsers: [{name:"אבי",answered:116,correct:97},{name:"דוד",answered:54,correct:38},{name:"שרה",answered:23,correct:15},{name:"משה",answered:8,correct:3}] };
  if (h === "admin-confirm") return { screen: "admin-confirm", testUsers: [], target: {name:"דוד",answered:54,correct:38} };
  if (h === "settings") return { screen: "settings" };
  return null;
}

export default function Mentor({ stats, setStats, recordAnswer, users, current, selectUser, disabledTopics = [], setDisabledTopics, preferenceMessage, sync, storageStatus, deletedNotice, clearDeletedNotice }){
  const enabled = id => !disabledTopics.includes(id);
  const activeQuestions = QUESTIONS.filter(q => enabled(q.topic));
  const activeTopics = TOPICS.filter(t => enabled(t.id));
  const activeGroupQs = g => qsOfGroup(g).filter(q => enabled(q.topic));
  const setEnabled = (ids, on) => setDisabledTopics(TOPICS.filter(t => ids.includes(t.id) ? !on : !enabled(t.id)).map(t => t.id));
  const [expanded, setExpanded] = useState({g1:true});
  const EmptyTopics = () => <div className="card empty-topics"><h2>אין נושאים מאופשרים לתרגול</h2><p>אפשר נושא ראשי או תת־נושא בהגדרות כדי להתחיל. ההתקדמות הקודמת נשמרת.</p><button className="primary" onClick={() => setScreen("topic-settings")}>בחירת נושאים בהגדרות</button></div>;
  const [nameInput, setNameInput] = useState("");
  const initRoute = adminRoute(((typeof window !== "undefined" && window.instinctFile && window.instinctFile.initialRoute) || "").replace(/^[#/]+/, ""));
  const [screen, setScreen] = useState(initRoute ? initRoute.screen : (current ? "home" : "players")); // home | topics | question | feedback | summary | stats | settings | topic-settings | done | error | admin-*
  const [order, setOrder] = useState(() => QUESTIONS.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [selected, setSelected] = useState(null);
  const [fb, setFb] = useState(null); // {bid, ok}
  const [tid, setTid] = useState(null);
  const [grp, setGrp] = useState(null);
  const backList = () => setScreen(grp ? "group" : "topics");
  const TopicRow = ({t}) => {
    const qs = qsOf(t.id);
    const done = qs.filter(x => stats.answered[x.id]).length;
    return (
      <div className="topicrow trow" onClick={() => startTopic(t.id)}>
        <span className="em">{t.icon}</span>
        <span className="name">{t.name}</span>
        <span className="tsub">{qs.length} {qs.length === 1 ? "שאלה" : "שאלות"}</span>
        <button className="tsum" onClick={e => { e.stopPropagation(); setSumTid(t.id); setScreen("summary"); }}>תקציר</button>
        <span className="pct">{Math.round(100 * done / qs.length)}%</span>
      </div>
    );
  };
  const [sumTid, setSumTid] = useState(TOPICS[0].id);
  const [adminToken, setAdminToken] = useState(null);
  const [adminTarget, setAdminTarget] = useState(initRoute && initRoute.target ? initRoute.target : null);
  const [adminTestState, setAdminTestState] = useState(initRoute && initRoute.test ? initRoute.test : null);
  const [adminSetupKey, setAdminSetupKey] = useState(initRoute && initRoute.setupKey ? initRoute.setupKey : null);
  const [adminTestUsers, setAdminTestUsers] = useState(initRoute && initRoute.testUsers ? initRoute.testUsers : null);
  // restore view to the top of the app on every screen change (hosted viewer keeps parent scroll otherwise)
  useEffect(() => {
    const el = document.querySelector(".bm-strip") || document.querySelector(".app");
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "start" });
  }, [screen]);
  const curName = tid ? (groupOf(tid) ? groupOf(tid).name : topicOf(tid).name) : "כל הנושאים";

  // Demo / deep links for development previews: #topics #question #correct #wrong #summary #stats #settings #done #error
  useEffect(() => {
    const h = (window.location.hash || "").replace("#", "");
    if (!h) return;
    if (h === "correct" || h === "wrong"){
      setOrder(QUESTIONS.map((_, i) => i)); setPos(0);
      setFb({ bid: h === "correct" ? QUESTIONS[0].answer : "Pass", ok: h === "correct" });
      setScreen("feedback");
    } else if (h === "group"){
      setGrp("g1"); setScreen("group");
    } else if (h.startsWith("admin")){
      // Demo / deep links for development previews of the admin screens.
      const r = adminRoute(h);
      if (r){ setAdminTestState(r.test || null); if (r.setupKey) setAdminSetupKey(r.setupKey); if (r.testUsers) setAdminTestUsers(r.testUsers); if (r.target) setAdminTarget(r.target); setScreen(r.screen); }
    } else if (["topics","question","summary","stats","settings","topic-settings","done","error","home"].includes(h)){
      if (h === "question"){ setOrder(QUESTIONS.map((_, i) => i)); setPos(0); setSelected(null); }
      setScreen(h);
    }
  }, []);

  const q = QUESTIONS[order[pos]];
  const options = useMemo(() => q ? shuffle([q.answer, ...q.wrong]) : [], [q && q.id, pos, order]);
  const isPlay = !!(q && PLAY_TOPICS[q.topic]);
  const uniqueAnswered = Object.keys(stats.answered).length;
  const pct = uniqueAnswered ? Math.round(100 * (stats.answered && Object.values(stats.answered).filter(a => a.correct).length) / QUESTIONS.length) : 0;

  function startTopic(id){
    const t = id === undefined ? tid : id;
    if (!activeQuestions.some(x => !t || x.topic === t || (groupOf(t) && groupOf(t).topics.includes(x.topic)))) { setScreen("topics"); return; }
    setTid(t);
    const pool = QUESTIONS.map((x, i) => (enabled(x.topic) && (!t || x.topic === t || (groupOf(t) && groupOf(t).topics.includes(x.topic)))) ? i : -1).filter(i => i >= 0);
    const fresh = [], wrongFirst = [], rest = [];
    pool.forEach(i => { const a = stats.answered[QUESTIONS[i].id]; if (!a) fresh.push(i); else if (a.correct) rest.push(i); else wrongFirst.push(i); });
    setOrder([...shuffle(fresh), ...shuffle(wrongFirst), ...shuffle(rest)].slice(0, 10));
    setPos(0); setSelected(null); setFb(null); setScreen("question");
  }
  function check(){
    if (!selected) return;
    let ok;
    try {
      if (!q) throw new Error("question missing");
      ok = selected === q.answer;
    } catch(e){ setScreen("error"); return; }
    setFb({ bid: selected, ok });
    if (recordAnswer) { recordAnswer(q.id, ok); } else {
      const ns = { ...stats, totalAnswers: stats.totalAnswers + 1, totalCorrect: stats.totalCorrect + (ok ? 1 : 0),
        answered: { ...stats.answered, [q.id]: { correct: ok } } };
      setStats(ns);
    }
    setScreen("feedback");
  }
  function next(){
    if (pos + 1 >= order.length){ setScreen("done"); return; }
    setPos(pos + 1); setSelected(null); setFb(null); setScreen("question");
  }

  const ctx = { stats, setStats, sync, storageStatus, users, current, selectUser, disabledTopics, setDisabledTopics, preferenceMessage, adminToken, setAdminToken, adminTarget, setAdminTarget, adminTestState, adminSetupKey, adminTestUsers, deletedNotice, clearDeletedNotice, enabled, activeQuestions, activeTopics, activeGroupQs, setEnabled, expanded, setExpanded, EmptyTopics, nameInput, setNameInput, screen, setScreen, order, setOrder, pos, setPos, selected, setSelected, fb, setFb, tid, setTid, grp, setGrp, backList, TopicRow, sumTid, setSumTid, curName, q, options, isPlay, uniqueAnswered, pct, startTopic, check, next };

  return (
    <ErrorBoundary onHome={() => setScreen("topics")}>
      <div className="app" dir="rtl">

        {screen === "home" && <HomeScreen c={ctx}/>}

        {screen === "players" && <PlayersScreen c={ctx}/>}

        {screen === "group" && grp && <GroupScreen c={ctx}/>}

        {screen === "topics" && <TopicsScreen c={ctx}/>}

        {screen === "question" && q && <QuestionScreen c={ctx}/>}

        {screen === "feedback" && q && fb && <FeedbackScreen c={ctx}/>}

        {screen === "done" && <DoneScreen c={ctx}/>}

        {screen === "summary" && <SummaryScreen c={ctx}/>}

        {screen === "stats" && <StatsScreen c={ctx}/>}

        {screen === "settings" && <SettingsScreen c={ctx}/>}

        {screen === "topic-settings" && <TopicSettingsScreen c={ctx}/>}

        {screen === "admin-code" && <AdminCodeScreen c={ctx}/>}

        {screen === "admin-users" && <AdminUsersScreen c={ctx}/>}

        {screen === "admin-confirm" && <AdminConfirmScreen c={ctx}/>}

        {screen === "error" && (
          <ErrorScreen onRetry={() => setScreen("question")} onHome={() => setScreen("topics")}/>
        )}

      </div>
    </ErrorBoundary>
  );
}
