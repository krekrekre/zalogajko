-- Include each category's type and sort_order in the categories payload.
--
-- Recipe URLs are /recepti/{category}/{recipe}, and a recipe can sit in several
-- categories, so every place that builds a link has to choose the same one or
-- the URL redirects. lib/recipe-path.ts prefers a meal_type, then the lowest
-- sort_order, then the slug. It could apply that to getRecipeBySlug and the
-- sitemap, which select the columns directly, but not to listing results until
-- this payload carried them.
--
-- Meal types win because /recepti/{slug} is the meal-type listing; cuisines
-- live under /kuhinja/{slug}. sort_order alone cannot rank, since it is only
-- unique within a type: 'srpska' is cuisine 1 and 'glavna-jela' is meal_type 2.

create or replace function public.search_recipes(
  p_limit integer default 12,
  p_offset integer default 0,
  p_category_slug text default null,
  p_cuisine_slug text default null,
  p_skill_level text default null,
  p_max_time integer default null,
  p_min_time integer default null,
  p_ingredient text default null
)
returns table (
  id uuid,
  slug text,
  title_sr text,
  description_sr text,
  prep_time_minutes integer,
  cook_time_minutes integer,
  total_time_minutes integer,
  servings integer,
  author_id uuid,
  author_name text,
  image_url text,
  skill_level text,
  created_at timestamptz,
  rating_count bigint,
  rating_avg numeric,
  categories jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  with filtered as (
    select r.*
    from public.recipes r
    where r.status = 'published'
      and (p_skill_level is null or r.skill_level = p_skill_level)
      and (p_max_time is null or r.total_time_minutes <= p_max_time)
      and (p_min_time is null or r.total_time_minutes >= p_min_time)
      and (
        p_category_slug is null
        or exists (
          select 1
          from public.recipe_categories rc
          join public.categories c on c.id = rc.category_id
          where rc.recipe_id = r.id and c.slug = p_category_slug
        )
      )
      and (
        p_cuisine_slug is null
        or exists (
          select 1
          from public.recipe_categories rc
          join public.categories c on c.id = rc.category_id
          where rc.recipe_id = r.id
            and c.slug = p_cuisine_slug
            and c.type = 'cuisine'
        )
      )
      and (
        p_ingredient is null
        or exists (
          select 1
          from public.ingredients i
          where i.recipe_id = r.id
            and public.sr_norm(i.name_sr) like '%' || public.sr_norm(p_ingredient) || '%'
        )
      )
    order by r.created_at desc
    limit greatest(p_limit, 0)
    offset greatest(p_offset, 0)
  )
  select
    f.id,
    f.slug,
    f.title_sr,
    f.description_sr,
    f.prep_time_minutes,
    f.cook_time_minutes,
    f.total_time_minutes,
    f.servings,
    f.author_id,
    f.author_name,
    f.image_url,
    f.skill_level,
    f.created_at,
    coalesce(rt.rating_count, 0) as rating_count,
    rt.rating_avg,
    coalesce(cat.categories, '[]'::jsonb) as categories
  from filtered f
  left join lateral (
    select count(*)::bigint as rating_count, avg(rr.stars)::numeric as rating_avg
    from public.ratings rr
    where rr.recipe_id = f.id
  ) rt on true
  left join lateral (
    select jsonb_agg(
             jsonb_build_object('id', c.id, 'slug', c.slug, 'name_sr', c.name_sr, 'type', c.type, 'sort_order', c.sort_order)
             order by c.sort_order
           ) as categories
    from public.recipe_categories rc
    join public.categories c on c.id = rc.category_id
    where rc.recipe_id = f.id
  ) cat on true
  order by f.created_at desc;
$$;

-- security invoker keeps the caller's RLS in force; the function only ever
-- reads status = 'published' rows, which are public anyway.
grant execute on function public.search_recipes(int, int, text, text, text, int, int, text)
  to anon, authenticated;
