-- ─── Run this in Supabase SQL Editor ─────────────────────────────────────────

-- 1. Add subscription fields to users table
alter table public.users
  add column if not exists subscription_status text not null default 'free',
  add column if not exists stripe_customer_id text,
  add column if not exists subscription_end_date timestamptz;

-- 2. Add missing UPDATE and DELETE policies on generated_guides (CRITICAL)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'generated_guides'
    and policyname = 'Users can update own guides'
  ) then
    execute 'create policy "Users can update own guides" on public.generated_guides for update using (auth.uid() = user_id)';
  end if;
  if not exists (
    select 1 from pg_policies
    where tablename = 'generated_guides'
    and policyname = 'Users can delete own guides'
  ) then
    execute 'create policy "Users can delete own guides" on public.generated_guides for delete using (auth.uid() = user_id)';
  end if;
end
$$;

-- Also add DELETE policy for weekly_checkins (needed for manual delete before cascade)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'weekly_checkins'
    and policyname = 'Users can delete own checkins'
  ) then
    execute 'create policy "Users can delete own checkins" on public.weekly_checkins for delete using (auth.uid() = user_id)';
  end if;
end
$$;

-- 3. Create weekly_checkins table (if not already done)
create table if not exists public.weekly_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  guide_id uuid references public.generated_guides(id) on delete cascade not null,
  week_number integer not null,
  accomplished text not null default '',
  harder_than_expected text not null default '',
  wins text not null default '',
  concerns text not null default '',
  actual_hours numeric not null default 0,
  created_at timestamptz default now() not null,
  unique(user_id, guide_id, week_number)
);

alter table public.weekly_checkins enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'weekly_checkins'
    and policyname = 'Users can view own checkins'
  ) then
    execute 'create policy "Users can view own checkins" on public.weekly_checkins for select using (auth.uid() = user_id)';
    execute 'create policy "Users can insert own checkins" on public.weekly_checkins for insert with check (auth.uid() = user_id)';
  end if;
end
$$;

-- 4. Activity log table (for dashboard recent activity feed)
create table if not exists public.activity_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null,  -- 'guide_started' | 'week_completed' | 'checkin_submitted'
  payload jsonb not null default '{}',
  created_at timestamptz default now() not null
);

alter table public.activity_log enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'activity_log'
    and policyname = 'Users can view own activity'
  ) then
    execute 'create policy "Users can view own activity" on public.activity_log for select using (auth.uid() = user_id)';
    execute 'create policy "Users can insert own activity" on public.activity_log for insert with check (auth.uid() = user_id)';
  end if;
end
$$;
