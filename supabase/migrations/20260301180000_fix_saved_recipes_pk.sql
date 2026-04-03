-- The original saved_recipes table had PRIMARY KEY (user_id, recipe_id) which
-- prevents saving a recipe to multiple lists. The earlier migration dropped
-- the wrong constraint name. Drop the actual PK and add a new composite one.

alter table public.saved_recipes drop constraint if exists saved_recipes_pkey;

alter table public.saved_recipes
  add constraint saved_recipes_pkey primary key (user_id, recipe_id, list_id);
