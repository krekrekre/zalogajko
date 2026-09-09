-- "Savet kuvara": one short tip from the author, offered alongside the recipe
-- ("hold the pan off the heat for a minute", that sort of thing).
--
-- Optional, so plain nullable text with no default and no backfill. The
-- existing row-level policies on public.recipes already cover it; RLS in this
-- project is per-row, not per-column, so no policy change is needed.

alter table public.recipes
  add column if not exists chef_tip_sr text;
