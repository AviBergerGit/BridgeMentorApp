-- Bridge-Mentor sync schema (username-only, no auth; anon read/write is the accepted tradeoff)

create table if not exists users (
  username text primary key,
  total_answers integer not null default 0,
  total_correct integer not null default 0
);

create table if not exists answers (
  username text not null references users(username),
  question_id text not null,
  correct boolean not null,
  seq_map jsonb not null default '{}'::jsonb,  -- device_id -> last applied device_seq for this question
  updated_at timestamptz not null default now(),
  primary key (username, question_id)
);

create table if not exists events (
  event_id uuid primary key,
  username text not null,
  question_id text not null,
  correct boolean not null,
  device_id text not null,
  device_seq bigint not null,
  received_at timestamptz not null default now()
);

-- RLS stays disabled: the anon key may read/write these tables directly.
-- This matches the approved model: anyone who opens the private link can see/change progress under a name.

create or replace function record_answer(
  p_event_id uuid, p_username text, p_question_id text,
  p_correct boolean, p_device_id text, p_device_seq bigint
) returns json language plpgsql as $$
declare
  is_new boolean;
begin
  insert into users(username) values (p_username) on conflict do nothing;

  insert into events(event_id, username, question_id, correct, device_id, device_seq)
  values (p_event_id, p_username, p_question_id, p_correct, p_device_id, p_device_seq)
  on conflict (event_id) do nothing;
  is_new := found;

  if is_new then
    -- every unique attempt counts exactly once, regardless of freshness gating
    update users
      set total_answers = total_answers + 1,
          total_correct = total_correct + (case when p_correct then 1 else 0 end)
      where username = p_username;

    -- freshness gate for the displayed current answer: per (question, device) high-water mark
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

-- v2 hardening (applied 2026-11-01): record_answer recreated as SECURITY DEFINER;
-- atomic migrate_user RPC (single transaction, first-arrival counter seed via row lock);
-- anon reduced to SELECT on users/answers + EXECUTE on the two RPCs
-- (no INSERT/UPDATE/DELETE on any table; events fully inaccessible).
create or replace function migrate_user(
  p_username text, p_total_answers integer, p_total_correct integer, p_rows jsonb
) returns json language plpgsql security definer set search_path = public as $$
declare
  inserted_count integer;
  final_answers integer;
  final_correct integer;
begin
  -- counter import rule (v4, 2026-11-01): WHOLE-PAIR adoption, never componentwise max.
  -- The (total_answers, total_correct) pair always comes from ONE real source:
  -- the incoming device pair is adopted only when it reports more attempts
  -- (tie: more correct); otherwise the existing pair is kept untouched.
  -- total_answers can never decrease; a displayed success rate always reflects
  -- one actual baseline, never a synthesized mix. Same-device re-import is exact
  -- because that device's totals already include its server-recorded attempts.
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
