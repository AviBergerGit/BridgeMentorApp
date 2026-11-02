-- Admin user deletion with tombstone.
-- Admin = caller whose verified Supabase Auth email is listed in public.admins.
-- Ordinary name-only sync (anon key) is unchanged, except that the three sync RPCs
-- refuse tombstoned names so a deleted user cannot be resurrected by an old device.

create table if not exists public.admins (
  email text primary key
);
-- Add the administrator's verified email to this table before enabling admin access.

create table if not exists public.deleted_users (
  username text primary key,
  deleted_at timestamptz not null default now(),
  deleted_by text
);
-- no table grants to anon/authenticated: both tables are unreachable through the API

create or replace function public.is_admin() returns boolean
language plpgsql stable security definer set search_path = public as $$
begin
  return exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
end $$;
revoke all on function public.is_admin() from public, anon, authenticated;

-- Admin-only deletion. One transaction: answers + events + user row out, tombstone in.
-- Idempotent: deleting an unknown or already-deleted name succeeds the same way.
create or replace function public.delete_user(p_username text)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_username is null or btrim(p_username) = '' then
    raise exception 'username_required' using errcode = '22023';
  end if;
  delete from public.answers where username = p_username;
  delete from public.events where username = p_username;
  delete from public.users where username = p_username;
  insert into public.deleted_users(username, deleted_by)
  values (p_username, lower(coalesce(auth.jwt() ->> 'email', '')))
  on conflict (username) do update set deleted_at = now(), deleted_by = excluded.deleted_by;
  return json_build_object('deleted', p_username);
end $$;
revoke all on function public.delete_user(text) from public, anon;
grant execute on function public.delete_user(text) to authenticated;

-- Tombstone guards on the three sync RPCs (bodies unchanged otherwise).
-- They answer 200 with {"user_deleted": true}: old clients simply drop the attempt
-- without recreating the user; new clients purge their local copy of the name.

create or replace function public.record_answer(
  p_event_id uuid, p_username text, p_question_id text,
  p_correct boolean, p_device_id text, p_device_seq bigint
) returns json language plpgsql security definer set search_path = public as $$
declare
  is_new boolean;
begin
  if exists (select 1 from public.deleted_users where username = p_username) then
    return json_build_object('counted', false, 'user_deleted', true);
  end if;

  insert into users(username) values (p_username) on conflict do nothing;

  insert into events(event_id, username, question_id, correct, device_id, device_seq)
  values (p_event_id, p_username, p_question_id, p_correct, p_device_id, p_device_seq)
  on conflict (event_id) do nothing;
  is_new := found;

  if is_new then
    update users
      set total_answers = total_answers + 1,
          total_correct = total_correct + (case when p_correct then 1 else 0 end)
      where username = p_username;

    insert into answers(username, question_id, correct, seq_map)
    values (p_username, p_question_id, p_correct, jsonb_build_object(p_device_id, p_device_seq))
    on conflict (username, question_id) do update
      set correct = excluded.correct,
          updated_at = now(),
          seq_map = answers.seq_map || excluded.seq_map
      where coalesce((answers.seq_map ->> p_device_id)::bigint, -1) < p_device_seq;
  end if;

  return json_build_object('counted', is_new);
end $$;

create or replace function public.migrate_user(
  p_username text, p_total_answers integer, p_total_correct integer, p_rows jsonb
) returns json language plpgsql security definer set search_path = public as $$
declare
  inserted_count integer;
  final_answers integer;
  final_correct integer;
begin
  if exists (select 1 from public.deleted_users where username = p_username) then
    return json_build_object('migrated', false, 'user_deleted', true);
  end if;

  insert into users(username, total_answers, total_correct)
  values (p_username, greatest(0, p_total_answers), greatest(0, p_total_correct))
  on conflict (username) do update
    set total_answers = case when excluded.total_answers > users.total_answers
                              or (excluded.total_answers = users.total_answers and excluded.total_correct > users.total_correct)
                             then excluded.total_answers else users.total_answers end,
        total_correct = case when excluded.total_answers > users.total_answers
                              or (excluded.total_answers = users.total_answers and excluded.total_correct > users.total_correct)
                             then excluded.total_correct else users.total_correct end
  returning total_answers, total_correct into final_answers, final_correct;

  insert into answers(username, question_id, correct)
  select p_username, r->>'question_id', (r->>'correct')::boolean
  from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb)) r
  on conflict (username, question_id) do nothing;
  get diagnostics inserted_count = row_count;

  return json_build_object('total_answers', final_answers, 'total_correct', final_correct, 'answers_inserted', inserted_count);
end $$;

create or replace function public.save_settings(
  p_username text, p_disabled_topics jsonb, p_base_rev integer
) returns json language plpgsql security definer set search_path = public as $$
declare
  v_rev integer;
  v_topics jsonb;
begin
  if exists (select 1 from public.deleted_users where username = p_username) then
    return json_build_object('applied', false, 'user_deleted', true);
  end if;

  insert into public.users(username, disabled_topics, settings_rev)
  values (p_username, coalesce(p_disabled_topics, '[]'::jsonb), 1)
  on conflict (username) do nothing;
  if found then
    return json_build_object('applied', true, 'rev', 1);
  end if;

  update public.users
    set disabled_topics = coalesce(p_disabled_topics, '[]'::jsonb),
        settings_rev = settings_rev + 1
    where username = p_username and settings_rev = p_base_rev
    returning settings_rev into v_rev;
  if found then
    return json_build_object('applied', true, 'rev', v_rev);
  end if;

  select settings_rev, disabled_topics into v_rev, v_topics
    from public.users where username = p_username;
  return json_build_object('applied', false, 'rev', v_rev, 'topics', coalesce(v_topics, '[]'::jsonb));
end $$;
