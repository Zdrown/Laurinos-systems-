-- ══════════════════════════════════════════════════════
-- Laurino's Tavern — System Architecture Database Schema
-- Run this in Supabase SQL Editor before using the app
-- ══════════════════════════════════════════════════════

-- ── PROFILES ──────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  role text default 'staff',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Anonymous'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── NOTES ─────────────────────────────────────────────
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  section_id text not null,
  subsection_id text,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  content text not null,
  created_at timestamptz default now()
);
alter table public.notes enable row level security;
create policy "Anyone authenticated can read notes" on public.notes
  for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert notes" on public.notes
  for insert with check (auth.role() = 'authenticated');
create policy "Authors can delete own notes" on public.notes
  for delete using (auth.uid() = author_id);

-- ── CORRECTIONS ───────────────────────────────────────
create table public.corrections (
  id uuid default gen_random_uuid() primary key,
  section_id text not null,
  subsection_id text,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  header text not null,
  content text not null,
  created_at timestamptz default now()
);
alter table public.corrections enable row level security;
create policy "Anyone authenticated can read corrections" on public.corrections
  for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert corrections" on public.corrections
  for insert with check (auth.role() = 'authenticated');
create policy "Authors can delete own corrections" on public.corrections
  for delete using (auth.uid() = author_id);

-- ── CUSTOM SUBSECTIONS ────────────────────────────────
create table public.custom_subsections (
  id uuid default gen_random_uuid() primary key,
  section_id text not null,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  created_at timestamptz default now(),
  sort_order integer default 999
);
alter table public.custom_subsections enable row level security;
create policy "Anyone authenticated can read custom_subsections" on public.custom_subsections
  for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert custom_subsections" on public.custom_subsections
  for insert with check (auth.role() = 'authenticated');

-- ── CUSTOM SECTIONS ───────────────────────────────────
create table public.custom_sections (
  id uuid default gen_random_uuid() primary key,
  section_id text not null unique,
  number text not null,
  title text not null,
  description text,
  content text,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  created_at timestamptz default now(),
  sort_order integer default 999
);
alter table public.custom_sections enable row level security;
create policy "Anyone authenticated can read custom_sections" on public.custom_sections
  for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert custom_sections" on public.custom_sections
  for insert with check (auth.role() = 'authenticated');
