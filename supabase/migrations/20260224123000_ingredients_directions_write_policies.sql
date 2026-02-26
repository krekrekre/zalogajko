-- Allow authenticated users to manage ingredients/directions
-- only for recipes they own.

DROP POLICY IF EXISTS "Authenticated can insert own recipe ingredients" ON ingredients;
CREATE POLICY "Authenticated can insert own recipe ingredients"
ON ingredients
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM recipes r
    WHERE r.id = ingredients.recipe_id
      AND r.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated can update own recipe ingredients" ON ingredients;
CREATE POLICY "Authenticated can update own recipe ingredients"
ON ingredients
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM recipes r
    WHERE r.id = ingredients.recipe_id
      AND r.author_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM recipes r
    WHERE r.id = ingredients.recipe_id
      AND r.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated can delete own recipe ingredients" ON ingredients;
CREATE POLICY "Authenticated can delete own recipe ingredients"
ON ingredients
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM recipes r
    WHERE r.id = ingredients.recipe_id
      AND r.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated can insert own recipe directions" ON directions;
CREATE POLICY "Authenticated can insert own recipe directions"
ON directions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM recipes r
    WHERE r.id = directions.recipe_id
      AND r.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated can update own recipe directions" ON directions;
CREATE POLICY "Authenticated can update own recipe directions"
ON directions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM recipes r
    WHERE r.id = directions.recipe_id
      AND r.author_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM recipes r
    WHERE r.id = directions.recipe_id
      AND r.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated can delete own recipe directions" ON directions;
CREATE POLICY "Authenticated can delete own recipe directions"
ON directions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM recipes r
    WHERE r.id = directions.recipe_id
      AND r.author_id = auth.uid()
  )
);
