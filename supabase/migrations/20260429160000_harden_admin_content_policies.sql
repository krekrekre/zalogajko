-- Harden admin-managed content policies.
-- Existing projects may have broad "authenticated" article policies from earlier migrations;
-- replace them with admin_users-backed policies.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admin_users enable row level security;

drop policy if exists "Admins can read admin list" on public.admin_users;
drop policy if exists "Admins can read own admin row" on public.admin_users;
create policy "Admins can read own admin row"
  on public.admin_users for select
  using (auth.uid() = user_id);

alter table public.articles enable row level security;

drop policy if exists "Authenticated can read all articles" on public.articles;
drop policy if exists "Authenticated can insert articles" on public.articles;
drop policy if exists "Authenticated can update articles" on public.articles;
drop policy if exists "Authenticated can delete articles" on public.articles;
drop policy if exists "Admins can read all articles" on public.articles;
drop policy if exists "Admins can insert articles" on public.articles;
drop policy if exists "Admins can update articles" on public.articles;
drop policy if exists "Admins can delete articles" on public.articles;

create policy "Admins can read all articles"
  on public.articles for select
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can insert articles"
  on public.articles for insert
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can update articles"
  on public.articles for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can delete articles"
  on public.articles for delete
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Authenticated can manage recipe categories" on public.recipe_categories;
drop policy if exists "Recipe owners can insert recipe categories" on public.recipe_categories;
drop policy if exists "Recipe owners can update recipe categories" on public.recipe_categories;
drop policy if exists "Recipe owners can delete recipe categories" on public.recipe_categories;
drop policy if exists "Recipe owners and admins can insert recipe categories" on public.recipe_categories;
drop policy if exists "Recipe owners and admins can update recipe categories" on public.recipe_categories;
drop policy if exists "Recipe owners and admins can delete recipe categories" on public.recipe_categories;

create policy "Recipe owners and admins can insert recipe categories"
  on public.recipe_categories for insert
  with check (
    exists (
      select 1 from public.recipes
      where recipes.id = recipe_categories.recipe_id
        and recipes.author_id = auth.uid()
    )
    or exists (select 1 from public.admin_users where user_id = auth.uid())
  );

create policy "Recipe owners and admins can update recipe categories"
  on public.recipe_categories for update
  using (
    exists (
      select 1 from public.recipes
      where recipes.id = recipe_categories.recipe_id
        and recipes.author_id = auth.uid()
    )
    or exists (select 1 from public.admin_users where user_id = auth.uid())
  )
  with check (
    exists (
      select 1 from public.recipes
      where recipes.id = recipe_categories.recipe_id
        and recipes.author_id = auth.uid()
    )
    or exists (select 1 from public.admin_users where user_id = auth.uid())
  );

create policy "Recipe owners and admins can delete recipe categories"
  on public.recipe_categories for delete
  using (
    exists (
      select 1 from public.recipes
      where recipes.id = recipe_categories.recipe_id
        and recipes.author_id = auth.uid()
    )
    or exists (select 1 from public.admin_users where user_id = auth.uid())
  );
