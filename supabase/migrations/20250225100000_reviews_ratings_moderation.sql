-- Reviews and ratings with moderation (approve/deny).
-- Comments table added for future use with same status flow.

-- Ratings: one row per user per recipe (star score only)
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  stars smallint not null check (stars >= 1 and stars <= 5),
  created_at timestamptz not null default now(),
  unique(user_id, recipe_id)
);

create index if not exists ratings_recipe_id_idx on public.ratings(recipe_id);
create index if not exists ratings_user_id_idx on public.ratings(user_id);

alter table public.ratings enable row level security;

create policy "Anyone can read ratings"
  on public.ratings for select
  using (true);

create policy "Authenticated users can insert own rating"
  on public.ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rating"
  on public.ratings for update
  using (auth.uid() = user_id);

create policy "Users can delete own rating"
  on public.ratings for delete
  using (auth.uid() = user_id);

-- Reviews: text + optional tags, with moderation status
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  stars smallint not null check (stars >= 1 and stars <= 5),
  content text,
  tags text[] default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

-- If reviews table already existed without these columns, add them now
alter table public.reviews add column if not exists stars smallint default 0;
alter table public.reviews add column if not exists tags text[] default '{}';
alter table public.reviews add column if not exists status text not null default 'pending';
alter table public.reviews add column if not exists reviewed_at timestamptz;
alter table public.reviews add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conrelid = 'public.reviews'::regclass and conname = 'reviews_status_check'
  ) then
    alter table public.reviews add constraint reviews_status_check check (status in ('pending', 'approved', 'denied'));
  end if;
end $$;

create index if not exists reviews_recipe_id_idx on public.reviews(recipe_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);
create index if not exists reviews_status_idx on public.reviews(status);
create index if not exists reviews_created_at_idx on public.reviews(created_at desc);

alter table public.reviews enable row level security;

-- Public sees only approved reviews (drop first so re-run is safe)
drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews"
  on public.reviews for select
  using (status = 'approved');

drop policy if exists "Authenticated users can insert own review" on public.reviews;
create policy "Authenticated users can insert own review"
  on public.reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own reviews" on public.reviews;
create policy "Users can read own reviews"
  on public.reviews for select
  using (auth.uid() = user_id);

-- Admin users table: who can approve/deny
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admin_users enable row level security;

create policy "Admins can read admin list"
  on public.admin_users for select
  using (auth.uid() = user_id);

-- No insert policy: add first admin via Dashboard SQL, e.g.:
-- insert into public.admin_users (user_id) select id from auth.users where email = 'admin@example.com';

-- Admins can update reviews (approve/deny)
drop policy if exists "Admins can update reviews" on public.reviews;
create policy "Admins can update reviews"
  on public.reviews for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can read all reviews" on public.reviews;
create policy "Admins can read all reviews"
  on public.reviews for select
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Comments table (for later): same status flow
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

create index if not exists comments_recipe_id_idx on public.comments(recipe_id);
create index if not exists comments_status_idx on public.comments(status);

alter table public.comments enable row level security;

create policy "Public can read approved comments"
  on public.comments for select
  using (status = 'approved');

create policy "Authenticated users can insert own comment"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can read own comments"
  on public.comments for select
  using (auth.uid() = user_id);

create policy "Admins can update comments"
  on public.comments for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can read all comments"
  on public.comments for select
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));
