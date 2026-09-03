-- Tighten user-owned write policies so client-provided ids/statuses cannot
-- claim another user, another user's list, or bypass moderation.

drop policy if exists "Authenticated users can insert recipes" on public.recipes;
drop policy if exists "Users can insert own recipes" on public.recipes;
create policy "Users can insert own recipes"
  on public.recipes for insert
  to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "Users can update own recipes" on public.recipes;
create policy "Users can update own recipes"
  on public.recipes for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "Users manage own saves" on public.saved_recipes;
drop policy if exists "Users can read own saved recipes" on public.saved_recipes;
drop policy if exists "Users can insert own saved recipes" on public.saved_recipes;
drop policy if exists "Users can delete own saved recipes" on public.saved_recipes;

create policy "Users can read own saved recipes"
  on public.saved_recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved recipes"
  on public.saved_recipes for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.saved_recipe_lists srl
      where srl.id = saved_recipes.list_id
        and srl.user_id = auth.uid()
    )
  );

create policy "Users can delete own saved recipes"
  on public.saved_recipes for delete
  using (auth.uid() = user_id);

drop policy if exists "Authenticated users can insert own rating" on public.ratings;
drop policy if exists "Users can insert own ratings" on public.ratings;
create policy "Authenticated users can insert own rating"
  on public.ratings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own rating" on public.ratings;
drop policy if exists "Users can update own ratings" on public.ratings;
create policy "Users can update own rating"
  on public.ratings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can insert own review" on public.reviews;
drop policy if exists "Users can insert own reviews" on public.reviews;
create policy "Authenticated users can insert own review"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and status = 'pending'
  );

drop policy if exists "Authenticated users can insert own comment" on public.comments;
create policy "Authenticated users can insert own comment"
  on public.comments for insert
  with check (
    auth.uid() = user_id
    and status = 'pending'
  );
