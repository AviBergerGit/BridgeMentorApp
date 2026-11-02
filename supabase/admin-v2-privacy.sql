-- Non-admins must not see other users.
-- Enumeration of users becomes admin-only; per-name reads stay open because
-- name-only login already lets anyone who knows a name open it.

-- Admin-only user list for the management screen.
create or replace function public.admin_list_users()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  return coalesce((
    select json_agg(row_to_json(t) order by t.answered desc, t.username) from (
      select u.username,
        (select count(*) from public.answers a where a.username = u.username)::int as answered,
        (select count(*) from public.answers a where a.username = u.username and a.correct)::int as correct,
        u.total_answers, u.total_correct
      from public.users u
    ) t
  ), '[]'::json);
end $$;
revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

-- Per-name state read (replaces direct table SELECTs by sync clients).
-- Equivalent exposure to name-only login: returns one named user's own data.
create or replace function public.get_user_state(p_username text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'total_answers', u.total_answers,
    'total_correct', u.total_correct,
    'disabled_topics', u.disabled_topics,
    'settings_rev', u.settings_rev,
    'answers', coalesce((
      select json_agg(json_build_object('question_id', a.question_id, 'correct', a.correct))
      from public.answers a where a.username = p_username
    ), '[]'::json)
  )
  from public.users u where u.username = p_username;
$$;
grant execute on function public.get_user_state(text) to anon, authenticated;

-- RELEASE GATE - APPLIED 2026-11-02 with the published password-admin build:
revoke select on public.users from anon, authenticated;
revoke select on public.answers from anon, authenticated;
-- Note: revoking breaks sync in old emailed 1.3.1 copies; hosted app must be current.
