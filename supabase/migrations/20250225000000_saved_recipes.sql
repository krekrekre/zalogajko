-- Saved recipes: user_id + recipe_id (one row per user per recipe).
-- Run with: supabase db push (or apply via Dashboard SQL editor)

create table if not exists public.saved_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, recipe_id)
);

create index if not exists saved_recipes_user_id_idx on public.saved_recipes(user_id);
create index if not exists saved_recipes_recipe_id_idx on public.saved_recipes(recipe_id);

alter table public.saved_recipes enable row level security;

create policy "Users can read own saved recipes"
  on public.saved_recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved recipes"
  on public.saved_recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved recipes"
  on public.saved_recipes for delete
  using (auth.uid() = user_id);
