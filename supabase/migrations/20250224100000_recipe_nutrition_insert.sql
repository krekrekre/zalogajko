-- Allow recipe authors to insert/update recipe_nutrition
CREATE POLICY "Authors can insert recipe_nutrition"
  ON recipe_nutrition FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_nutrition.recipe_id AND r.author_id = auth.uid()
    )
  );

CREATE POLICY "Authors can update recipe_nutrition"
  ON recipe_nutrition FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_nutrition.recipe_id AND r.author_id = auth.uid()
    )
  );
