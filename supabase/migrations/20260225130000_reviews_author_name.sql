-- Store snapshot of reviewer display name on each review.
alter table public.reviews
  add column if not exists author_name text;

-- Backfill existing rows from auth metadata/email where possible.
update public.reviews as r
set author_name = coalesce(
  nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
  nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
  nullif(split_part(u.email, '@', 1), ''),
  'Korisnik'
)
from auth.users as u
where r.user_id = u.id
  and (r.author_name is null or btrim(r.author_name) = '');
