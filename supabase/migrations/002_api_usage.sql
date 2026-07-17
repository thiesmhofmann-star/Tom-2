-- Tom — Nutzungszähler für das API-Limit pro Nutzer.
-- In Supabase: SQL Editor → dieses Skript ausführen (nach 001_init.sql).

create table if not exists public.api_usage (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists api_usage_user_time on public.api_usage (user_id, created_at);

alter table public.api_usage enable row level security;

-- Jede Person sieht/schreibt/löscht ausschließlich die eigenen Zeilen
drop policy if exists "api_usage own - select" on public.api_usage;
create policy "api_usage own - select" on public.api_usage
  for select using (auth.uid() = user_id);

drop policy if exists "api_usage own - insert" on public.api_usage;
create policy "api_usage own - insert" on public.api_usage
  for insert with check (auth.uid() = user_id);

drop policy if exists "api_usage own - delete" on public.api_usage;
create policy "api_usage own - delete" on public.api_usage
  for delete using (auth.uid() = user_id);
