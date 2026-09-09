-- Teach apply_recipe_revision about "Savet kuvara".
--
-- Depends on 20260908140000_recipe_revisions.sql (creates recipe_revisions and
-- the function this replaces) and 20260909120000_recipe_chef_tip.sql (adds the
-- column). Run out of order and Postgres reports
--   ERROR: type "public.recipe_revisions" does not exist
-- which means the table is missing, not the type: every table doubles as a
-- composite type, and `rev public.recipe_revisions` asks for that type.
--
-- The revision payload was built to grow ("jsonb rather than columns because
-- what an author may change will grow"), and chef_tip_sr is the first thing to
-- grow into it. Without this the edit form would happily put a tip into the
-- payload and approving the revision would drop it on the floor.
--
-- Guarded by `payload ? 'chef_tip_sr'` like the other two, so revisions
-- created before this migration -- which carry no such key -- leave the
-- recipe's existing tip alone rather than blanking it.

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

  if rev.payload ? 'chef_tip_sr' then
    update public.recipes
      set chef_tip_sr = nullif(rev.payload ->> 'chef_tip_sr', '')
      where id = rev.recipe_id;
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
