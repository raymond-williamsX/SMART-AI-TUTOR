-- Create courses table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add course_id to uploaded_materials
alter table public.uploaded_materials add column if not exists course_id uuid references public.courses(id) on delete set null;

-- Add new columns to study_sessions
alter table public.study_sessions add column if not exists course_id uuid references public.courses(id) on delete set null;
alter table public.study_sessions add column if not exists status text not null default 'active' check (status in ('active', 'paused', 'completed'));
alter table public.study_sessions add column if not exists duration_seconds integer not null default 0;
alter table public.study_sessions add column if not exists topics_covered jsonb not null default '[]'::jsonb;
alter table public.study_sessions add column if not exists summary text;

-- Create quizzes table
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  material_id uuid references public.uploaded_materials(id) on delete set null,
  type text not null check (type in ('mcq', 'flashcard', 'short_answer')),
  score integer,
  accuracy numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create quiz_questions table
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  user_answer text,
  is_correct boolean,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists courses_user_id_created_at_idx on public.courses (user_id, created_at desc);
create index if not exists quizzes_user_id_created_at_idx on public.quizzes (user_id, created_at desc);
create index if not exists quiz_questions_quiz_id_idx on public.quiz_questions (quiz_id);

-- Enable RLS
alter table public.courses enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;

-- Policies for courses
create policy "courses_select_own" on public.courses for select to authenticated using ((select auth.uid()) = user_id);
create policy "courses_insert_own" on public.courses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "courses_update_own" on public.courses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "courses_delete_own" on public.courses for delete to authenticated using ((select auth.uid()) = user_id);

-- Policies for quizzes
create policy "quizzes_select_own" on public.quizzes for select to authenticated using ((select auth.uid()) = user_id);
create policy "quizzes_insert_own" on public.quizzes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "quizzes_update_own" on public.quizzes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "quizzes_delete_own" on public.quizzes for delete to authenticated using ((select auth.uid()) = user_id);

-- Policies for quiz_questions
create policy "quiz_questions_select_own" on public.quiz_questions for select to authenticated using (
  exists (select 1 from public.quizzes where id = quiz_id and user_id = (select auth.uid()))
);
create policy "quiz_questions_insert_own" on public.quiz_questions for insert to authenticated with check (
  exists (select 1 from public.quizzes where id = quiz_id and user_id = (select auth.uid()))
);
create policy "quiz_questions_update_own" on public.quiz_questions for update to authenticated using (
  exists (select 1 from public.quizzes where id = quiz_id and user_id = (select auth.uid()))
) with check (
  exists (select 1 from public.quizzes where id = quiz_id and user_id = (select auth.uid()))
);
create policy "quiz_questions_delete_own" on public.quiz_questions for delete to authenticated using (
  exists (select 1 from public.quizzes where id = quiz_id and user_id = (select auth.uid()))
);

-- Grants
grant select, insert, update, delete on table public.courses to authenticated;
grant select, insert, update, delete on table public.quizzes to authenticated;
grant select, insert, update, delete on table public.quiz_questions to authenticated;
grant select, insert, update, delete on table public.courses to service_role;
grant select, insert, update, delete on table public.quizzes to service_role;
grant select, insert, update, delete on table public.quiz_questions to service_role;

-- Triggers for updated_at
create trigger courses_set_updated_at before update on public.courses for each row execute function public.set_updated_at();
create trigger quizzes_set_updated_at before update on public.quizzes for each row execute function public.set_updated_at();
