-- Allow admin users to delete recipes.
drop policy if exists "Admins can delete recipes" on public.recipes;
create policy "Admins can delete recipes"
  on public.recipes for delete
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));