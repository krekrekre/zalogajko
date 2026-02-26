-- Add skill_level and filter categories (run on existing DBs that already have schema)
-- Run in Supabase SQL Editor if recipes table exists without skill_level

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS skill_level TEXT;

CREATE INDEX IF NOT EXISTS idx_recipes_skill_level ON recipes(skill_level);

-- Filter categories (meal_type) – insert if not exist
INSERT INTO categories (slug, name_sr, type, sort_order) VALUES
  ('hladna-predjela', 'Hladna predjela', 'meal_type', 1),
  ('topla-predjela', 'Topla predjela', 'meal_type', 2),
  ('supe-i-corbe', 'Supe i corbe', 'meal_type', 3),
  ('salate', 'Salate', 'meal_type', 4),
  ('glavna-jela', 'Glavna jela', 'meal_type', 5),
  ('sosovi', 'Sosovi', 'meal_type', 6),
  ('torte', 'Torte', 'meal_type', 7),
  ('kolaci', 'Kolaci', 'meal_type', 8),
  ('riba-i-morski-plodovi', 'Riba i morski plodovi', 'meal_type', 9),
  ('zimnica', 'Zimnica', 'meal_type', 10),
  ('pite-i-testa', 'Pite i testa', 'meal_type', 11)
ON CONFLICT (slug) DO NOTHING;
