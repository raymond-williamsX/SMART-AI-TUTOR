alter table public.uploaded_materials
  add column if not exists status text not null default 'uploaded',
  add column if not exists error_message text,
  add column if not exists processed_at timestamptz,
  add column if not exists chunk_count integer not null default 0,
  add column if not exists summary text,
  add column if not exists source_metadata jsonb not null default '{}'::jsonb,
  add column if not exists deleted_at timestamptz;

alter table public.uploaded_materials
  drop constraint if exists uploaded_materials_status_check;

alter table public.uploaded_materials
  add constraint uploaded_materials_status_check
  check (status in ('uploaded', 'processing', 'ready', 'failed', 'deleted'));

alter table public.study_messages
  add column if not exists sources jsonb not null default '[]'::jsonb;

create index if not exists uploaded_materials_user_status_created_at_idx
  on public.uploaded_materials (user_id, status, created_at desc)
  where deleted_at is null;

create index if not exists uploaded_materials_session_status_created_at_idx
  on public.uploaded_materials (session_id, status, created_at desc)
  where deleted_at is null;
