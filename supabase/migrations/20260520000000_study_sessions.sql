create extension if not exists pgcrypto;

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  topic_category text not null default 'General',
  last_message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.uploaded_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.study_sessions(id) on delete set null,
  file_name text not null,
  file_type text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists study_sessions_user_id_updated_at_idx on public.study_sessions (user_id, updated_at desc);
create index if not exists study_messages_session_id_created_at_idx on public.study_messages (session_id, created_at asc);
create index if not exists study_messages_user_id_created_at_idx on public.study_messages (user_id, created_at desc);
create index if not exists uploaded_materials_user_id_created_at_idx on public.uploaded_materials (user_id, created_at desc);

alter table public.study_sessions enable row level security;
alter table public.study_messages enable row level security;
alter table public.uploaded_materials enable row level security;

create policy "study_sessions_select_own" on public.study_sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "study_sessions_insert_own" on public.study_sessions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "study_sessions_update_own" on public.study_sessions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "study_sessions_delete_own" on public.study_sessions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "study_messages_select_own" on public.study_messages
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "study_messages_insert_own" on public.study_messages
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "study_messages_update_own" on public.study_messages
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "study_messages_delete_own" on public.study_messages
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "uploaded_materials_select_own" on public.uploaded_materials
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "uploaded_materials_insert_own" on public.uploaded_materials
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "uploaded_materials_update_own" on public.uploaded_materials
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "uploaded_materials_delete_own" on public.uploaded_materials
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger study_sessions_set_updated_at
before update on public.study_sessions
for each row
execute function public.set_updated_at();
