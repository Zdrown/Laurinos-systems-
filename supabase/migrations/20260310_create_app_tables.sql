-- Profiles table (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'staff',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Notes table
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  section_id text not null,
  subsection_id text,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  content text not null,
  created_at timestamptz default now()
);

alter table public.notes enable row level security;

create policy "Authenticated users can read notes" on public.notes
  for select to authenticated using (true);

create policy "Authenticated users can insert notes" on public.notes
  for insert to authenticated with check (true);

-- Corrections table
create table public.corrections (
  id uuid primary key default gen_random_uuid(),
  section_id text not null,
  subsection_id text,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  header text,
  content text not null,
  created_at timestamptz default now()
);

alter table public.corrections enable row level security;

create policy "Authenticated users can read corrections" on public.corrections
  for select to authenticated using (true);

create policy "Authenticated users can insert corrections" on public.corrections
  for insert to authenticated with check (true);

-- Custom subsections table
create table public.custom_subsections (
  id uuid primary key default gen_random_uuid(),
  section_id text not null,
  title text not null,
  content text,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.custom_subsections enable row level security;

create policy "Authenticated users can read custom_subsections" on public.custom_subsections
  for select to authenticated using (true);

create policy "Authenticated users can insert custom_subsections" on public.custom_subsections
  for insert to authenticated with check (true);

-- Custom sections table
create table public.custom_sections (
  id uuid primary key default gen_random_uuid(),
  section_id text not null,
  number text,
  title text not null,
  description text,
  content text,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.custom_sections enable row level security;

create policy "Authenticated users can read custom_sections" on public.custom_sections
  for select to authenticated using (true);

create policy "Authenticated users can insert custom_sections" on public.custom_sections
  for insert to authenticated with check (true);
