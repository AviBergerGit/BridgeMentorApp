-- Topic-settings sync (per-username disabled-topic list).
-- Whole-value per user, server-held revision counter (no wall clocks).
-- save_settings applies ONLY when the caller's base revision matches the stored one,
-- so a device with a stale view can never silently overwrite newer settings; on
-- conflict it returns the current value+rev and the caller adopts it.

alter table public.users add column if not exists disabled_topics jsonb not null default '[]'::jsonb;
alter table public.users add column if not exists settings_rev integer not null default 0;

create or replace function public.save_settings(
  p_username text, p_disabled_topics jsonb, p_base_rev integer
) returns json language plpgsql security definer set search_path = public as $$
declare
  v_rev integer;
  v_topics jsonb;
begin
  -- brand-new name on the server: first writer seeds rev 1
  insert into public.users(username, disabled_topics, settings_rev)
  values (p_username, coalesce(p_disabled_topics, '[]'::jsonb), 1)
  on conflict (username) do nothing;
  if found then
    return json_build_object('applied', true, 'rev', 1);
  end if;

  -- conditional write: only when the caller based its edit on the current revision
  update public.users
    set disabled_topics = coalesce(p_disabled_topics, '[]'::jsonb),
        settings_rev = settings_rev + 1
    where username = p_username and settings_rev = p_base_rev
    returning settings_rev into v_rev;
  if found then
    return json_build_object('applied', true, 'rev', v_rev);
  end if;

  -- stale base: no write; return current state so the caller adopts it
  select settings_rev, disabled_topics into v_rev, v_topics
    from public.users where username = p_username;
  return json_build_object('applied', false, 'rev', v_rev, 'topics', coalesce(v_topics, '[]'::jsonb));
end $$;
