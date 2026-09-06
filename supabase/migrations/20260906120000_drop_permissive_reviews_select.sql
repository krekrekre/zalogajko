-- schema.sql created "Reviews readable" as FOR SELECT USING (true), and the
-- moderation migration (20250225100000) added narrower policies beside it
-- without dropping it. Permissive policies are OR'd, so USING (true) won.
-- Effect: pending and denied reviews were readable by anyone with the anon key.
--
-- The three policies that remain already cover every legitimate read:
--   "Public can read approved reviews"  - status = 'approved'
--   "Users can read own reviews"        - auth.uid() = user_id
--   "Admins can read all reviews"       - admin_users membership

drop policy if exists "Reviews readable" on public.reviews;
