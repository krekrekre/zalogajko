-- Allow reviews with no star rating (0 = optional)
alter table public.reviews drop constraint if exists reviews_stars_check;
alter table public.reviews add constraint reviews_stars_check check (stars >= 0 and stars <= 5);
