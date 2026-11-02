// Cloud sync for Bridge-Mentor progress (Supabase REST, browser-direct).
// Design: atomic per-attempt RPC; unique event_id dedup; per-(question, device) high-water
// freshness gating on the server; offline queue replayed in tap order.
// STATELESS: the hosted iframe is sandboxed (no localStorage), so all persistence
// (device id, seq, queue, migration flags, backups) lives in the caller's useLocalState.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let listeners = [];
let deletedListeners = [];
let state = { status: 'synced', pending: 0 }; // synced | syncing | offline

function emit() { listeners.forEach(f => f(state)); }
export function onSyncChange(f) { listeners.push(f); f(state); return () => { listeners = listeners.filter(x => x !== f); }; }

// Tombstone: the server refuses every write for an admin-deleted name. When a
// reply carries user_deleted the caller purges its local copy of that name, so
// a device that was offline during the deletion cleans up instead of
// resurrecting the user. See supabase/admin-v1.sql.
export function onUserDeleted(f) { deletedListeners.push(f); return () => { deletedListeners = deletedListeners.filter(x => x !== f); }; }
function emitDeleted(username) { deletedListeners.forEach(f => f(username)); }

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
};

export function makeEvent(username, questionId, correct, deviceId, seq) {
  return {
    p_event_id: crypto.randomUUID(),
    p_username: username,
    p_question_id: questionId,
    p_correct: !!correct,
    p_device_id: deviceId,
    p_device_seq: seq,
  };
}

let flushing = false;
// queueRef: { current: Event[] } owned by the caller; removeEvent(id) must drop the
// event from the ref AND persist the shorter queue (caller owns persistence).
export async function flushQueue(queueRef, removeEvent) {
  if (flushing) return;
  flushing = true;
  try {
    while (queueRef.current.length) {
      const ev = queueRef.current[0];
      state = { status: 'syncing', pending: queueRef.current.length }; emit();
      try {
        const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/record_answer', {
          method: 'POST', headers, body: JSON.stringify(ev),
        });
        if (!res.ok) throw new Error('rpc ' + res.status);
        let body = null;
        try { body = await res.json(); } catch { /* no body */ }
        if (body && body.user_deleted) { removeEvent(ev.p_event_id); emitDeleted(ev.p_username); continue; }
        removeEvent(ev.p_event_id);
      } catch {
        state = { status: 'offline', pending: queueRef.current.length }; emit();
        return; // keep queue; retried on next attempt / online event / load
      }
    }
    state = { status: 'synced', pending: 0 }; emit();
  } finally { flushing = false; }
}

// Pull a user's server-side progress. Returns null when the name is unknown on the server.
// Per-name RPC (not table SELECTs) so that enumerating ALL users can stay admin-only.
export async function loadUser(username) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_user_state', {
    method: 'POST', headers,
    body: JSON.stringify({ p_username: username }),
  });
  if (!res.ok) throw new Error('load failed');
  const j = await res.json();
  if (!j) return null;
  const answered = {};
  (j.answers || []).forEach(r => { answered[r.question_id] = { correct: r.correct }; });
  return { answered, totalAnswers: j.total_answers, totalCorrect: j.total_correct,
    settings: j.disabled_topics || [], settingsRev: j.settings_rev || 0 };
}

// One-time migration of existing device progress via a single atomic server transaction:
// first migration to arrive seeds counters (row lock, no last-write-wins); later attempts and
// retries merge answer rows (insert-if-absent, server wins) and never overwrite counters.
// A failed call rolls back fully, so retrying next open is always safe.
// Caller keeps a separate backup of the local snapshot BEFORE calling this.
export async function migrateUser(username, stats) {
  const rows = Object.entries(stats.answered || {}).map(([qid, v]) => ({ question_id: qid, correct: !!v.correct }));
  const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/migrate_user', {
    method: 'POST', headers,
    body: JSON.stringify({
      p_username: username,
      p_total_answers: stats.totalAnswers || 0,
      p_total_correct: stats.totalCorrect || 0,
      p_rows: rows,
    }),
  });
  if (!res.ok) throw new Error('migrate ' + res.status);
  // { user_deleted: true } when the admin deleted this name: caller purges locally.
  try { return await res.json(); } catch { return null; }
}

// Pure merge of server state into a user's local stats for display (unit-testable).
// - answered: server wins per question; local-only questions are kept; attempts still
//   sitting in the local queue (not yet recorded server-side) overlay last, in tap order.
// - counters NEVER mix: the displayed (totalAnswers, totalCorrect) pair is taken whole
//   from one side - the server pair plus still-queued attempts (the server's near-future
//   pair), or the device's current pair - whichever reports more attempts (tie: more
//   correct). A pair from one real source only; never a synthesized max/mix. Displayed
//   attempts never decrease.
export function mergeRemoteStats(cur, remote, pendingEvents) {
  const answered = Object.assign({}, (cur && cur.answered) || {}, (remote && remote.answered) || {});
  let extra = 0, extraCorrect = 0;
  for (const ev of pendingEvents || []) {
    answered[ev.p_question_id] = { correct: !!ev.p_correct };
    extra++; if (ev.p_correct) extraCorrect++;
  }
  const sA = (remote && remote.totalAnswers || 0) + extra;
  const sC = (remote && remote.totalCorrect || 0) + extraCorrect;
  const lA = (cur && cur.totalAnswers) || 0;
  const lC = (cur && cur.totalCorrect) || 0;
  const serverWins = sA > lA || (sA === lA && sC >= lC);
  return {
    answered,
    totalAnswers: serverWins ? sA : lA,
    totalCorrect: serverWins ? sC : lC,
  };
}

// Topic-settings sync (per-username disabled-topic list). Whole-value per user with a
// server-held revision counter - never wall clocks. The server applies a write ONLY
// when baseRev matches its stored revision, so a device with a stale view can never
// silently overwrite newer settings; on mismatch it returns the current value+rev
// and the caller adopts it. Returns { applied, rev, topics? }; throws on network/HTTP
// failure so the caller keeps its dirty flag and retries on the next sync.
export async function saveSettings(username, disabledTopics, baseRev) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/save_settings', {
    method: 'POST', headers,
    body: JSON.stringify({ p_username: username, p_disabled_topics: disabledTopics || [], p_base_rev: baseRev || 0 }),
  });
  if (!res.ok) throw new Error('save_settings ' + res.status);
  return await res.json();
}

// Pure decision for one user's settings sync (unit-testable). localMeta: the device's
// bookkeeping { rev: last server rev this device is based on, dirty: an unsent toggle
// exists }. remote: the server user row's settings fields (or null when unknown).
// - push: a local toggle must go up; the server rejects it if its rev moved meanwhile
// - adopt: the server holds a newer, explicitly-saved revision - take it wholesale
// - none: in sync, or the server holds only the untouched default (rev 0), which must
//   NEVER wipe a device's real settings
// Apply pending per-topic operations ({ topicId: enabled }) onto a disabled-topics
// list. This is the conflict primitive: instead of a full-list overwrite, a device's
// explicit toggles are rebased onto the server's newer list, so BOTH devices' intents
// survive. enable-all is just ops {every topic: true} -> [] - explicit, never confused
// with the rev-0 default.
export function applyOps(topics, ops) {
  const set = new Set(topics || []);
  Object.entries(ops || {}).forEach(([id, enabled]) => { if (enabled) set.delete(id); else set.add(id); });
  return [...set];
}

export function resolveSettingsSync(localMeta, remote, localIds) {
  const meta = localMeta || { rev: 0, ops: {}, touch: 0 };
  const hasOps = Object.keys(meta.ops || {}).length > 0;
  if (hasOps || meta.dirty) return { type: 'push', baseRev: meta.rev };
  const rRev = remote ? (remote.settingsRev || 0) : 0;
  if (remote && rRev > meta.rev && rRev > 0) {
    return { type: 'adopt', topics: remote.settings || [], rev: rRev };
  }
  // First contact: the server has never saved settings (rev 0). Offer this device's
  // existing settings - but ONLY a non-empty list. An empty local list is ambiguous
  // (deliberate "all enabled" vs never customized), so it must never become the
  // cloud baseline that other devices would then adopt.
  if (rRev === 0 && meta.rev === 0 && (localIds || []).length > 0) {
    return { type: 'push', baseRev: 0 };
  }
  return { type: 'none' };
}
