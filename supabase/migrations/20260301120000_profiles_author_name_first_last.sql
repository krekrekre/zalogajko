-- Autorsko ime (shown on recipes/reviews); first/last name (profile page only).
alter table public.profiles
  add column if not exists author_name text,
  add column if not exists first_name text,
  add column if not exists last_name text;

-- Backfill author_name for existing users from auth metadata (so existing recipes/reviews keep showing a name).
update public.profiles p
set author_name = coalesce(
  nullif(trim(u.raw_user_meta_data ->> 'author_name'), ''),
  nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
  nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
  nullif(split_part(u.email, '@', 1), '')
)
from auth.users u
where p.id = u.id
  and (p.author_name is null or btrim(p.author_name) = '');
