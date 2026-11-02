// Admin (user-management) API: fixed admin password, no email.
// Server-side bcrypt verification + lockout (5 failures -> 15 min) + 30-minute
// session tokens (supabase/admin-v4-password.sql). This RPC path is the ONLY
// admin sign-in path - Supabase password auth is unused and grants nothing.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

const baseHeaders = {
  'apikey': SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
};

async function rpc(fn, body) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + fn, {
    method: 'POST', headers: baseHeaders, body: JSON.stringify(body),
  });
  if (!res.ok) { const err = new Error('rpc failed'); err.status = res.status; throw err; }
  return res.json();
}

// { status:'ok', token, expires_at } | { status:'invalid', attempts_left } |
// { status:'locked', retry_after_seconds } | { status:'not_configured' }
export async function adminSignIn(password) {
  return rpc('admin_sign_in', { p_password: password });
}

// One-time, key-gated enrollment of the first admin password (operator only).
export async function adminBootstrapPassword(password, setupKey) {
  return rpc('admin_bootstrap_password', { p_password: password, p_setup_key: setupKey });
}

export async function adminSignOut(token) {
  return rpc('admin_sign_out', { p_token: token });
}

// Server-enforced deletion with tombstone. The server also refuses to delete
// the name the requester is currently using (self-delete block).
export async function adminDeleteUser(token, username, currentUsername) {
  const j = await rpc('delete_user', { p_username: username, p_token: token, p_current_username: currentUsername });
  return { ok: !!j.deleted, selfBlocked: !!j.self_delete_blocked };
}

// Cloud user list with per-name answered/correct counts. Token-gated:
// a non-admin has no way to see the other users.
export async function listCloudUsers(token) {
  const rows = await rpc('admin_list_users', { p_token: token });
  return (rows || []).map(r => ({ name: r.username, answered: r.total_answers || 0, correct: r.total_correct || 0 }));
}
