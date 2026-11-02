-- admin-v4-password.sql: fixed admin password without email.
-- Fixed admin password with failed-attempt lockout.
-- All admin capability flows through these RPCs: server-side bcrypt verification
-- (pgcrypto) + server-enforced lockout (5 failures -> 15 min) + 30-min admin session
-- tokens. Supabase password sign-in is not used and grants no admin power, so there
-- is no path around the lockout. Enrollment is one-time and key-gated (operator-only,
-- never public first-writer-wins).
begin;

-- single-row credential store; hash seeded once via key-gated bootstrap
create table if not exists public.admin_auth (
  id smallint primary key default 1 check (id = 1),
  password_hash text not null
);
revoke all on public.admin_auth from public, anon, authenticated;

-- one-time enrollment key, known only to the operator (read from the dashboard
-- once at apply time, used once from the setup screen, deleted on success)
create table if not exists public.admin_setup (
  id smallint primary key default 1 check (id = 1),
  setup_key uuid not null default gen_random_uuid()
);
revoke all on public.admin_setup from public, anon, authenticated;
insert into public.admin_setup(id) values (1)
on conflict (id) do update set setup_key = gen_random_uuid();

-- lockout counter (single row); replaces the uuid-keyed v3 table
drop table if exists public.admin_password_failures;
create table public.admin_password_failures (
  id smallint primary key default 1 check (id = 1),
  failures integer not null default 0,
  locked_until timestamptz
);
revoke all on public.admin_password_failures from public, anon, authenticated;

-- short-lived admin sessions
create table if not exists public.admin_sessions (
  token uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
revoke all on public.admin_sessions from public, anon, authenticated;

-- internal: current valid token?
create or replace function public.admin_token_valid(p_token uuid) returns boolean
language plpgsql stable security definer set search_path = public, extensions as $$
begin
  return exists (select 1 from public.admin_sessions
                 where token = p_token and expires_at > now());
end $$;
revoke all on function public.admin_token_valid(uuid) from public, anon, authenticated;

-- one-time, key-gated enrollment; closes forever once a password exists
create or replace function public.admin_bootstrap_password(p_password text, p_setup_key uuid)
returns json language plpgsql security definer set search_path = public, extensions as $$
begin
  if exists (select 1 from public.admin_auth) then
    return json_build_object('status', 'already_configured');
  end if;
  if not exists (select 1 from public.admin_setup where id = 1 and setup_key = p_setup_key) then
    return json_build_object('status', 'not_allowed');
  end if;
  if p_password is null or length(p_password) < 10 then
    return json_build_object('status', 'too_short');
  end if;
  insert into public.admin_auth(id, password_hash)
  values (1, crypt(p_password, gen_salt('bf')));
  delete from public.admin_setup where id = 1; -- key is single-use
  return json_build_object('status', 'ok');
end $$;
revoke all on function public.admin_bootstrap_password(text, uuid) from public;
grant execute on function public.admin_bootstrap_password(text, uuid) to anon, authenticated;

-- the ONLY sign-in path. Lockout enforced here, before verification; the
-- failures-row update serializes concurrent attempts on one row lock.
create or replace function public.admin_sign_in(p_password text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare
  v_locked_until timestamptz;
  v_failures integer;
  v_token uuid;
  v_expires timestamptz;
begin
  if not exists (select 1 from public.admin_auth) then
    return json_build_object('status', 'not_configured');
  end if;

  select locked_until into v_locked_until from public.admin_password_failures where id = 1;
  if v_locked_until is not null and v_locked_until > now() then
    return json_build_object('status', 'locked',
      'retry_after_seconds', extract(epoch from (v_locked_until - now()))::int);
  end if;

  if coalesce((select password_hash = crypt(coalesce(p_password, ''), password_hash)
               from public.admin_auth where id = 1), false) then
    delete from public.admin_password_failures where id = 1;
    delete from public.admin_sessions where expires_at <= now();
    insert into public.admin_sessions(expires_at)
    values (now() + interval '30 minutes')
    returning token, expires_at into v_token, v_expires;
    return json_build_object('status', 'ok', 'token', v_token, 'expires_at', v_expires);
  end if;

  insert into public.admin_password_failures(id, failures)
  values (1, 1)
  on conflict (id) do update set failures = admin_password_failures.failures + 1
  returning failures into v_failures;
  if v_failures >= 5 then
    update public.admin_password_failures
      set locked_until = now() + interval '15 minutes', failures = 0 where id = 1;
    return json_build_object('status', 'locked', 'retry_after_seconds', 900);
  end if;
  return json_build_object('status', 'invalid', 'attempts_left', 5 - v_failures);
end $$;
revoke all on function public.admin_sign_in(text) from public;
grant execute on function public.admin_sign_in(text) to anon, authenticated;

-- optional explicit sign-out
create or replace function public.admin_sign_out(p_token uuid)
returns json language plpgsql security definer set search_path = public, extensions as $$
begin
  delete from public.admin_sessions where token = p_token;
  return json_build_object('status', 'ok');
end $$;
revoke all on function public.admin_sign_out(uuid) from public;
grant execute on function public.admin_sign_out(uuid) to anon, authenticated;

-- admin user list: token-gated (replaces the JWT version)
create or replace function public.admin_list_users(p_token uuid)
returns table(username text, total_answers integer, total_correct integer)
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.admin_token_valid(p_token) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  return query
    select u.username, u.total_answers, u.total_correct
    from public.users u order by u.username;
end $$;
revoke all on function public.admin_list_users(uuid) from public;
grant execute on function public.admin_list_users(uuid) to anon, authenticated;

-- deletion: token-gated; server refuses to delete the name the requester is
-- currently using (self-delete block, Avi's approved scope); tombstone records
-- 'admin' (no identity on screens)
create or replace function public.delete_user(p_username text, p_token uuid, p_current_username text)
returns json language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.admin_token_valid(p_token) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_username is null or btrim(p_username) = '' then
    raise exception 'username_required' using errcode = '22023';
  end if;
  -- server-authoritative protection of the owner identity: 'אבי' can never be
  -- deleted through this RPC, regardless of the caller-supplied current username.
  if lower(btrim(p_username)) = lower('אבי') then
    return json_build_object('deleted', null, 'protected_user', true);
  end if;
  -- UX guard: also block deleting the name the admin device is currently using.
  if lower(btrim(p_username)) = lower(btrim(coalesce(p_current_username, ''))) then
    return json_build_object('deleted', null, 'self_delete_blocked', true);
  end if;
  delete from public.answers where username = p_username;
  delete from public.events where username = p_username;
  delete from public.users where username = p_username;
  insert into public.deleted_users(username, deleted_by)
  values (p_username, 'admin')
  on conflict (username) do update set deleted_at = now(), deleted_by = 'admin';
  return json_build_object('deleted', p_username);
end $$;
revoke all on function public.delete_user(text, uuid, text) from public;
grant execute on function public.delete_user(text, uuid, text) to anon, authenticated;

-- remove every old JWT-based admin route: the old signatures, the is_admin
-- helper, the email allowlist table, and the unused (plan-blocked) hook function
drop function if exists public.delete_user(text);
drop function if exists public.admin_list_users();
drop function if exists public.is_admin();
drop function if exists public.hook_admin_password_lockout(jsonb);
drop table if exists public.admins;

commit;
