-- Recipe Website Schema for Serbian Market
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Categories (extensible taxonomy)
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_sr TEXT NOT NULL,
  name_en TEXT,
  type TEXT NOT NULL, -- 'meal_type', 'cuisine', 'diet', 'occasion', 'cooking_method'
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================
-- Recipes
-- ============================================
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_sr TEXT NOT NULL,
  description_sr TEXT,
  why_youll_love TEXT[], -- 3 bullet points "Zašto ćete voleti ovaj recept"
  prep_time_minutes INT NOT NULL,
  cook_time_minutes INT NOT NULL,
  servings INT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'published', -- 'draft', 'published', 'archived'
  skill_level TEXT, -- 'lako', 'srednje', 'tesko'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipes_slug ON recipes(slug);
CREATE INDEX idx_recipes_status ON recipes(status);
CREATE INDEX idx_recipes_created ON recipes(created_at DESC);
CREATE INDEX idx_recipes_skill_level ON recipes(skill_level);

-- ============================================
-- Recipe-Category (many-to-many)
-- ============================================
CREATE TABLE recipe_categories (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, category_id)
);

-- ============================================
-- Ingredients
-- ============================================
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  amount TEXT, -- "2 cups", "½ tsp"
  unit_sr TEXT,
  name_sr TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_ingredients_recipe ON ingredients(recipe_id);

-- ============================================
-- Directions
-- ============================================
CREATE TABLE directions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  instruction_sr TEXT NOT NULL,
  image_url TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_directions_recipe ON directions(recipe_id);

-- ============================================
-- Nutrition (optional, MVP)
-- ============================================
CREATE TABLE recipe_nutrition (
  recipe_id UUID PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
  calories INT,
  fat_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  protein_g DECIMAL(6,2)
);

-- ============================================
-- UGC: Saved recipes
-- ============================================
CREATE TABLE saved_recipes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

-- ============================================
-- UGC: Ratings
-- ============================================
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_ratings_recipe ON ratings(recipe_id);

-- ============================================
-- UGC: Reviews
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_recipe ON reviews(recipe_id);

-- ============================================
-- RLS Policies
-- ============================================

-- Recipes: public read, auth write
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recipes are viewable by everyone" ON recipes FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users can insert recipes" ON recipes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = author_id);

-- Categories: public read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Recipe-categories: public read, auth write
ALTER TABLE recipe_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recipe categories readable" ON recipe_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage recipe categories" ON recipe_categories FOR ALL USING (auth.role() = 'authenticated');

-- Ingredients, directions: public read
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE directions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ingredients readable" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Directions readable" ON directions FOR SELECT USING (true);

-- Recipe nutrition: public read
ALTER TABLE recipe_nutrition ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nutrition readable" ON recipe_nutrition FOR SELECT USING (true);

-- Saved recipes: user-specific
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saves" ON saved_recipes FOR ALL USING (auth.uid() = user_id);

-- Ratings: public read, auth write
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ratings readable" ON ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert own ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON ratings FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: public read, auth write
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Seed: Filter categories (meal_type + cuisine)
-- ============================================

-- Meal types for filtering (user-facing list)
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

-- Cuisines (Kuhinje)
INSERT INTO categories (slug, name_sr, type, sort_order) VALUES
  ('srpska', 'Srpska kuhinja', 'cuisine', 1),
  ('italijanska', 'Italijanska', 'cuisine', 2),
  ('balkanska', 'Balkanska', 'cuisine', 3),
  ('mediteranska', 'Mediteranska', 'cuisine', 4)
ON CONFLICT (slug) DO NOTHING;
