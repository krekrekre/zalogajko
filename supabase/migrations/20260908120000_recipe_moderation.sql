-- Recipes go through admin approval before they are public.
--
-- Until now anyone signed in could publish straight to the live site: the
-- form sent status = 'published' and nothing on the server disagreed. This
-- puts recipes on the same footing as reviews and comments -- submit ->
-- 'pending' -> an admin approves -> 'published' -- and enforces it in the
-- database, so the status is the server's decision rather than the client's.
--
-- Recipes that are already published stay published; only new submissions
-- go through the queue.

-- ---------------------------------------------------------------- statuses

alter table public.recipes add column if not exists reviewed_at timestamptz;
alter table public.recipes
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null;

-- 'not valid' skips the existing rows (every one of them is 'published')
-- while still checking every insert and update from here on. Once you have
-- confirmed no row holds an unexpected status, run:
--   alter table public.recipes validate constraint recipes_status_check;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.recipes'::regclass
      and conname = 'recipes_status_check'
  ) then
    alter table public.recipes
      add constraint recipes_status_check
      check (status in ('draft', 'pending', 'published', 'denied', 'archived'))
      not valid;
  end if;
end $$;

-- ----------------------------------------------- the client cannot self-publish

-- A policy cannot express this: an UPDATE's WITH CHECK sees only the new row,
-- so it cannot tell "author edited their published recipe" from "author flipped
-- their pending recipe to published". A trigger sees both rows and can.
create or replace function public.enforce_recipe_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- No JWT means the service role or the SQL editor -- seed scripts and
  -- migrations, which are trusted and keep the status they ask for. The anon
  -- role never reaches here: it cannot insert recipes at all.
  if auth.uid() is null then
    return new;
  end if;

  if exists (select 1 from public.admin_users where user_id = auth.uid()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
  else
    -- Authors may edit their recipe; they may not change what it is worth.
    new.status := old.status;
    new.reviewed_at := old.reviewed_at;
    new.reviewed_by := old.reviewed_by;
  end if;

  return new;
end;
$$;

drop trigger if exists recipes_enforce_moderation on public.recipes;
create trigger recipes_enforce_moderation
  before insert or update on public.recipes
  for each row execute function public.enforce_recipe_moderation();

-- -------------------------------------------------------------- who sees what

-- Public still sees published only ("Recipes are viewable by everyone").
-- Authors need to see their own submission while it waits, or it vanishes
-- the moment they press Objavi.
drop policy if exists "Users can read own recipes" on public.recipes;
create policy "Users can read own recipes"
  on public.recipes for select
  to authenticated
  using (auth.uid() = author_id);

-- The admin queue cannot moderate what it cannot read, and until now the
-- only SELECT policy was status = 'published'.
drop policy if exists "Admins can read all recipes" on public.recipes;
create policy "Admins can read all recipes"
  on public.recipes for select
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Likewise, the only UPDATE policy was the author's own, so an admin could
-- neither approve a recipe nor edit anyone else's.
drop policy if exists "Admins can update recipes" on public.recipes;
create policy "Admins can update recipes"
  on public.recipes for update
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
