-- Mock recipes for the first 3 users (by created_at) so /profil and /profil/[userId] show "Moji recepti" / "Recepti korisnika".
-- Run after auth.users has at least 3 users and categories/seed-recipes exist.
-- Safe to re-run: uses ON CONFLICT (slug) DO NOTHING for inserts; then UPDATE sets author_id only where still null.

-- Insert mock recipes (no author_id first so slug conflict works)
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES
  ('korisnik1-supa-biser', 'Brza supa biser', 'Lagana supa sa rezancima - brzo za radne dane.', ARRAY['Brzo', 'Lako', 'Porodično'], 10, 15, 4, 'Korisnik 1', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80', 'published'),
  ('korisnik1-dorucak', 'Dorucak u jednom loncu', 'Jaja sa povrćem i sirom - savršen brzi doručak.', ARRAY['Brzo', 'Ukusno', 'Zdrav'], 15, 10, 2, 'Korisnik 1', 'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=800&q=80', 'published'),
  ('korisnik1-salata-sirene', 'Salata sa sirenjem', 'Sveža salata sa sirenjem i maslinovim uljem.', ARRAY['Sveže', 'Lako', 'Leto'], 15, 0, 2, 'Korisnik 1', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', 'published'),
  ('korisnik2-pileca-corba', 'Pileća čorba sa rezancima', 'Tradicionalna pileća čorba - greje i zasiti.', ARRAY['Tradicionalno', 'Ukusno', 'Za celu porodicu'], 25, 50, 6, 'Korisnik 2', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80', 'published'),
  ('korisnik2-punjene-paprike-lagano', 'Punjene paprike (lagana varijanta)', 'Paprike punjene mesom i pirinčem u paradajz sosu.', ARRAY['Klasično', 'Sočno', 'Omiljeno'], 40, 60, 4, 'Korisnik 2', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80', 'published'),
  ('korisnik2-musaka-porodicna', 'Mušaka porodična', 'Mušaka od mlevenog mesa i krompira - nedeljni ručak.', ARRAY['Sitno', 'Jednostavno', 'Svi vole'], 45, 60, 6, 'Korisnik 2', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80', 'published'),
  ('korisnik3-torta-cokolada', 'Čokoladna torta', 'Sočna čokoladna torta bez pečenja.', ARRAY['Brzo', 'Slatko', 'Za goste'], 30, 0, 8, 'Korisnik 3', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', 'published'),
  ('korisnik3-kiflice-sir', 'Kiflice sa sirom', 'Mekane kiflice punjene sirom - savršene za doručak.', ARRAY['Mekano', 'Ukusno', 'Porodično'], 60, 25, 12, 'Korisnik 3', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80', 'published'),
  ('korisnik3-riblja-corba-domaca', 'Riblja čorba domaća', 'Riblja čorba po starom receptu - riba i povrće.', ARRAY['Tradicionalno', 'Zdrav', 'Za ribolovce'], 30, 45, 4, 'Korisnik 3', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80', 'published')
ON CONFLICT (slug) DO NOTHING;

-- Assign author_id to first 3 users (order by created_at). Recipes 1–3 → user 1, 4–6 → user 2, 7–9 → user 3.
WITH ordered_users AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC) AS rn
  FROM auth.users
  LIMIT 3
),
user1 AS (SELECT id FROM ordered_users WHERE rn = 1),
user2 AS (SELECT id FROM ordered_users WHERE rn = 2),
user3 AS (SELECT id FROM ordered_users WHERE rn = 3)
UPDATE recipes r
SET author_id = CASE r.slug
  WHEN 'korisnik1-supa-biser' THEN (SELECT id FROM user1)
  WHEN 'korisnik1-dorucak' THEN (SELECT id FROM user1)
  WHEN 'korisnik1-salata-sirene' THEN (SELECT id FROM user1)
  WHEN 'korisnik2-pileca-corba' THEN (SELECT id FROM user2)
  WHEN 'korisnik2-punjene-paprike-lagano' THEN (SELECT id FROM user2)
  WHEN 'korisnik2-musaka-porodicna' THEN (SELECT id FROM user2)
  WHEN 'korisnik3-torta-cokolada' THEN (SELECT id FROM user3)
  WHEN 'korisnik3-kiflice-sir' THEN (SELECT id FROM user3)
  WHEN 'korisnik3-riblja-corba-domaca' THEN (SELECT id FROM user3)
  ELSE r.author_id
END
WHERE r.slug IN (
  'korisnik1-supa-biser', 'korisnik1-dorucak', 'korisnik1-salata-sirene',
  'korisnik2-pileca-corba', 'korisnik2-punjene-paprike-lagano', 'korisnik2-musaka-porodicna',
  'korisnik3-torta-cokolada', 'korisnik3-kiflice-sir', 'korisnik3-riblja-corba-domaca'
);

-- Link to categories (use existing category slugs)
INSERT INTO recipe_categories (recipe_id, category_id)
SELECT r.id, c.id FROM recipes r, categories c
WHERE r.slug = 'korisnik1-supa-biser' AND c.slug = 'supe-i-corbe'
ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id)
SELECT r.id, c.id FROM recipes r, categories c
WHERE r.slug = 'korisnik1-dorucak' AND c.slug = 'glavna-jela'
ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id)
SELECT r.id, c.id FROM recipes r, categories c
WHERE r.slug = 'korisnik1-salata-sirene' AND c.slug = 'salate'
ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id)
SELECT r.id, c.id FROM recipes r, categories c
WHERE r.slug = 'korisnik2-pileca-corba' AND c.slug = 'supe-i-corbe'
ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id)
SELECT r.id, c.id FROM recipes r, categories c
WHERE r.slug = 'korisnik2-punjene-paprike-lagano' AND c.slug = 'glavna-jela'
ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id)
SELECT r.id, c.id FROM recipes r, categories c
WHERE r.slug = 'korisnik2-musaka-porodicna' AND c.slug = 'glavna-jela'
ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id)
SELECT r.id, c.id FROM recipes r, categories c
WHERE r.slug = 'korisnik3-torta-cokolada' AND c.slug = 'kolaci'
ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id)
SELECT r.id, c.id FROM recipes r, categories c
WHERE r.slug = 'korisnik3-kiflice-sir' AND c.slug = 'pite-i-testa'
ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id)
SELECT r.id, c.id FROM recipes r, categories c
WHERE r.slug = 'korisnik3-riblja-corba-domaca' AND c.slug = 'supe-i-corbe'
ON CONFLICT (recipe_id, category_id) DO NOTHING;
