import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Mentor from './Mentor.jsx';
const KEY = 'bm-stats-v2';
const EMPTY_USER = { answered: {}, totalAnswers: 0, totalCorrect: 0 };
function load(){ try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.users) return d; } catch(e){} return { current: null, users: {} }; }
function App(){
  const [data, setDataRaw] = useState(load);
  const setData = d => { setDataRaw(d); try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(e){} };
  const users = data.users || {};
  const current = data.current && users[data.current] ? data.current : null;
  const stats = current ? users[current] : EMPTY_USER;
  const setStats = ns => { if (current) setData({ ...data, users: { ...users, [current]: ns } }); };
  const selectUser = name => { const n = name.trim().slice(0, 20); if (!n) return; setData({ current: n, users: users[n] ? users : { ...users, [n]: EMPTY_USER } }); };
  return <Mentor stats={stats} setStats={setStats} users={users} current={current} selectUser={selectUser} />;
}
createRoot(document.getElementById('root')).render(<App />);
