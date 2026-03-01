-- Allow anyone to read any profile (public profiles).
-- Required for /profil/[userId] to work when viewing another user.
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
create policy "Anyone can read profiles"
  on public.profiles for select
  to public
  using (true);

-- User follow relationship: follower_id follows following_id.
create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

create index if not exists user_follows_following_id_idx on public.user_follows(following_id);

alter table public.user_follows enable row level security;

-- Anyone can read follow relationships (for counts and "is following" state).
create policy "Anyone can read user_follows"
  on public.user_follows for select
  to public
  using (true);

create policy "Users can follow others"
  on public.user_follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.user_follows for delete
  to authenticated
  using (auth.uid() = follower_id);
