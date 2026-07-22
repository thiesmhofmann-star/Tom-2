-- Tom — Feedback pro Modul
-- In Supabase bereits ausgeführt; hier zur Nachvollziehbarkeit im Repository.

create table if not exists public.feedback (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  module     text not null,
  rating     text not null check (rating in ('up','down')),
  reason     text,
  comment    text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created on public.feedback (created_at desc);

alter table public.feedback enable row level security;

drop policy if exists "feedback own - insert" on public.feedback;
create policy "feedback own - insert" on public.feedback
  for insert with check (auth.uid() = user_id);

drop policy if exists "feedback own - select" on public.feedback;
create policy "feedback own - select" on public.feedback
  for select using (auth.uid() = user_id);

drop policy if exists "feedback own - update" on public.feedback;
create policy "feedback own - update" on public.feedback
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
