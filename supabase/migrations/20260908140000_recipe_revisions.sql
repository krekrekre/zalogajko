-- Edits to a published recipe are proposals, not writes.
--
-- The approval queue vetted a recipe once, at birth. After that its author
-- could rewrite the ingredients and steps and the change went straight to the
-- live site -- the bait-and-switch the queue exists to prevent. So: while a
-- recipe is published its author no longer writes its content at all. An edit
-- becomes a row in recipe_revisions, the published version stays up, and an
-- admin applying the revision is what changes the live recipe.
--
-- Unpublished recipes (pending, draft, denied) are still edited in place:
-- nothing public is at stake, and an author fixing a rejected recipe should
-- not need an admin to shepherd every keystroke.

-- ------------------------------------------------------------- the proposals

create table if not exists public.recipe_revisions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  -- The proposed content. jsonb rather than columns because what an author
  -- may change will grow, and a revision has to keep working after it does.
  payload jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

create index if not exists recipe_revisions_status_created_idx
  on public.recipe_revisions (status, created_at desc);
create index if not exists recipe_revisions_recipe_id_idx
  on public.recipe_revisions (recipe_id);

alter table public.recipe_revisions enable row level security;

drop policy if exists "Authors can propose revisions to own recipes" on public.recipe_revisions;
create policy "Authors can propose revisions to own recipes"
  on public.recipe_revisions for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.recipes r
      where r.id = recipe_revisions.recipe_id
        and r.author_id = auth.uid()
    )
  );

drop policy if exists "Authors can read own revisions" on public.recipe_revisions;
create policy "Authors can read own revisions"
  on public.recipe_revisions for select
  to authenticated
  using (auth.uid() = author_id);

drop policy if exists "Admins can read all revisions" on public.recipe_revisions;
create policy "Admins can read all revisions"
  on public.recipe_revisions for select
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update revisions" on public.recipe_revisions;
create policy "Admins can update revisions"
  on public.recipe_revisions for update
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- ------------------------------------- authors stop writing published content

-- Previously "Users can update own recipes", with no regard for status.
drop policy if exists "Users can update own recipes" on public.recipes;
drop policy if exists "Users can update own unpublished recipes" on public.recipes;
create policy "Users can update own unpublished recipes"
  on public.recipes for update
  to authenticated
  using (auth.uid() = author_id and status <> 'published')
  with check (auth.uid() = author_id);

-- Same for the content tables: the author owns them until the recipe is live.
drop policy if exists "Authenticated can insert own recipe ingredients" on public.ingredients;
drop policy if exists "Authenticated can update own recipe ingredients" on public.ingredients;
drop policy if exists "Authenticated can delete own recipe ingredients" on public.ingredients;
drop policy if exists "Authenticated can insert own recipe directions" on public.directions;
drop policy if exists "Authenticated can update own recipe directions" on public.directions;
drop policy if exists "Authenticated can delete own recipe directions" on public.directions;

drop policy if exists "Authors can insert own unpublished ingredients" on public.ingredients;
create policy "Authors can insert own unpublished ingredients"
  on public.ingredients for insert
  to authenticated
  with check (exists (
    select 1 from public.recipes r
    where r.id = ingredients.recipe_id
      and r.author_id = auth.uid()
      and r.status <> 'published'
  ));

drop policy if exists "Authors can update own unpublished ingredients" on public.ingredients;
create policy "Authors can update own unpublished ingredients"
  on public.ingredients for update
  to authenticated
  using (exists (
    select 1 from public.recipes r
    where r.id = ingredients.recipe_id
      and r.author_id = auth.uid()
      and r.status <> 'published'
  ))
  with check (exists (
    select 1 from public.recipes r
    where r.id = ingredients.recipe_id
      and r.author_id = auth.uid()
      and r.status <> 'published'
  ));

drop policy if exists "Authors can delete own unpublished ingredients" on public.ingredients;
create policy "Authors can delete own unpublished ingredients"
  on public.ingredients for delete
  to authenticated
  using (exists (
    select 1 from public.recipes r
    where r.id = ingredients.recipe_id
      and r.author_id = auth.uid()
      and r.status <> 'published'
  ));

drop policy if exists "Authors can insert own unpublished directions" on public.directions;
create policy "Authors can insert own unpublished directions"
  on public.directions for insert
  to authenticated
  with check (exists (
    select 1 from public.recipes r
    where r.id = directions.recipe_id
      and r.author_id = auth.uid()
      and r.status <> 'published'
  ));

drop policy if exists "Authors can update own unpublished directions" on public.directions;
create policy "Authors can update own unpublished directions"
  on public.directions for update
  to authenticated
  using (exists (
    select 1 from public.recipes r
    where r.id = directions.recipe_id
      and r.author_id = auth.uid()
      and r.status <> 'published'
  ))
  with check (exists (
    select 1 from public.recipes r
    where r.id = directions.recipe_id
      and r.author_id = auth.uid()
      and r.status <> 'published'
  ));

drop policy if exists "Authors can delete own unpublished directions" on public.directions;
create policy "Authors can delete own unpublished directions"
  on public.directions for delete
  to authenticated
  using (exists (
    select 1 from public.recipes r
    where r.id = directions.recipe_id
      and r.author_id = auth.uid()
      and r.status <> 'published'
  ));

-- Admins keep full write access, and need it: an admin's own new recipe is
-- published the moment the row lands, so without this the ingredients and
-- directions inserted a step later would be refused by the policies above.
drop policy if exists "Admins can insert ingredients" on public.ingredients;
create policy "Admins can insert ingredients"
  on public.ingredients for insert to authenticated
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update ingredients" on public.ingredients;
create policy "Admins can update ingredients"
  on public.ingredients for update to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can delete ingredients" on public.ingredients;
create policy "Admins can delete ingredients"
  on public.ingredients for delete to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can insert directions" on public.directions;
create policy "Admins can insert directions"
  on public.directions for insert to authenticated
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update directions" on public.directions;
create policy "Admins can update directions"
  on public.directions for update to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can delete directions" on public.directions;
create policy "Admins can delete directions"
  on public.directions for delete to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- ------------------------------------------------------ a denial is not a wall

-- The moderation trigger froze the status on an author's update, which meant a
-- denied recipe could never be resubmitted. Editing one now returns it to the
-- queue, so the author can address the reason and try again.
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
  elsif old.status = 'denied' then
    new.status := 'pending';
    new.reviewed_at := null;
    new.reviewed_by := null;
  else
    -- Authors may edit their recipe; they may not change what it is worth.
    new.status := old.status;
    new.reviewed_at := old.reviewed_at;
    new.reviewed_by := old.reviewed_by;
  end if;

  return new;
end;
$$;

-- ------------------------------------------------- applying a revision, safely

-- Runs as the owner so one admin action replaces the recipe's content in a
-- single transaction, without handing admins blanket write access to every
-- author's ingredients and directions.
create or replace function public.apply_recipe_revision(revision_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rev public.recipe_revisions;
begin
  if not exists (select 1 from public.admin_users where user_id = auth.uid()) then
    raise exception 'Only admins can apply recipe revisions';
  end if;

  select * into rev from public.recipe_revisions where id = revision_id;
  if rev.id is null then
    raise exception 'Revision % not found', revision_id;
  end if;
  if rev.status <> 'pending' then
    raise exception 'Revision % is already %', revision_id, rev.status;
  end if;

  if rev.payload ? 'ingredients' then
    delete from public.ingredients where recipe_id = rev.recipe_id;
    insert into public.ingredients (recipe_id, amount, unit_sr, name_sr, sort_order)
    select rev.recipe_id, x.amount, x.unit_sr, x.name_sr, x.sort_order
    from jsonb_to_recordset(rev.payload -> 'ingredients')
      as x(amount text, unit_sr text, name_sr text, sort_order int);
  end if;

  if rev.payload ? 'directions' then
    delete from public.directions where recipe_id = rev.recipe_id;
    insert into public.directions
      (recipe_id, step_number, instruction_sr, sort_order, image_url)
    select rev.recipe_id, x.step_number, x.instruction_sr, x.sort_order, x.image_url
    from jsonb_to_recordset(rev.payload -> 'directions')
      as x(step_number int, instruction_sr text, sort_order int, image_url text);
  end if;

  update public.recipes
    set updated_at = now()
    where id = rev.recipe_id;

  update public.recipe_revisions
    set status = 'approved',
        reviewed_at = now(),
        reviewed_by = auth.uid()
    where id = revision_id;
end;
$$;

revoke all on function public.apply_recipe_revision(uuid) from public;
grant execute on function public.apply_recipe_revision(uuid) to authenticated;
