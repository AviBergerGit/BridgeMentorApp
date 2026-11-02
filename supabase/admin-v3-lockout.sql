-- admin-v3-lockout.sql: server-enforced failed-attempt lockout on the real auth endpoint
-- via Supabase Password Verification Hook. 5 failures -> 15 min lock; success resets.
begin;

create table if not exists public.admin_password_failures (
  user_id uuid primary key,
  failures integer not null default 0,
  locked_until timestamptz
);

revoke all on public.admin_password_failures from authenticated, anon, public;
grant all on public.admin_password_failures to supabase_auth_admin;

create or replace function public.hook_admin_password_lockout(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (event->>'user_id')::uuid;
  v_valid boolean := coalesce((event->>'valid')::boolean, false);
  v_locked_until timestamptz;
  v_failures integer;
  v_max constant integer := 5;
  v_lock constant interval := interval '15 minutes';
begin
  select locked_until into v_locked_until
    from public.admin_password_failures where user_id = v_user;

  if v_locked_until is not null and v_locked_until > now() then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 429,
        'message', 'Too many failed attempts. Try again later.'
      )
    );
  end if;

  if v_valid then
    delete from public.admin_password_failures where user_id = v_user;
    return jsonb_build_object('decision', 'continue');
  end if;

  insert into public.admin_password_failures (user_id, failures, locked_until)
  values (v_user, 1, null)
  on conflict (user_id) do update
    set failures = admin_password_failures.failures + 1
  returning failures into v_failures;

  if v_failures >= v_max then
    update public.admin_password_failures
      set locked_until = now() + v_lock, failures = 0
      where user_id = v_user;
  end if;

  return jsonb_build_object('decision', 'continue');
end;
$$;

revoke all on function public.hook_admin_password_lockout(jsonb) from authenticated, anon, public;
grant execute on function public.hook_admin_password_lockout(jsonb) to supabase_auth_admin;

commit;
