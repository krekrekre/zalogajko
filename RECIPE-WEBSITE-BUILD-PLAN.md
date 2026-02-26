# Recipe Website Build Plan — Serbian Market

**Stack:** Next.js, Supabase, Vercel  
**Reference:** Allrecipes.com (structure, functionality, design)  
**Market:** Serbia  
**SEO:** Fully optimized  
**Audience:** Agent-executable steps from scratch to deployment

**Priorities:** Structure → Scalability → SEO. Design can be polished later; get structure and SEO right first.  
**Pace:** Does not need to be done in one shot; iterative builds are fine.  
**Deployment:** Last phase — build and test locally first.

---

## Pre-Build: Assumptions (Confirmed)

- **Language:** Serbian (Latin) by default; Cyrillic can be added later.
- **Scope:** Recipes only for MVP; "The Latest" can be a simple recipe collection.
- **Nutrition:** Basic calories/macros only for MVP; full table later.
- **Images:** Supabase Storage.
- **Filters:** Meal type + Cuisine + Time to start; taxonomy designed for easy expansion.

---

## Phase 1: Project Setup

### Step 1.1 — Initialize Next.js Project

**Action:** Create Next.js 14+ app with App Router.

```bash
npx create-next-app@latest recepti --typescript --tailwind --eslint --app --src-dir
```

**Config:**
- TypeScript: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: `@/*`

**Folder structure (base):**
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
├── lib/
├── types/
└── public/
```

---

### Step 1.2 — Set Up Supabase

**Actions:**
1. Create project at [supabase.com](https://supabase.com)
2. Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Install Supabase client:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

4. Create Supabase utils:
   - `src/lib/supabase/client.ts` — browser client
   - `src/lib/supabase/server.ts` — server client (cookies)
   - `src/lib/supabase/middleware.ts` — auth middleware

**Reference:** [Supabase Next.js SSR docs](https://supabase.com/docs/guides/auth/server-side/nextjs)

---

### Step 1.3 — Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Add to `.gitignore`: `.env.local`, `.env*.local`

*Vercel connection moved to Phase 14 (Deployment) — run locally until then.*

---

## Phase 2: Database Schema

### Step 2.1 — Core Tables

Run in Supabase SQL Editor.

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories (meal type, cuisine, etc.) — extensible taxonomy
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

-- Recipes
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_sr TEXT NOT NULL,
  description_sr TEXT,
  why_youll_love TEXT[], -- 3 bullet points for "Zašto ćete voleti ovaj recept"
  prep_time_minutes INT NOT NULL,
  cook_time_minutes INT NOT NULL,
  servings INT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'published', -- 'draft', 'published', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipes_slug ON recipes(slug);
CREATE INDEX idx_recipes_status ON recipes(status);
CREATE INDEX idx_recipes_created ON recipes(created_at DESC);

-- Recipe–Category (many-to-many)
CREATE TABLE recipe_categories (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, category_id)
);

-- Ingredients
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  amount TEXT, -- "2 cups", "½ tsp"
  unit_sr TEXT,
  name_sr TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_ingredients_recipe ON ingredients(recipe_id);

-- Directions
CREATE TABLE directions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  instruction_sr TEXT NOT NULL,
  image_url TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_directions_recipe ON directions(recipe_id);

-- Optional: basic nutrition (MVP)
CREATE TABLE recipe_nutrition (
  recipe_id UUID PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
  calories INT,
  fat_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  protein_g DECIMAL(6,2)
);
```

---

### Step 2.2 — UGC Tables

```sql
-- Saved recipes (MyRecipes)
CREATE TABLE saved_recipes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

-- Ratings
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_ratings_recipe ON ratings(recipe_id);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_recipe ON reviews(recipe_id);
```

---

### Step 2.3 — RLS Policies

```sql
-- Recipes: public read, auth write
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recipes are viewable by everyone" ON recipes FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users can insert recipes" ON recipes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = author_id);

-- Categories: public read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Ingredients, directions: public read
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE directions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ingredients readable" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Directions readable" ON directions FOR SELECT USING (true);

-- Saved recipes: user-specific
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saves" ON saved_recipes FOR ALL USING (auth.uid() = user_id);

-- Ratings & reviews: public read, auth write
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ratings readable" ON ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert own ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reviews readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

### Step 2.4 — Seed Initial Categories

```sql
-- Meal types (Obroci)
INSERT INTO categories (slug, name_sr, type, sort_order) VALUES
  ('predjela', 'Predjela', 'meal_type', 1),
  ('glavna-jela', 'Glavna jela', 'meal_type', 2),
  ('prilozi', 'Prilozi', 'meal_type', 3),
  ('supe', 'Supe', 'meal_type', 4),
  ('salate', 'Salate', 'meal_type', 5),
  ('deserti', 'Deserti', 'meal_type', 6),
  ('pecivo', 'Pecivo', 'meal_type', 7);

-- Cuisines (Kuhinje)
INSERT INTO categories (slug, name_sr, type, sort_order) VALUES
  ('srpska', 'Srpska kuhinja', 'cuisine', 1),
  ('italijanska', 'Italijanska', 'cuisine', 2),
  ('balkanska', 'Balkanska', 'cuisine', 3),
  ('mediteranska', 'Mediteranska', 'cuisine', 4);
```

---

## Phase 3: Core App Structure & Layout

### Step 3.1 — Root Layout (Serbian SEO)

- Set `lang="sr"` on `<html>`
- Add default meta: title, description, Open Graph
- Serbian-friendly fonts (e.g. system fonts or Google Fonts that support Serbian)
- Structure: Header → Main → Footer

**File:** `src/app/layout.tsx`

---

### Step 3.2 — Header Component

**Elements (Allrecipes-style):**
- Logo + site name
- Trust badge (e.g. "Vodič kroz recepte za domaće kuvare od 2025")
- Primary nav: Recepti, Kategorije, Pretraži
- Search bar (prominent)
- Log In / Account (Supabase Auth)
- Save/MyRecipes icon (when logged in)

**File:** `src/components/Header.tsx`

---

### Step 3.3 — Footer Component

- Quick links: O nama, Kontakt, Pravila
- Category links (internal linking)
- Social proof placeholder
- Copyright

**File:** `src/components/Footer.tsx`

---

### Step 3.4 — Serbian i18n & Metadata Helpers

**Files:**
- `src/lib/seo.ts` — generateMetadata helpers
- `src/lib/constants.ts` — site name, default meta, popular searches (Serbian)

**Popular searches (Serbian examples):**
- Čorba, Piletina, Gibanica, Karadjordjeva, Sarma, Punjene paprike, Palacinke, Kuvana jela, Kolači, Salate

---

## Phase 4: Homepage (Allrecipes Structure)

### Step 4.1 — Hero Section

- Full-width hero
- Featured recipe or editorial "Najnovije" (The Latest)
- One large card with image, title, CTA

**File:** `src/components/home/HeroSection.tsx`

---

### Step 4.2 — "Najnovije" (The Latest)

- Horizontal row of 4–6 recipe cards
- "Vidi više" link to `/recepti?sort=latest`
- Fetch: latest 6 published recipes

**File:** `src/components/home/LatestRecipes.tsx`

---

### Step 4.3 — Recipe Save CTA Banner

- "Počnite da čuvate recepte" + MyRecipes promo
- Login/signup CTA when not authenticated

**File:** `src/components/home/SaveRecipesBanner.tsx`

---

### Step 4.4 — Featured Recipe Cards ( flip optional)

- 6 cards: image, title, rating, time, tag, Save/View
- Flip for user quote if reviews exist
- Grid: 3 cols desktop, 2 tablet, 1 mobile

**File:** `src/components/RecipeCard.tsx`

---

### Step 4.5 — Search + Popular Searches

- "Šta želite da skuvate?"
- Search input
- 8 popular search links (from constants)

**File:** `src/components/home/SearchSection.tsx`

---

### Step 4.6 — "Dom domaćih kuvara" (Community)

- 4 testimonial blocks: user quote, recipe link, author
- Fetch reviews or use placeholder content

**File:** `src/components/home/CommunitySection.tsx`

---

### Step 4.7 — Topic Hubs

- Rows of category links (e.g. "Srpska kuhinja", "Glavna jela", "Deserti")
- 4–6 links per row
- Links to `/kategorija/[slug]` or `/recepti?kategorija=slug`

**File:** `src/components/home/TopicHubs.tsx`

---

### Step 4.8 — Assemble Homepage

**File:** `src/app/page.tsx`

Compose: Hero → Latest → SaveBanner → Featured → Search → Community → TopicHubs

---

## Phase 5: Recipe Listing & Filtering

### Step 5.1 — Recipes Page

**Route:** `/recepti`

**Features:**
- URL params: `?kategorija=slug&sort=latest|popular|rating`
- Filter sidebar: Kategorija (meal type, cuisine — start with 2)
- Recipe grid
- Pagination or infinite scroll

**Files:**
- `src/app/recepti/page.tsx`
- `src/components/recipes/RecipeGrid.tsx`
- `src/components/recipes/FilterSidebar.tsx`

**Supabase query:** Filter by `recipe_categories`, order by `created_at` or aggregated rating.

---

### Step 5.2 — Extensible Filter Design

- Categories live in DB
- `FilterSidebar` reads `categories` by `type`
- Add new category types in DB; UI auto-reflects (or add new filter section in config)

---

## Phase 6: Individual Recipe Page

### Step 6.1 — Route & Data Fetching

**Route:** `/recepti/[slug]`

**Data:**
- Recipe by slug
- Ingredients, directions
- Categories
- Avg rating, review count
- Related recipes (same category, limit 8)

**Files:**
- `src/app/recepti/[slug]/page.tsx`
- `src/lib/queries/recipes.ts`

---

### Step 6.2 — Recipe Page Layout (Allrecipes)

**Order:**
1. H1 — recipe title
2. Rating + review count + "X ljudi je napravilo"
3. Author + "Ažurirano: [date]"
4. Actions: Sačuvaj, Oceni, Štampaj, Podeli
5. Servings, Prep, Cook, Total
6. "Zašto ćete voleti ovaj recept" — 3 bullets
7. Ingredients (with ½x, 1x, 2x multiplier)
8. Directions (numbered, optional step images)
9. Nutrition (if available)
10. "Takođe će vam se svideti" — related recipes
11. "Napravilo X domaćih kuvara" — CTA

---

### Step 6.3 — Recipe Schema (JSON-LD)

**File:** `src/components/RecipeSchema.tsx`

Output: `application/ld+json` Recipe schema with:
- name, description, image
- prepTime, cookTime, totalTime
- recipeYield (servings)
- recipeIngredient, recipeInstructions
- aggregateRating, review (if data exists)
- nutrition (if data exists)

---

### Step 6.4 — Dynamic Metadata

- title: `{recipe.title_sr} | {siteName}`
- description: first 155 chars of description
- og:image: recipe image
- canonical URL

---

## Phase 7: Add Recipe Form (Admin)

### Step 7.1 — Auth Protection

- Route: `/admin/recepti/novo` (or `/recepti/novo` with role check)
- Middleware or page-level check: redirect unauthenticated users

---

### Step 7.2 — Form Fields

- Title, description
- Why you'll love (3 text inputs)
- Prep time, cook time, servings
- Image upload (Supabase Storage)
- Categories (multi-select from `categories`)
- Ingredients (dynamic list: amount, unit, name)
- Directions (dynamic list: step number, instruction, optional image)
- Optional: nutrition (calories, fat, carbs, protein)

**File:** `src/app/admin/recepti/novo/page.tsx` + form components

---

### Step 7.3 — Image Upload

- Supabase Storage bucket: `recipe-images`
- Generate slug + timestamp for filename
- Store public URL in `recipes.image_url` and `directions.image_url`

---

### Step 7.4 — Form Submit

- Insert `recipes` → get id
- Insert `ingredients`, `directions`, `recipe_categories`
- Insert `recipe_nutrition` if provided
- Redirect to `/recepti/[slug]`

---

## Phase 8: User Features (UGC)

### Step 8.1 — Auth (Supabase Auth)

- Email/password or magic link
- Sign up, log in, log out
- Protected routes: save, rate, review

**Files:**
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- Auth callback: `src/app/auth/callback/route.ts`

---

### Step 8.2 — Save Recipe

- Button on recipe card and recipe page
- If not logged in: show login CTA
- If logged in: toggle `saved_recipes`
- "Moji recepti" page: `/moji-recepti` listing saved recipes

---

### Step 8.3 — Rate Recipe

- 1–5 stars
- One rating per user per recipe (upsert)
- Update aggregate on recipe or compute on read

---

### Step 8.4 — Review Recipe

- Text area
- Submit to `reviews`
- Display below recipe (paginated)
- Optional: "featured" review for "Why you'll love" or card back

---

### Step 8.5 — Serving Multiplier

- ½x, 1x, 2x toggle
- Client-side: multiply amounts in ingredients list (parse amounts if needed)
- Store base amounts; multiply in UI

---

## Phase 9: SEO Implementation

### Step 9.1 — Sitemap

**File:** `src/app/sitemap.ts`

- Homepage
- `/recepti`
- `/recepti/[slug]` for all published recipes
- `/kategorija/[slug]` for categories
- `lastModified` from `updated_at`

---

### Step 9.2 — Robots.txt

**File:** `src/app/robots.ts`

Allow all, sitemap URL.

---

### Step 9.3 — Metadata Per Page

- Layout: default title, description
- Recipe page: dynamic
- Listing: "Recepti za [category] | {siteName}"
- Category: "Recepti u kategoriji [name]"

---

### Step 9.4 — Images

- Use Next.js `Image` with `alt` from recipe title
- Responsive sizes
- Lazy load below fold

---

### Step 9.5 — Breadcrumbs

- Schema: BreadcrumbList
- UI: Home > Recepti > [Category] > [Recipe]

---

## Phase 10: Category Pages

### Step 10.1 — Route

**Route:** `/kategorija/[slug]`

- Fetch category by slug
- List recipes in category
- Same RecipeGrid as `/recepti`
- Title: "Recepti: {category.name_sr}"
- Metadata: title, description

---

### Step 10.2 — Category Index

**Route:** `/kategorije`

- List all categories by type
- Internal linking hub

---

## Phase 11: Search

### Step 11.1 — Client-Side Search (MVP)

- Search input in header
- `/pretraga?q=...` or client-side filter on `/recepti`
- Simple `ilike` on title, description
- Display results in RecipeGrid

**Upgrade path:** Algolia, Meilisearch, or Postgres full-text later

---

## Phase 12: Polish

### Step 12.1 — Print View

- Print stylesheet or `/recepti/[slug]/print` route
- Recipe only: title, ingredients, directions

---

### Step 12.2 — Share Buttons

- Copy link, Facebook, Twitter/X, WhatsApp
- `navigator.share` if available

---

### Step 12.3 — Mobile Responsiveness

- Test all breakpoints
- Touch-friendly CTAs
- Collapsible filters on mobile

---

### Step 12.4 — Performance

- Lazy load images
- Optimize fonts
- Check Core Web Vitals (Vercel Analytics)

---

## Phase 13: Post-Launch (Easy Extensions)

### Adding More Filters

1. Insert new rows in `categories` with new `type` (e.g. `diet`, `cooking_method`)
2. Add filter section in `FilterSidebar` for that type (or make it data-driven)
3. Update `/recepti` query to join new category type

### Adding "The Latest" Articles

- New table: `articles` (title, slug, content, published_at)
- Route: `/clanci/[slug]`
- Add "Najnovije" section that can show articles or recipes

---

## Phase 14: Deployment (Last)

- Push repo to GitHub
- Import project in Vercel, add env vars
- Connect custom domain (if applicable)
- Enable Vercel Analytics / Speed Insights (optional, free)
- Verify production build, Core Web Vitals

---

## Agent Execution Order

| Phase | Focus |
|-------|-------|
| 1 | Project init, Supabase (local env) |
| 2 | Database schema, RLS, seed |
| 3 | Layout, Header, Footer, constants |
| 4 | Homepage sections |
| 5 | Recipe listing + filters |
| 6 | Recipe page + schema |
| 7 | Add recipe form |
| 8 | Auth, save, rate, review |
| 9 | SEO (sitemap, metadata, images) |
| 10 | Category pages |
| 11 | Search |
| 12 | Print, share, mobile (polish) |
| 13 | Post-launch extensions (when ready) |
| 14 | Deployment (last) |

---

## File Checklist (Summary)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── recepti/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── kategorija/[slug]/page.tsx
│   ├── kategorije/page.tsx
│   ├── admin/recepti/novo/page.tsx
│   ├── moji-recepti/page.tsx
│   ├── pretraga/page.tsx
│   ├── (auth)/login/page.tsx
│   ├── (auth)/signup/page.tsx
│   ├── auth/callback/route.ts
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── RecipeCard.tsx
│   ├── RecipeSchema.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── LatestRecipes.tsx
│   │   ├── SaveRecipesBanner.tsx
│   │   ├── SearchSection.tsx
│   │   ├── CommunitySection.tsx
│   │   └── TopicHubs.tsx
│   └── recipes/
│       ├── RecipeGrid.tsx
│       └── FilterSidebar.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── supabase/middleware.ts
│   ├── seo.ts
│   ├── constants.ts
│   └── queries/recipes.ts
└── types/
    └── index.ts
```

---

## Suggestions

1. **Vercel Speed Insights** — free, add for real user metrics.
2. **next-sitemap** — optional alternative to manual `sitemap.ts` if you prefer.
3. **Serbian locale** — use `date-fns/locale/sr` for "Ažurirano: 8. decembar 2025."
4. **Rate limiting** — Supabase has limits; consider Upstash Redis (free tier) for API rate limiting if you expose public APIs later.
5. **Cyrillic support** — if you add it, ensure `lang` and `charset` support it; fonts must include Cyrillic glyphs.

---

*Plan ready for agent execution. Assumptions confirmed. Start with Phase 1.*
