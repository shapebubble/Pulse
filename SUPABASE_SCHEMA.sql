-- Pulse — Supabase schema
-- Run this in the Supabase SQL editor: Dashboard → SQL Editor → New query → paste + run

-- ── Profiles (extends auth.users) ──────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  topics text[] default array['AI × Design', 'UX Craft', 'Process', 'Product thinking', 'Career'],
  linkedin_access_token text,
  linkedin_token_expires_at timestamptz,
  linkedin_author_urn text,
  created_at timestamptz default now()
);

-- ── Questions ───────────────────────────────────────────────────────────────
create table public.questions (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  topic text not null,
  week_start date not null default date_trunc('week', now())::date,
  created_at timestamptz default now()
);

-- ── Posts (one per user per question) ───────────────────────────────────────
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  question_id uuid references public.questions on delete cascade not null,
  answer text,
  generated_post text,
  format text default 'question-led',
  status text default 'new',   -- new | draft | done | published | skipped
  linkedin_post_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, question_id)
);

-- ── Row-level security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.questions enable row level security;

create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own posts"   on public.posts for select using (auth.uid() = user_id);
create policy "Users can insert own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on public.posts for update using (auth.uid() = user_id);

create policy "Authenticated users can read questions" on public.questions for select to authenticated using (true);

-- ── Auto-create profile on signup ────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Seed questions for this week ─────────────────────────────────────────────
insert into public.questions (text, topic, week_start) values
('AI tools can now generate a finished UI in an afternoon. Does that make UX designers more valuable, or less?',
 'AI × Design', date_trunc('week', now())::date),
('Most design systems are built for consistency. But consistency at scale can kill the moments of delight that make a product memorable. How do you balance the two?',
 'UX Craft', date_trunc('week', now())::date),
('If you had to remove one phase from a typical UX process to ship faster, which would you cut — and what would you do to mitigate the risk?',
 'Process', date_trunc('week', now())::date);
