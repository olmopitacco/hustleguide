-- Run this in Supabase SQL Editor

create table if not exists public.weekly_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  guide_id uuid references public.generated_guides(id) on delete cascade not null,
  week_number integer not null,
  accomplished text not null,
  harder_than_expected text not null,
  easier_than_expected text default '',
  actual_hours numeric default 0,
  wins text default '',
  concerns text default '',
  created_at timestamptz default now() not null
);

alter table public.weekly_checkins enable row level security;

create policy "Users can view own checkins" on public.weekly_checkins for select using (auth.uid() = user_id);
create policy "Users can insert own checkins" on public.weekly_checkins for insert with check (auth.uid() = user_id);
