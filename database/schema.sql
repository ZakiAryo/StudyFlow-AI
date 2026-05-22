-- StudyFlow AI - Supabase schema
-- Jalankan file ini di Supabase SQL Editor pada project baru.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  lecturer_name text,
  color_label text not null default '#38bdf8',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.schedule_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  day_of_week text not null,
  start_time time not null,
  end_time time not null,
  room text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint schedule_time_order check (end_time > start_time),
  constraint schedule_day_check check (
    day_of_week in (
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
      'senin',
      'selasa',
      'rabu',
      'kamis',
      'jumat',
      'sabtu',
      'minggu'
    )
  )
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  deadline date not null,
  priority text not null default 'medium',
  status text not null default 'not_started',
  progress integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint tasks_priority_check check (priority in ('low', 'medium', 'high', 'urgent')),
  constraint tasks_status_check check (status in ('not_started', 'in_progress', 'revision', 'completed')),
  constraint tasks_progress_check check (progress >= 0 and progress <= 100)
);

create table if not exists public.task_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  item_text text not null,
  is_done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.task_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  summary text,
  risk_level text not null default 'medium',
  suggestion text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint study_plans_risk_level_check check (risk_level in ('low', 'medium', 'high'))
);

create table if not exists public.study_plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  study_plan_id uuid not null references public.study_plans(id) on delete cascade,
  date date not null,
  time_block text not null,
  action text not null,
  estimated_minutes integer not null default 30,
  is_done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint study_plan_items_estimated_minutes_check check (estimated_minutes > 0)
);

create table if not exists public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  type text not null,
  prompt text not null,
  response jsonb not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint ai_suggestions_type_check check (
    type in ('task_breakdown', 'study_plan', 'priority', 'notes_summary')
  )
);

create index if not exists courses_user_id_idx on public.courses(user_id);
create index if not exists schedule_sessions_user_id_idx on public.schedule_sessions(user_id);
create index if not exists schedule_sessions_course_id_idx on public.schedule_sessions(course_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_course_id_idx on public.tasks(course_id);
create index if not exists tasks_deadline_idx on public.tasks(deadline);
create index if not exists task_checklists_task_id_idx on public.task_checklists(task_id);
create index if not exists task_notes_task_id_idx on public.task_notes(task_id);
create index if not exists study_plans_task_id_idx on public.study_plans(task_id);
create index if not exists study_plan_items_plan_id_idx on public.study_plan_items(study_plan_id);
create index if not exists ai_suggestions_user_id_idx on public.ai_suggestions(user_id);

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists set_schedule_sessions_updated_at on public.schedule_sessions;
create trigger set_schedule_sessions_updated_at
before update on public.schedule_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_task_checklists_updated_at on public.task_checklists;
create trigger set_task_checklists_updated_at
before update on public.task_checklists
for each row execute function public.set_updated_at();

drop trigger if exists set_task_notes_updated_at on public.task_notes;
create trigger set_task_notes_updated_at
before update on public.task_notes
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.schedule_sessions enable row level security;
alter table public.tasks enable row level security;
alter table public.task_checklists enable row level security;
alter table public.task_notes enable row level security;
alter table public.study_plans enable row level security;
alter table public.study_plan_items enable row level security;
alter table public.ai_suggestions enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can manage own courses" on public.courses;
create policy "Users can manage own courses"
on public.courses for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own schedule sessions" on public.schedule_sessions;
create policy "Users can manage own schedule sessions"
on public.schedule_sessions for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.courses
    where courses.id = schedule_sessions.course_id
    and courses.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own tasks" on public.tasks;
create policy "Users can manage own tasks"
on public.tasks for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.courses
    where courses.id = tasks.course_id
    and courses.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own checklists" on public.task_checklists;
create policy "Users can manage own checklists"
on public.task_checklists for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.tasks
    where tasks.id = task_checklists.task_id
    and tasks.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own notes" on public.task_notes;
create policy "Users can manage own notes"
on public.task_notes for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.tasks
    where tasks.id = task_notes.task_id
    and tasks.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own study plans" on public.study_plans;
create policy "Users can manage own study plans"
on public.study_plans for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.tasks
    where tasks.id = study_plans.task_id
    and tasks.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own study plan items" on public.study_plan_items;
create policy "Users can manage own study plan items"
on public.study_plan_items for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.study_plans
    where study_plans.id = study_plan_items.study_plan_id
    and study_plans.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own AI suggestions" on public.ai_suggestions;
create policy "Users can manage own AI suggestions"
on public.ai_suggestions for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    task_id is null
    or exists (
      select 1 from public.tasks
      where tasks.id = ai_suggestions.task_id
      and tasks.user_id = auth.uid()
    )
  )
);
