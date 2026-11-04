import React from 'react';
import { useLocalState } from '@instinct/files';
import './style.css';
// @ts-ignore
import Mentor from './Mentor.jsx';
// @ts-ignore
import { QUESTIONS } from './mentor/data/index.js';
// @ts-ignore
import { makeEvent, loadUser, migrateUser, flushQueue, mergeRemoteStats, onSyncChange, onUserDeleted, saveSettings, resolveSettingsSync, applyOps } from './mentor/lib/sync.js';

type UserStats = { answered: Record<string, { correct: boolean }>; totalAnswers: number; totalCorrect: number };
type StatsData = { current: string | null; users: Record<string, UserStats> };
type SyncEvent = { p_event_id: string; p_username: string; p_question_id: string; p_correct: boolean; p_device_id: string; p_device_seq: number };

const EMPTY_DATA: StatsData = { current: null, users: {} };
const EMPTY_USER: UserStats = { answered: {}, totalAnswers: 0, totalCorrect: 0 };
// Deterministic demo progress for screenshot/deep-link previews of the topic
// list (#group-demo / #topics-demo): mixed correct/wrong/unanswered, local only.
const DEMO_STATS: UserStats = (() => {
    const answered: Record<string, { correct: boolean }> = {};
    let totalAnswers = 0, totalCorrect = 0;
    QUESTIONS.forEach((q: any, i: number) => {
        if (i % 5 === 4) return;
        const correct = i % 4 !== 3;
        answered[q.id] = { correct };
        totalAnswers++; if (correct) totalCorrect++;
    });
    return { answered, totalAnswers, totalCorrect };
})();

// Isolated read-only exercise preview. No cloud or persistence hooks are mounted.
export function App() {
    let route = "";
    try {
        const w = (globalThis as any).window;
        route = decodeURIComponent(w?.instinctFile?.initialRoute || w?.location?.hash || "").replace(/^[#/]+/, "");
        if (route.startsWith("?")) route = new URLSearchParams(route).get("route") || "";
        if (!route || route.startsWith("file-preview")) route = new URLSearchParams(w?.location?.search || "").get("route") || "";
    } catch { /* no route */ }
    if (route.startsWith("q-")) return <div className="bm-host"><div className="bm-strip" aria-hidden="true" /><Mentor stats={EMPTY_USER} users={{}} current={null} setStats={() => {}} recordAnswer={() => {}} selectUser={() => {}} /></div>;
    return <LiveApp />;
}
function LiveApp() {
    const [data, setData, saved] = useLocalState<StatsData>('bm-stats-v2', EMPTY_DATA);
    const [preferences, setPreferences, preferenceSaved] = useLocalState<Record<string, string[]>>('bm-topics-v1', {});
    type PrefMeta = { rev: number; ops: Record<string, boolean>; touch: number; dirty?: boolean };
    const [prefMeta, setPrefMeta] = useLocalState<Record<string, PrefMeta>>('bm-topics-meta-v1', {});
    // Sync metadata. The hosted iframe is sandboxed (no localStorage), so these live in
    // platform per-device storage like the stats themselves.
    const [deviceId, setDeviceId] = useLocalState<string>('bm-device-id', '');
    const [seq, setSeq] = useLocalState<number>('bm-device-seq', 0);
    const [queue, setQueue] = useLocalState<SyncEvent[]>('bm-sync-queue-v1', []);
    const [migrated, setMigrated] = useLocalState<string[]>('bm-migrated-v1', []);
    const [backups, setBackups] = useLocalState<Record<string, { date: string; stats: UserStats }>>('bm-backups-v1', {});
    const [sync, setSync] = React.useState({ status: 'synced', pending: 0 });
    const [deletedNotice, setDeletedNotice] = React.useState<string | null>(null);

    // The admin deleted this name in the cloud (server tombstoned it): drop every
    // local trace - stats, settings, migration flag, queued events - and stop
    // syncing it. Without this the next open would migrate the local copy back.
    const purgeUser = (name: string) => {
        const d = dataRef.current;
        const u = { ...(d.users || {}) }; delete u[name];
        setData({ ...d, users: u, current: d.current === name ? null : d.current });
        const p = { ...(prefRef.current || {}) }; delete p[name]; setPreferences(p);
        const pm = { ...(prefMetaRef.current || {}) }; delete pm[name]; prefMetaRef.current = pm; setPrefMeta(pm);
        setMigrated(migratedRef.current.filter(n => n !== name));
        queueRef.current = queueRef.current.filter(e => e.p_username !== name); setQueue(queueRef.current);
        setDeletedNotice(name);
    };
    React.useEffect(() => onUserDeleted(purgeUser), []);

    // Ref mirrors so event handlers always see the latest values without waiting for a render.
    const queueRef = React.useRef(queue); queueRef.current = queue;
    const seqRef = React.useRef(seq); seqRef.current = seq;
    const devRef = React.useRef(deviceId); devRef.current = deviceId;
    const dataRef = React.useRef(data); dataRef.current = data;
    const prefRef = React.useRef(preferences); prefRef.current = preferences;
    const prefMetaRef = React.useRef(prefMeta); prefMetaRef.current = prefMeta;
    const migratedRef = React.useRef(migrated); migratedRef.current = migrated;
    const backupsRef = React.useRef(backups); backupsRef.current = backups;

    const removeEvent = (id: string) => {
        queueRef.current = queueRef.current.filter(e => e.p_event_id !== id);
        setQueue(queueRef.current);
    };

    // Full server sync for one name, safe to run on ordinary reopen AND on name select:
    // 1) best-effort flush of the offline queue, so the server already knows this
    //    device's latest attempts before we compare or pull
    // 2) pull server state; if this device holds progress the server is missing
    //    (counters ahead, or answered questions the server has no rows for), import it
    //    via the atomic migrate_user RPC. The 'migrated' flag is advisory only - the
    //    server comparison is the real gate, so a stale flag can never skip data.
    //    The FIRST local snapshot is kept in a read-only backup key before migrating.
    // 3) re-pull and merge: server wins per question, still-queued attempts overlay,
    //    and displayed counters never decrease.
    // Any failure (offline etc.) leaves local state untouched; sync retries later.
    // Topic-settings sync. Every toggle marks the name dirty and queues a conditional
    // push (base rev must match the server's, else the server returns its current value
    // and we adopt it - a stale device never silently overwrites newer settings).
    // Pushes are chained per name so rapid toggles serialize; a toggle that lands while
    // a push is in flight stays dirty and is pushed right after.
    const settingsChain = React.useRef<Record<string, Promise<void>>>({});
    // Push pending per-topic ops with rebase-on-conflict: when the server holds a
    // newer revision, the pending toggles are replayed ONTO the server's list and
    // the push retries from the new base - both devices' intents survive, and an
    // explicit toggle is never silently discarded. Bounded attempts; whatever is
    // still pending stays in ops and retries on the next sync.
    const pushSettings = (name: string) => {
        settingsChain.current[name] = (settingsChain.current[name] || Promise.resolve()).then(async () => {
            let attempts = 0;
            // The list and rev travel as loop locals: prefRef/preferences re-render
            // asynchronously, so re-reading them between retries can go stale and push
            // a superseded list over the server's (found in e2e: wiped a conflict list).
            let ids = [...(((prefRef.current || {})[name]) || [])];
            while (attempts++ < 4) {
                const meta = (prefMetaRef.current || {})[name] || { rev: 0, ops: {}, touch: 0 };
                let ops = meta.ops || {};
                if (!Object.keys(ops).length && meta.dirty) {
                    // legacy meta from the rev/dirty model: the intent was "push my full
                    // list" - reconstruct it as disable-ops over the current list
                    ops = {};
                    ids.forEach(id => { ops[id] = false; });
                }
                if (!Object.keys(ops).length) return;
                const t = meta.touch || 0;
                let r: any = null;
                try { r = await saveSettings(name, ids, meta.rev); } catch { return; /* offline: ops stay */ }
                if (r && r.user_deleted) { purgeUser(name); return; }
                const mm = { ...(prefMetaRef.current || {}) };
                const latest = mm[name] || { rev: 0, ops: {}, touch: 0 };
                if (r && r.applied) {
                    const newerOps = latest.touch !== t ? (latest.ops || {}) : {};
                    mm[name] = { rev: r.rev, ops: newerOps, touch: latest.touch };
                    prefMetaRef.current = mm; setPrefMeta(mm);
                    if (Object.keys(newerOps).length) continue;
                    return;
                }
                if (r) {
                    const mergedOps = latest.touch !== t ? { ...ops, ...(latest.ops || {}) } : ops;
                    ids = applyOps(r.topics || [], mergedOps);
                    setPreferences({ ...prefRef.current, [name]: ids });
                    mm[name] = { rev: r.rev, ops: mergedOps, touch: latest.touch };
                    prefMetaRef.current = mm; setPrefMeta(mm);
                    continue; // retry from the server's revision with the rebased list
                }
                return;
            }
        });
    };
    const setDisabledTopicsFor = (name: string, ids: string[]) => {
        const before = (prefRef.current || {})[name] || [];
        setPreferences({ ...prefRef.current, [name]: ids });
        // translate the full-list edit into per-topic ops so conflicts can rebase
        const changed: Record<string, boolean> = {};
        Array.from(new Set([...before, ...ids])).forEach(id => {
            const wasOff = before.includes(id), isOff = ids.includes(id);
            if (wasOff !== isOff) changed[id] = !isOff;
        });
        const m = { ...(prefMetaRef.current || {}) };
        const cur = m[name] || { rev: 0, ops: {}, touch: 0 };
        m[name] = { rev: cur.rev, ops: { ...(cur.ops || {}), ...changed }, touch: (cur.touch || 0) + 1 };
        prefMetaRef.current = m; setPrefMeta(m);
        pushSettings(name);
    };

    const syncUser = (name: string) => {
        (async () => {
            try {
                await flushQueue(queueRef, removeEvent);
                let remote = await loadUser(name);
                const local = (dataRef.current.users || {})[name];
                const hasLocal = local && (Object.keys(local.answered || {}).length || local.totalAnswers);
                const missingOnServer = hasLocal && remote
                    ? Object.keys(local.answered || {}).filter(q => !(remote.answered || {})[q])
                    : [];
                if (hasLocal && (!remote || remote.totalAnswers < (local.totalAnswers || 0) || missingOnServer.length)) {
                    if (!backupsRef.current[name]) setBackups({ ...backupsRef.current, [name]: { date: new Date().toISOString().slice(0, 10), stats: local } });
                    const mig = await migrateUser(name, local);
                    if (mig && mig.user_deleted) { purgeUser(name); return; }
                    if (!migratedRef.current.includes(name)) setMigrated([...migratedRef.current, name]);
                    remote = await loadUser(name);
                }
                if (!remote) return;
                setData(prev => {
                    const u = prev.users || {};
                    const cur = u[name] || EMPTY_USER;
                    const pending = queueRef.current.filter(e => e.p_username === name);
                    return { ...prev, users: { ...u, [name]: mergeRemoteStats(cur, remote, pending) } };
                });
                // settings: flush any unsent local toggle, then adopt the server's
                // settings only when they carry a newer explicitly-saved revision.
                try {
                    const meta0 = (prefMetaRef.current || {})[name] || { rev: 0, ops: {}, touch: 0 };
                    const step0 = resolveSettingsSync(meta0, remote, (prefRef.current || {})[name] || []);
                    if (step0.type === 'push' && !Object.keys(meta0.ops || {}).length && !meta0.dirty) {
                        // first contact: offer this device's existing settings to an empty
                        // server as disable-ops, so a conflicting first offer from another
                        // device rebases into a union instead of one side winning outright
                        const ids = (prefRef.current || {})[name] || [];
                        const ops: Record<string, boolean> = {};
                        ids.forEach(id => { ops[id] = false; });
                        const mm0 = { ...(prefMetaRef.current || {}) };
                        mm0[name] = { rev: 0, ops, touch: (meta0.touch || 0) + 1 };
                        prefMetaRef.current = mm0; setPrefMeta(mm0);
                    }
                    pushSettings(name);
                    await (settingsChain.current[name] || Promise.resolve());
                    const meta2 = (prefMetaRef.current || {})[name] || { rev: 0, ops: {}, touch: 0 };
                    const step = resolveSettingsSync(meta2, remote, (prefRef.current || {})[name] || []);
                    if (step.type === 'adopt' && step.topics) {
                        setPreferences({ ...prefRef.current, [name]: step.topics });
                        const mm = { ...(prefMetaRef.current || {}) };
                        const prevMeta = mm[name] || { rev: 0, ops: {}, touch: 0 };
                        mm[name] = { rev: step.rev || 0, ops: {}, touch: prevMeta.touch };
                        prefMetaRef.current = mm; setPrefMeta(mm);
                    }
                } catch { /* settings sync failure leaves local settings untouched */ }
            } catch { /* offline: local copy keeps working, sync retries later */ }
        })();
    };

    React.useEffect(() => onSyncChange(setSync), []);
    React.useEffect(() => { if (saved.ready) flushQueue(queueRef, removeEvent); }, [saved.ready]);
    React.useEffect(() => {
        const h = () => flushQueue(queueRef, removeEvent);
        window.addEventListener('online', h);
        return () => window.removeEventListener('online', h);
    }, []);

    // Ordinary reopen: once local state is hydrated and a current user exists, refresh
    // that user's progress from the server (migration-safe, queue-preserving). Runs once
    // per app load; name selection/switch syncs through selectUser.
    const reopenSynced = React.useRef(false);
    React.useEffect(() => {
        if (!saved.ready || reopenSynced.current) return;
        const cur = dataRef.current.current;
        if (cur && (dataRef.current.users || {})[cur]) {
            reopenSynced.current = true;
            syncUser(cur);
        }
    }, [saved.ready, data.current]);

    // Dev/static-render affordance: admin + settings deep-link routes render with a
    // demo user even before local state hydrates (hosted app always gets route "/").
    const routeParam = (() => { try { return new URLSearchParams((globalThis as any).window?.location?.search || "").get("route") || ""; } catch { return ""; } })();
    const routeHash = ((((globalThis as any).window?.instinctFile?.initialRoute) || routeParam || ((globalThis as any).window?.location?.hash) || "")).replace(/^[#/]+/, "");
    const demoStatsRoute = routeHash === "group-demo" || routeHash === "topics-demo";
    const demoRoute = routeHash === "settings" || routeHash === "players" || routeHash.startsWith("admin") || demoStatsRoute;
    if (!preferenceSaved.ready || !saved.ready) {
        if (!demoRoute) return <div style={{ padding: 24, textAlign: 'center' }}>טוען…</div>;
    }
    const users = demoRoute && !Object.keys(data.users || {}).length ? (demoStatsRoute ? { "בדיקה": DEMO_STATS } : { "אבי": EMPTY_USER }) : (data.users || {});
    const current = data.current && users[data.current] ? data.current : (demoStatsRoute ? "בדיקה" : (demoRoute ? "אבי" : null));
    const stats = current ? (users[current] || EMPTY_USER) : EMPTY_USER;
    const setStats = (ns: UserStats) => { if (current) setData({ ...data, users: { ...users, [current]: ns } }); };
    const recordAnswer = (qid: string, ok: boolean) => {
        if (!current) return;
        const ns: UserStats = { ...stats, totalAnswers: stats.totalAnswers + 1, totalCorrect: stats.totalCorrect + (ok ? 1 : 0), answered: { ...stats.answered, [qid]: { correct: ok } } };
        setStats(ns);
        let dev = devRef.current;
        if (!dev) { dev = crypto.randomUUID(); devRef.current = dev; setDeviceId(dev); }
        const s = seqRef.current + 1; seqRef.current = s; setSeq(s);
        const ev = makeEvent(current, qid, ok, dev, s);
        queueRef.current = [...queueRef.current, ev]; setQueue(queueRef.current);
        flushQueue(queueRef, removeEvent);
    };
    const selectUser = (name: string) => {
        const n = name.trim().slice(0, 20); if (!n) return;
        setData({ current: n, users: users[n] ? users : { ...users, [n]: EMPTY_USER } });
        syncUser(n);
    };
    return <>
        <div className="bm-host">
            <div className="bm-strip" aria-hidden="true" />
            {/* demo renders inject the real configured topics: cloud settings_rev 7 has t53,t19 disabled */}
            <Mentor deletedNotice={deletedNotice} clearDeletedNotice={() => setDeletedNotice(null)} disabledTopics={demoRoute ? ["t53", "t19"] : (preferences[current || ""] || [])} setDisabledTopics={(ids: string[]) => { if (current) setDisabledTopicsFor(current, ids); }} preferenceMessage={preferenceSaved.message} storageStatus={saved.status} stats={stats} setStats={setStats} recordAnswer={recordAnswer} users={users} current={current} selectUser={selectUser} sync={sync} />
        </div>
        {saved.message ? <div style={{ fontSize: 12, textAlign: 'center', padding: 8 }}>{saved.message}</div> : null}
    </>;
}
