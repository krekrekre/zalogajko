-- Save lists (categories) for saved recipes. One recipe can be in multiple lists per user.

create table if not exists public.saved_recipe_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists saved_recipe_lists_user_id_idx on public.saved_recipe_lists(user_id);
create unique index if not exists saved_recipe_lists_user_name_key on public.saved_recipe_lists(user_id, name);

alter table public.saved_recipe_lists enable row level security;

create policy "Users can read own saved recipe lists"
  on public.saved_recipe_lists for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved recipe lists"
  on public.saved_recipe_lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own saved recipe lists"
  on public.saved_recipe_lists for update
  using (auth.uid() = user_id);

create policy "Users can delete own saved recipe lists"
  on public.saved_recipe_lists for delete
  using (auth.uid() = user_id);

-- Add list_id to saved_recipes and allow (user, recipe, list) so a recipe can be in multiple lists.

-- 1. Create default list "Sačuvano" for each user who has saves (if table has rows)
insert into public.saved_recipe_lists (user_id, name)
select distinct user_id, 'Sačuvano' from public.saved_recipes
on conflict (user_id, name) do nothing;

-- 2. Add nullable list_id (no unique on list_id yet so we can backfill)
alter table public.saved_recipes
  add column if not exists list_id uuid references public.saved_recipe_lists(id) on delete cascade;

-- 3. Backfill: assign existing saves to user's default list
update public.saved_recipes sr
set list_id = (
  select srl.id from public.saved_recipe_lists srl
  where srl.user_id = sr.user_id and srl.name = 'Sačuvano'
  limit 1
)
where sr.list_id is null;

-- 4. Ensure no nulls (for users created after migration, we'll create list on first save)
alter table public.saved_recipes alter column list_id set not null;

-- 5. Replace unique(user_id, recipe_id) with unique(user_id, recipe_id, list_id)
alter table public.saved_recipes drop constraint if exists saved_recipes_user_id_recipe_id_key;
create unique index if not exists saved_recipes_user_recipe_list_key
  on public.saved_recipes(user_id, recipe_id, list_id);

create index if not exists saved_recipes_list_id_idx on public.saved_recipes(list_id);
