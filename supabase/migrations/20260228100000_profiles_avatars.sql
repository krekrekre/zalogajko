-- User profiles: extended data for auth.users.
-- Avatar images stored in storage bucket 'avatars' (path: user_id/filename).
-- If using Supabase Dashboard, create bucket "avatars" (Public: yes) if this insert is not run.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  date_of_birth date,
  country text,
  location text,
  about_me text,
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles(username);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Storage: avatars bucket. Create bucket in Dashboard (Public: yes) if needed.
-- Path: {user_id}/{filename}

drop policy if exists "Users can upload own avatar" on storage.objects;
drop policy if exists "Public read avatars" on storage.objects;
drop policy if exists "Users can update own avatar" on storage.objects;
drop policy if exists "Users can delete own avatar" on storage.objects;

create policy "Users can upload own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Public read avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');

create policy "Users can update own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
