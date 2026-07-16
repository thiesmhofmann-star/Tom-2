-- Tom — Workspace-Datenspeicher (ersetzt localStorage aus dem Artifact)
-- In Supabase: SQL Editor → dieses Skript ausführen.

create table if not exists public.workspace_data (
  user_id    uuid not null references auth.users(id) on delete cascade,
  key        text not null,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.workspace_data enable row level security;

-- Jede Person sieht/ändert ausschließlich die eigenen Zeilen
drop policy if exists "own rows - select" on public.workspace_data;
create policy "own rows - select" on public.workspace_data
  for select using (auth.uid() = user_id);

drop policy if exists "own rows - insert" on public.workspace_data;
create policy "own rows - insert" on public.workspace_data
  for insert with check (auth.uid() = user_id);

drop policy if exists "own rows - update" on public.workspace_data;
create policy "own rows - update" on public.workspace_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows - delete" on public.workspace_data;
create policy "own rows - delete" on public.workspace_data
  for delete using (auth.uid() = user_id);
