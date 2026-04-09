-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text,
  created_at timestamptz default now() not null
);

-- User profiles table
create table if not exists public.user_profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  hours_available text,
  income_timeline text,
  skills text[] default '{}',
  budget text,
  location text,
  tried_before text,
  preferences text,
  hates text,
  updated_at timestamptz default now() not null
);

-- Generated guides table
create table if not exists public.generated_guides (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  path_name text not null,
  content jsonb not null,
  created_at timestamptz default now() not null
);

-- User progress table
create table if not exists public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  guide_id uuid references public.generated_guides(id) on delete cascade not null,
  step_number integer not null,
  completed boolean default false not null,
  completed_at timestamptz
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.generated_guides enable row level security;
alter table public.user_progress enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

create policy "Users can view own user_profile" on public.user_profiles for select using (auth.uid() = user_id);
create policy "Users can insert own user_profile" on public.user_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own user_profile" on public.user_profiles for update using (auth.uid() = user_id);

create policy "Users can view own guides" on public.generated_guides for select using (auth.uid() = user_id);
create policy "Users can insert own guides" on public.generated_guides for insert with check (auth.uid() = user_id);

create policy "Users can view own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.user_progress for update using (auth.uid() = user_id);

-- Auto-create user record on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
