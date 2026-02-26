-- Store snapshot of reviewer avatar URL on each review.
alter table public.reviews
  add column if not exists author_avatar_url text;

-- Backfill existing rows from auth metadata where possible.
update public.reviews as r
set author_avatar_url = coalesce(
  nullif(trim(u.raw_user_meta_data ->> 'avatar_url'), ''),
  nullif(trim(u.raw_user_meta_data ->> 'picture'), '')
)
from auth.users as u
where r.user_id = u.id
  and (r.author_avatar_url is null or btrim(r.author_avatar_url) = '');
