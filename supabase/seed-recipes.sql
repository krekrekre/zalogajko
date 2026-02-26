-- Seed: 30 mockup recipes (Serbian/Balkan cuisine)
-- Run in Supabase SQL Editor after schema and categories exist
-- Safe to re-run: recipes and recipe_categories use ON CONFLICT DO NOTHING;
-- ingredients and directions are cleared for these slugs before re-insert.

DELETE FROM directions WHERE recipe_id IN (SELECT id FROM recipes WHERE slug IN (
  'sarma','karadjordjeva-snicla','gibanica','corba-piletina','punjene-paprike','palacinke','sopska-salata','mućkalica','prebranac','teleca-corba','pileci-paprikas','torta-orah','ajvar','pljeskavica','tarator','musaka','baklava','punjena-tikvica','corbast-pasulj','kiflice','spaghetti-carbonara','srpska-salata','snicle','krofne','riblja-corba','pizza-margherita','paprike-rizoto','tulumbe','cevapi','salata-kupus'
));
DELETE FROM ingredients WHERE recipe_id IN (SELECT id FROM recipes WHERE slug IN (
  'sarma','karadjordjeva-snicla','gibanica','corba-piletina','punjene-paprike','palacinke','sopska-salata','mućkalica','prebranac','teleca-corba','pileci-paprikas','torta-orah','ajvar','pljeskavica','tarator','musaka','baklava','punjena-tikvica','corbast-pasulj','kiflice','spaghetti-carbonara','srpska-salata','snicle','krofne','riblja-corba','pizza-margherita','paprike-rizoto','tulumbe','cevapi','salata-kupus'
));

-- 1. Sarma
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'sarma',
  'Tradicionalna sarma',
  'Klasicna sarma od kiselih kupusa - omiljeno srpsko zimsko jelo.',
  ARRAY['Savršena za nedeljni ručak', 'Osvježava tradiciju', 'Svi u porodici vole'],
  90, 180, 8, 'Marija Petrović',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'sarma' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'sarma' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'sarma'), '1', 'velika glavica kisela kupusa', 1),
  ((SELECT id FROM recipes WHERE slug = 'sarma'), '500', 'g mlevenog mesa', 2),
  ((SELECT id FROM recipes WHERE slug = 'sarma'), '200', 'g pirinča', 3),
  ((SELECT id FROM recipes WHERE slug = 'sarma'), '1', 'crni luk', 4),
  ((SELECT id FROM recipes WHERE slug = 'sarma'), '2', 'kasičice crvene paprike', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'sarma'), 1, 'Listove kupusa skuvajte u slanoj vodi da omekšaju.', 1),
  ((SELECT id FROM recipes WHERE slug = 'sarma'), 2, 'Pomešajte mleveno meso, pirinač, izdinstan luk i začine.', 2),
  ((SELECT id FROM recipes WHERE slug = 'sarma'), 3, 'Uvijte sarme i poređajte u lonac.', 3),
  ((SELECT id FROM recipes WHERE slug = 'sarma'), 4, 'Prelijte vodom ili čorbom i kuvajte 2-3 sata.', 4);

-- 2. Karadjordjeva šnicla
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'karadjordjeva-snicla',
  'Karađorđeva šnicla',
  'Šnicla punjena kajmakom i suvim mesom - klasika srpske kuhinje.',
  ARRAY['Impresivan izgled', 'Sočan i ukusan', 'Savršeno za goste'],
  30, 25, 4, 'Stefan Jovanović',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'karadjordjeva-snicla' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'karadjordjeva-snicla' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'karadjordjeva-snicla'), '4', 'velike šnicle telećeg ili svinjetine', 1),
  ((SELECT id FROM recipes WHERE slug = 'karadjordjeva-snicla'), '100', 'g kajmaka', 2),
  ((SELECT id FROM recipes WHERE slug = 'karadjordjeva-snicla'), '50', 'g suvog mesa', 3),
  ((SELECT id FROM recipes WHERE slug = 'karadjordjeva-snicla'), '2', 'jaja', 4),
  ((SELECT id FROM recipes WHERE slug = 'karadjordjeva-snicla'), '100', 'g prezle', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'karadjordjeva-snicla'), 1, 'Šnicle razbijte i u svaku stavite kajmak i suvo meso.', 1),
  ((SELECT id FROM recipes WHERE slug = 'karadjordjeva-snicla'), 2, 'Uvaljajte u brašno, jaje i prezu.', 2),
  ((SELECT id FROM recipes WHERE slug = 'karadjordjeva-snicla'), 3, 'Pržite u dosta ulja do zlatne boje.', 3);

-- 3. Gibanica
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'gibanica',
  'Srpška gibanica',
  'Slatko pecivo od fila kora i sira - tradicija za svaku priliku.',
  ARRAY['Jednostavna priprema', 'Ukusna i sočna', 'Savršena za doručak'],
  45, 45, 8, 'Ana Nikolić',
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'gibanica' AND c.slug = 'pite-i-testa' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'gibanica' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'gibanica'), '500', 'g fila kora', 1),
  ((SELECT id FROM recipes WHERE slug = 'gibanica'), '500', 'g belog sira', 2),
  ((SELECT id FROM recipes WHERE slug = 'gibanica'), '4', 'jaja', 3),
  ((SELECT id FROM recipes WHERE slug = 'gibanica'), '200', 'ml jogurta', 4),
  ((SELECT id FROM recipes WHERE slug = 'gibanica'), '100', 'ml ulja', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'gibanica'), 1, 'Sitno izmrvite sir i pomešajte sa jajima i jogurtom.', 1),
  ((SELECT id FROM recipes WHERE slug = 'gibanica'), 2, 'Nauljite pleh i položite slojeve fila kora, premazujući sirnom smesom.', 2),
  ((SELECT id FROM recipes WHERE slug = 'gibanica'), 3, 'Pekjte na 200°C oko 45 minuta.', 3);

-- 4. Čorba od pilećeg mesa
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'corba-piletina',
  'Čorba od pilećeg mesa',
  'Umiljata čorba sa piletinom i povrćem.',
  ARRAY['Brzo se pravi', 'Zdrav i lagan', 'Greje u zimskim danima'],
  20, 40, 6, 'Marko Đorđević',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'corba-piletina' AND c.slug = 'supe-i-corbe' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'corba-piletina' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'corba-piletina'), '400', 'g pilećeg mesa', 1),
  ((SELECT id FROM recipes WHERE slug = 'corba-piletina'), '2', 'šargarepe', 2),
  ((SELECT id FROM recipes WHERE slug = 'corba-piletina'), '2', 'celera', 3),
  ((SELECT id FROM recipes WHERE slug = 'corba-piletina'), '1', 'crni luk', 4),
  ((SELECT id FROM recipes WHERE slug = 'corba-piletina'), '2', 'žumanice', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'corba-piletina'), 1, 'Skuvajte piletinu u slanoj vodi.', 1),
  ((SELECT id FROM recipes WHERE slug = 'corba-piletina'), 2, 'Dodajte naseckano povrće i kuvajte.', 2),
  ((SELECT id FROM recipes WHERE slug = 'corba-piletina'), 3, 'Zagustite sa žumancima razmućenim u malo vode.', 3);

-- 5. Punjene paprike
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'punjene-paprike',
  'Punjene paprike u paradajz sosu',
  'Klasične paprike punjene mlevenim mesom i pirinčem.',
  ARRAY['Porodično omiljeno', 'Sočno i ukusno', 'Ostaje još za sutra'],
  45, 60, 6, 'Jelena Pavlović',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'punjene-paprike' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'punjene-paprike' AND c.slug = 'balkanska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'punjene-paprike'), '10', 'većih paprika', 1),
  ((SELECT id FROM recipes WHERE slug = 'punjene-paprike'), '500', 'g mlevenog mesa', 2),
  ((SELECT id FROM recipes WHERE slug = 'punjene-paprike'), '100', 'g pirinča', 3),
  ((SELECT id FROM recipes WHERE slug = 'punjene-paprike'), '500', 'g paradajza', 4),
  ((SELECT id FROM recipes WHERE slug = 'punjene-paprike'), '1', 'crni luk', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'punjene-paprike'), 1, 'Iseckajte vrške paprika i izvadite semena.', 1),
  ((SELECT id FROM recipes WHERE slug = 'punjene-paprike'), 2, 'Pomešajte meso, pirinač i luk.', 2),
  ((SELECT id FROM recipes WHERE slug = 'punjene-paprike'), 3, 'Napunite paprike i poređajte u lonac. Prelijte paradajz sosom i kuvajte.', 3);

-- 6. Palačinke
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'palacinke',
  'Klasične palačinke',
  'Tanke palačinke - doručak koji svi vole.',
  ARRAY['Brzo se prave', 'Možete ih puniti po želji', 'Deca obožavaju'],
  15, 20, 4, 'Ivana Marković',
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'palacinke' AND c.slug = 'kolaci' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'palacinke' AND c.slug = 'balkanska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'palacinke'), '2', 'jaja', 1),
  ((SELECT id FROM recipes WHERE slug = 'palacinke'), '250', 'g brašna', 2),
  ((SELECT id FROM recipes WHERE slug = 'palacinke'), '500', 'ml mleka', 3),
  ((SELECT id FROM recipes WHERE slug = 'palacinke'), '1', 'kašika ulja', 4),
  ((SELECT id FROM recipes WHERE slug = 'palacinke'), 'šćećer', 'po ukusu', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'palacinke'), 1, 'Pomešajte sve sastojke u glatku smesu.', 1),
  ((SELECT id FROM recipes WHERE slug = 'palacinke'), 2, 'Zagrejte tiganj i pecite palačinke sa obe strane.', 2);

-- 7. Šopska salata
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'sopska-salata',
  'Šopska salata',
  'Svježa balkanska salata od paradajza, krastavca, paprike i sira.',
  ARRAY['Brza priprema', 'Savršena uz roštilj', 'Osvježavajuća'],
  15, 0, 4, 'Nikola Petrović',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'sopska-salata' AND c.slug = 'salate' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'sopska-salata' AND c.slug = 'balkanska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'sopska-salata'), '3', 'paradajza', 1),
  ((SELECT id FROM recipes WHERE slug = 'sopska-salata'), '2', 'krastavca', 2),
  ((SELECT id FROM recipes WHERE slug = 'sopska-salata'), '2', 'paprike', 3),
  ((SELECT id FROM recipes WHERE slug = 'sopska-salata'), '1', 'crni luk', 4),
  ((SELECT id FROM recipes WHERE slug = 'sopska-salata'), '200', 'g belog sira', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'sopska-salata'), 1, 'Iseckajte sve povrće na kockice.', 1),
  ((SELECT id FROM recipes WHERE slug = 'sopska-salata'), 2, 'Dodajte sir, ulje, sirće i začine.', 2);

-- 8. Mućkalica
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'mućkalica',
  'Mućkalica',
  'Jelo od pečenog mesa u pikantnom sosu - specijalitet za roštilj.',
  ARRAY['Autentičan ukus', 'Ide uz pivo', 'Ljubitelji će obožavati'],
  20, 30, 4, 'Dragan Simić',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'mućkalica' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'mućkalica' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'mućkalica'), '500', 'g pečenog mesa', 1),
  ((SELECT id FROM recipes WHERE slug = 'mućkalica'), '3', 'paprike', 2),
  ((SELECT id FROM recipes WHERE slug = 'mućkalica'), '2', 'paradajza', 3),
  ((SELECT id FROM recipes WHERE slug = 'mućkalica'), '1', 'crni luk', 4),
  ((SELECT id FROM recipes WHERE slug = 'mućkalica'), 'čili', 'po ukusu', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'mućkalica'), 1, 'Iseckajte pečeno meso na manje komade.', 1),
  ((SELECT id FROM recipes WHERE slug = 'mućkalica'), 2, 'Dinstajte povrće i dodajte meso.', 2),
  ((SELECT id FROM recipes WHERE slug = 'mućkalica'), 3, 'Dodajte začine i kratko prokuvajte.', 3);

-- 9. Prebranac
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'prebranac',
  'Prebranac',
  'Tradicionalno jelo od pasulja pečeno u rerni.',
  ARRAY['Jednostavno za pripremu', 'Veoma ukusno', 'Savršeno za zimu'],
  30, 90, 6, 'Maja Kovačević',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'prebranac' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'prebranac' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'prebranac'), '500', 'g belog pasulja', 1),
  ((SELECT id FROM recipes WHERE slug = 'prebranac'), '3', 'crna luka', 2),
  ((SELECT id FROM recipes WHERE slug = 'prebranac'), '200', 'g slanine', 3),
  ((SELECT id FROM recipes WHERE slug = 'prebranac'), '2', 'kašike crvene paprike', 4),
  ((SELECT id FROM recipes WHERE slug = 'prebranac'), 'sir', 'za posipanje', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'prebranac'), 1, 'Skuvajte pasulj do mekoće.', 1),
  ((SELECT id FROM recipes WHERE slug = 'prebranac'), 2, 'Dinstajte luk i slaninu.', 2),
  ((SELECT id FROM recipes WHERE slug = 'prebranac'), 3, 'Pomešajte sa pasuljem i pecite u rerni.', 3);

-- 10. Teleća čorba
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'teleca-corba',
  'Teleća čorba',
  'Bogata čorba od telećeg mesa sa povrćem.',
  ARRAY['Hranjiva i ukusna', 'Tradicionalni recept', 'Idealna za obroke'],
  25, 120, 6, 'Petar Ilić',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'teleca-corba' AND c.slug = 'supe-i-corbe' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'teleca-corba' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'teleca-corba'), '500', 'g telećeg mesa', 1),
  ((SELECT id FROM recipes WHERE slug = 'teleca-corba'), '2', 'šargarepe', 2),
  ((SELECT id FROM recipes WHERE slug = 'teleca-corba'), '1', 'celer', 3),
  ((SELECT id FROM recipes WHERE slug = 'teleca-corba'), '1', 'crni luk', 4),
  ((SELECT id FROM recipes WHERE slug = 'teleca-corba'), 'peršun', 'sveže', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'teleca-corba'), 1, 'Skuvajte teleće meso u vodi.', 1),
  ((SELECT id FROM recipes WHERE slug = 'teleca-corba'), 2, 'Dodajte povrće i kuvajte do mekoće.', 2),
  ((SELECT id FROM recipes WHERE slug = 'teleca-corba'), 3, 'Začinite i posolite po ukusu.', 3);

-- 11. Pileći paprikaš
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'pileci-paprikas',
  'Pileći paprikaš',
  'Sočan paprikaš od piletine sa domaćim testeninama.',
  ARRAY['Ukusno i hranjivo', 'Porodično jelo', 'Lagano za pripremu'],
  25, 45, 4, 'Sandra Popović',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'pileci-paprikas' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'pileci-paprikas' AND c.slug = 'balkanska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'pileci-paprikas'), '600', 'g pilećih bataka', 1),
  ((SELECT id FROM recipes WHERE slug = 'pileci-paprikas'), '2', 'paprike', 2),
  ((SELECT id FROM recipes WHERE slug = 'pileci-paprikas'), '2', 'paradajza', 3),
  ((SELECT id FROM recipes WHERE slug = 'pileci-paprikas'), '2', 'kašike crvene paprike', 4),
  ((SELECT id FROM recipes WHERE slug = 'pileci-paprikas'), '300', 'g domaćih testenina', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'pileci-paprikas'), 1, 'Iseckajte piletinu i dinstajte sa lukom.', 1),
  ((SELECT id FROM recipes WHERE slug = 'pileci-paprikas'), 2, 'Dodajte papriku i paradajz.', 2),
  ((SELECT id FROM recipes WHERE slug = 'pileci-paprikas'), 3, 'Dodajte vodu i testenine, kuvajte.', 3);

-- 12. Torta od orašastih plodova
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'torta-orah',
  'Torta od orašastih plodova',
  'Klasična torta sa mnogo oraha i kremom.',
  ARRAY['Slatka i ukusna', 'Savršena za rođendan', 'Tradicionalni recept'],
  60, 45, 12, 'Vesna Todorović',
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'torta-orah' AND c.slug = 'torte' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'torta-orah' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'torta-orah'), '300', 'g mlevenih oraha', 1),
  ((SELECT id FROM recipes WHERE slug = 'torta-orah'), '6', 'jaja', 2),
  ((SELECT id FROM recipes WHERE slug = 'torta-orah'), '200', 'g šećera', 3),
  ((SELECT id FROM recipes WHERE slug = 'torta-orah'), '500', 'ml pavlake', 4),
  ((SELECT id FROM recipes WHERE slug = 'torta-orah'), 'čokolada', 'za dekoraciju', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'torta-orah'), 1, 'Umutite jaja sa šećerom, dodajte orahe.', 1),
  ((SELECT id FROM recipes WHERE slug = 'torta-orah'), 2, 'Pekjte koru na 180°C.', 2),
  ((SELECT id FROM recipes WHERE slug = 'torta-orah'), 3, 'Napunite kremom od pavlake i dekorisite.', 3);

-- 13. Ajvar
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'ajvar',
  'Domaći ajvar',
  'Tradicionalni ajvar od pečene paprike - za zimu.',
  ARRAY['Autentičan recept', 'Savršeno uz meso', 'Može da se čuva mesecima'],
  60, 120, 20, 'Miloš Đukić',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'ajvar' AND c.slug = 'zimnica' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'ajvar' AND c.slug = 'balkanska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'ajvar'), '5', 'kg crvene paprike', 1),
  ((SELECT id FROM recipes WHERE slug = 'ajvar'), '500', 'ml ulja', 2),
  ((SELECT id FROM recipes WHERE slug = 'ajvar'), 'so', 'po ukusu', 3),
  ((SELECT id FROM recipes WHERE slug = 'ajvar'), 'beli luk', 'po ukusu', 4),
  ((SELECT id FROM recipes WHERE slug = 'ajvar'), 'sirće', 'malo', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'ajvar'), 1, 'Ispecite paprike u rerni.', 1),
  ((SELECT id FROM recipes WHERE slug = 'ajvar'), 2, 'Skinite koru i sameljite.', 2),
  ((SELECT id FROM recipes WHERE slug = 'ajvar'), 3, 'Dinstajte sa uljem dok ne zgusne.', 3);

-- 14. Pljeskavica
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'pljeskavica',
  'Srpška pljeskavica',
  'Velika pljeskavica od mlevenog mesa - roštilj klasik.',
  ARRAY['Brzo se peče', 'Ukusna i sočna', 'Ide uz kajmak'],
  15, 15, 4, 'Bojan Stojanović',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'pljeskavica' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'pljeskavica' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'pljeskavica'), '600', 'g mlevenog mesa', 1),
  ((SELECT id FROM recipes WHERE slug = 'pljeskavica'), '1', 'crni luk', 2),
  ((SELECT id FROM recipes WHERE slug = 'pljeskavica'), 'so, biber', 'po ukusu', 3),
  ((SELECT id FROM recipes WHERE slug = 'pljeskavica'), 'česnak', 'prah', 4),
  ((SELECT id FROM recipes WHERE slug = 'pljeskavica'), 'lepinja', 'za servirati', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'pljeskavica'), 1, 'Pomešajte meso sa lukom i začinima.', 1),
  ((SELECT id FROM recipes WHERE slug = 'pljeskavica'), 2, 'Oblikujte pljeskavice i pecite na roštilju.', 2);

-- 15. Tarator
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'tarator',
  'Tarator - hladna čorba',
  'Osvježavajuća hladna čorba od jogurta i krastavca.',
  ARRAY['Savršeno za leto', 'Brza priprema', 'Lagan i ukusan'],
  10, 0, 4, 'Katarina Lazić',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'tarator' AND c.slug = 'supe-i-corbe' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'tarator' AND c.slug = 'balkanska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'tarator'), '500', 'g jogurta', 1),
  ((SELECT id FROM recipes WHERE slug = 'tarator'), '2', 'krastavca', 2),
  ((SELECT id FROM recipes WHERE slug = 'tarator'), '2', 'reznja belog luka', 3),
  ((SELECT id FROM recipes WHERE slug = 'tarator'), 'ulje, sirće', 'po ukusu', 4),
  ((SELECT id FROM recipes WHERE slug = 'tarator'), 'koper', 'svež', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'tarator'), 1, 'Izgnječite krastavac i beli luk.', 1),
  ((SELECT id FROM recipes WHERE slug = 'tarator'), 2, 'Pomešajte sa jogurtom, vodom i začinima. Ohladite.', 2);

-- 16. Musaka
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'musaka',
  'Musaka od krompira',
  'Tradicionalna musaka sa mlevenim mesom i krompirom.',
  ARRAY['Zadovoljavajuće jelo', 'Ostaje za sutra', 'Porodična tradicija'],
  45, 60, 6, 'Aleksandar Vuković',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'musaka' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'musaka' AND c.slug = 'balkanska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'musaka'), '1', 'kg krompira', 1),
  ((SELECT id FROM recipes WHERE slug = 'musaka'), '500', 'g mlevenog mesa', 2),
  ((SELECT id FROM recipes WHERE slug = 'musaka'), '2', 'jaja', 3),
  ((SELECT id FROM recipes WHERE slug = 'musaka'), '200', 'ml pavlake', 4),
  ((SELECT id FROM recipes WHERE slug = 'musaka'), '1', 'crni luk', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'musaka'), 1, 'Olistajte krompir i iseckajte.', 1),
  ((SELECT id FROM recipes WHERE slug = 'musaka'), 2, 'Dinstajte meso sa lukom.', 2),
  ((SELECT id FROM recipes WHERE slug = 'musaka'), 3, 'Poređajte slojeve u pleh, prelijte jajima i pecite.', 3);

-- 17. Baklava
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'baklava',
  'Baklava',
  'Slatki desert od fila kora, oraha i šećernog sirupa.',
  ARRAY['Raskošan desert', 'Autentičan ukus', 'Impresivan izgled'],
  60, 45, 16, 'Milica Ristić',
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'baklava' AND c.slug = 'torte' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'baklava' AND c.slug = 'balkanska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'baklava'), '500', 'g fila kora', 1),
  ((SELECT id FROM recipes WHERE slug = 'baklava'), '300', 'g mlevenih oraha', 2),
  ((SELECT id FROM recipes WHERE slug = 'baklava'), '400', 'g šećera', 3),
  ((SELECT id FROM recipes WHERE slug = 'baklava'), '200', 'g maslaca', 4),
  ((SELECT id FROM recipes WHERE slug = 'baklava'), 'limun', 'sok', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'baklava'), 1, 'Poređajte slojeve fila kora sa orasima.', 1),
  ((SELECT id FROM recipes WHERE slug = 'baklava'), 2, 'Pekjte i prelijte vrućim sirupom.', 2);

-- 18. Punjena tikvica
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'punjena-tikvica',
  'Punjena tikvica',
  'Tikvice punjene mesom i povrćem u paradajz sosu.',
  ARRAY['Lagan obrok', 'Veoma ukusno', 'Sezonska poslastica'],
  30, 50, 4, 'Tamara Jovanović',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'punjena-tikvica' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'punjena-tikvica' AND c.slug = 'mediteranska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'punjena-tikvica'), '4', 'veće tikvice', 1),
  ((SELECT id FROM recipes WHERE slug = 'punjena-tikvica'), '300', 'g mlevenog mesa', 2),
  ((SELECT id FROM recipes WHERE slug = 'punjena-tikvica'), '50', 'g pirinča', 3),
  ((SELECT id FROM recipes WHERE slug = 'punjena-tikvica'), '2', 'paradajza', 4),
  ((SELECT id FROM recipes WHERE slug = 'punjena-tikvica'), 'luk, česnak', 'po ukusu', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'punjena-tikvica'), 1, 'Ispraznite tikvice i napunite mesom.', 1),
  ((SELECT id FROM recipes WHERE slug = 'punjena-tikvica'), 2, 'Prelijte sosom i pecite.', 2);

-- 19. Čorbast pasulj
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'corbast-pasulj',
  'Čorbast pasulj',
  'Gusta čorba od belog pasulja sa suvim mesom.',
  ARRAY['Hranjiva i ukusna', 'Zagreva u zimu', 'Tradicionalni recept'],
  20, 90, 6, 'Ivan Petrović',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'corbast-pasulj' AND c.slug = 'supe-i-corbe' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'corbast-pasulj' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'corbast-pasulj'), '400', 'g belog pasulja', 1),
  ((SELECT id FROM recipes WHERE slug = 'corbast-pasulj'), '200', 'g suvog mesa', 2),
  ((SELECT id FROM recipes WHERE slug = 'corbast-pasulj'), '1', 'crni luk', 3),
  ((SELECT id FROM recipes WHERE slug = 'corbast-pasulj'), '2', 'kašike pavlake', 4),
  ((SELECT id FROM recipes WHERE slug = 'corbast-pasulj'), 'biber', 'po ukusu', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'corbast-pasulj'), 1, 'Namokrite pasulj preko noći.', 1),
  ((SELECT id FROM recipes WHERE slug = 'corbast-pasulj'), 2, 'Skuvajte sa suvim mesom i lukom.', 2),
  ((SELECT id FROM recipes WHERE slug = 'corbast-pasulj'), 3, 'Zagustite pavlakom i začinite.', 3);

-- 20. Kiflice
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'kiflice',
  'Softe kiflice',
  'Mekane kiflice - savršene za doručak.',
  ARRAY['Deca obožavaju', 'Brzo se prave', 'Ukusne i mekane'],
  40, 25, 24, 'Jovana Đorđević',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'kiflice' AND c.slug = 'pite-i-testa' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'kiflice' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'kiflice'), '500', 'g brašna', 1),
  ((SELECT id FROM recipes WHERE slug = 'kiflice'), '250', 'ml mleka', 2),
  ((SELECT id FROM recipes WHERE slug = 'kiflice'), '100', 'g maslaca', 3),
  ((SELECT id FROM recipes WHERE slug = 'kiflice'), '20', 'g kvasca', 4),
  ((SELECT id FROM recipes WHERE slug = 'kiflice'), '1', 'jaje', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'kiflice'), 1, 'Zamesite testo i ostavite da naraste.', 1),
  ((SELECT id FROM recipes WHERE slug = 'kiflice'), 2, 'Oblikujte kiflice i pecite.', 2);

-- 21. Spaghetti carbonara
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'spaghetti-carbonara',
  'Spaghetti carbonara',
  'Italijanska klasika - testenine sa slaninom i kremom od jaja.',
  ARRAY['Brza večera', 'Kremast i ukusan', 'Restoranski ukus'],
  15, 20, 4, 'Marco Rossi',
  'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'spaghetti-carbonara' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'spaghetti-carbonara' AND c.slug = 'italijanska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'spaghetti-carbonara'), '400', 'g špageta', 1),
  ((SELECT id FROM recipes WHERE slug = 'spaghetti-carbonara'), '200', 'g pančete', 2),
  ((SELECT id FROM recipes WHERE slug = 'spaghetti-carbonara'), '4', 'žumanjke', 3),
  ((SELECT id FROM recipes WHERE slug = 'spaghetti-carbonara'), '100', 'g parmezana', 4),
  ((SELECT id FROM recipes WHERE slug = 'spaghetti-carbonara'), 'biber', 'sveže mleven', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'spaghetti-carbonara'), 1, 'Skuvajte testenine.', 1),
  ((SELECT id FROM recipes WHERE slug = 'spaghetti-carbonara'), 2, 'Ispržite pančetu, dodajte testenine i žumanjke.', 2);

-- 22. Srpska salata
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'srpska-salata',
  'Srpska salata',
  'Klasicna salata od paradajza, krastavca i sira.',
  ARRAY['Brza i svježa', 'Ide uz sve', 'Lagan i zdrav'],
  15, 0, 4, 'Ljubica Stevanović',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'srpska-salata' AND c.slug = 'salate' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'srpska-salata' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'srpska-salata'), '4', 'paradajza', 1),
  ((SELECT id FROM recipes WHERE slug = 'srpska-salata'), '2', 'krastavca', 2),
  ((SELECT id FROM recipes WHERE slug = 'srpska-salata'), '1', 'crvena paprika', 3),
  ((SELECT id FROM recipes WHERE slug = 'srpska-salata'), '150', 'g belog sira', 4),
  ((SELECT id FROM recipes WHERE slug = 'srpska-salata'), 'ulje, sirće', 'po ukusu', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'srpska-salata'), 1, 'Iseckajte povrće i pomešajte sa sirom.', 1);

-- 23. Šnicle
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'snicle',
  'Bečke šnicle',
  'Tanke pržene šnicle u prezi - klasično jelo.',
  ARRAY['Jednostavno i ukusno', 'Porodično omiljeno', 'Brza priprema'],
  20, 15, 4, 'Dejan Milićević',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'snicle' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'snicle' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'snicle'), '4', 'veće šnicle', 1),
  ((SELECT id FROM recipes WHERE slug = 'snicle'), '2', 'jaja', 2),
  ((SELECT id FROM recipes WHERE slug = 'snicle'), '100', 'g prezle', 3),
  ((SELECT id FROM recipes WHERE slug = 'snicle'), 'limun', 'za sirćenje', 4),
  ((SELECT id FROM recipes WHERE slug = 'snicle'), 'ulje', 'za prženje', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'snicle'), 1, 'Razbijte šnicle i uvaljajte u brašno, jaje, prezu.', 1),
  ((SELECT id FROM recipes WHERE slug = 'snicle'), 2, 'Pržite na vrućem ulju do zlatne boje.', 2);

-- 24. Krofne
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'krofne',
  'Domaće krofne',
  'Mekane krofne sa džemom ili čokoladom.',
  ARRAY['Slatke i ukusne', 'Deca obožavaju', 'Savršene uz kafu'],
  60, 20, 12, 'Sonja Stanković',
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'krofne' AND c.slug = 'kolaci' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'krofne' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'krofne'), '500', 'g brašna', 1),
  ((SELECT id FROM recipes WHERE slug = 'krofne'), '250', 'ml mleka', 2),
  ((SELECT id FROM recipes WHERE slug = 'krofne'), '25', 'g kvasca', 3),
  ((SELECT id FROM recipes WHERE slug = 'krofne'), '2', 'jaja', 4),
  ((SELECT id FROM recipes WHERE slug = 'krofne'), 'džem', 'za punjenje', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'krofne'), 1, 'Zamesite testo i ostavite da naraste.', 1),
  ((SELECT id FROM recipes WHERE slug = 'krofne'), 2, 'Oblikujte krofne i pržite u ulju.', 2);

-- 25. Riblja čorba
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'riblja-corba',
  'Riblja čorba',
  'Bogata čorba od mešovite ribe sa povrćem.',
  ARRAY['Autentičan recept', 'Hranjiva i ukusna', 'Specijalitet za posebne prilike'],
  30, 60, 6, 'Vlade Ribar',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'riblja-corba' AND c.slug = 'supe-i-corbe' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'riblja-corba' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'riblja-corba'), '1', 'kg mešovite ribe', 1),
  ((SELECT id FROM recipes WHERE slug = 'riblja-corba'), '2', 'šargarepe', 2),
  ((SELECT id FROM recipes WHERE slug = 'riblja-corba'), '1', 'celer', 3),
  ((SELECT id FROM recipes WHERE slug = 'riblja-corba'), 'paradajz', 'pelat', 4),
  ((SELECT id FROM recipes WHERE slug = 'riblja-corba'), 'crvena paprika', 'kašika', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'riblja-corba'), 1, 'Skuvajte ribu u vodi.', 1),
  ((SELECT id FROM recipes WHERE slug = 'riblja-corba'), 2, 'Dodajte povrće i paradajz.', 2),
  ((SELECT id FROM recipes WHERE slug = 'riblja-corba'), 3, 'Začinite i posolite.', 3);

-- 26. Pizza margherita
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'pizza-margherita',
  'Pizza margherita',
  'Tradicionalna italijanska pizza sa paradajzom i mozzarellom.',
  ARRAY['Jednostavna i ukusna', 'Svi vole pizzu', 'Može domaći test'],
  45, 15, 2, 'Giuseppe Romano',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'pizza-margherita' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'pizza-margherita' AND c.slug = 'italijanska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'pizza-margherita'), '300', 'g testa za pizzu', 1),
  ((SELECT id FROM recipes WHERE slug = 'pizza-margherita'), '200', 'g paradajz pelata', 2),
  ((SELECT id FROM recipes WHERE slug = 'pizza-margherita'), '250', 'g mozzarelle', 3),
  ((SELECT id FROM recipes WHERE slug = 'pizza-margherita'), 'sveži bosiljak', 'listovi', 4),
  ((SELECT id FROM recipes WHERE slug = 'pizza-margherita'), 'maslinovo ulje', 'kašika', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'pizza-margherita'), 1, 'Razvaljajte testo i premažite pelatom.', 1),
  ((SELECT id FROM recipes WHERE slug = 'pizza-margherita'), 2, 'Dodajte mozzarellu i pecite na 250°C.', 2);

-- 27. Punjena paprika sa rizoto
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'paprike-rizoto',
  'Punjene paprike sa rizoto',
  'Paprike punjene aromatičnim rizoto umesto mesa.',
  ARRAY['Vegetarijanska verzija', 'Ukusna i lagana', 'Različit pristup'],
  35, 50, 4, 'Elena Pavlov',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'paprike-rizoto' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'paprike-rizoto' AND c.slug = 'mediteranska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'paprike-rizoto'), '6', 'paprika', 1),
  ((SELECT id FROM recipes WHERE slug = 'paprike-rizoto'), '200', 'g rizota', 2),
  ((SELECT id FROM recipes WHERE slug = 'paprike-rizoto'), '1', 'crni luk', 3),
  ((SELECT id FROM recipes WHERE slug = 'paprike-rizoto'), '2', 'paradajza', 4),
  ((SELECT id FROM recipes WHERE slug = 'paprike-rizoto'), 'sir', 'za posipanje', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'paprike-rizoto'), 1, 'Pripremite rizoto sa lukom.', 1),
  ((SELECT id FROM recipes WHERE slug = 'paprike-rizoto'), 2, 'Napunite paprike i pecite u sosu.', 2);

-- 28. Tulumbe
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'tulumbe',
  'Tulumbe',
  'Orijentalni slatkiš od prženog testa u sirupu.',
  ARRAY['Jednostavne za pripremu', 'Slatke i ukusne', 'Tradicionalni desert'],
  30, 30, 20, 'Amra Hodžić',
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'tulumbe' AND c.slug = 'kolaci' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'tulumbe' AND c.slug = 'balkanska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'tulumbe'), '250', 'g brašna', 1),
  ((SELECT id FROM recipes WHERE slug = 'tulumbe'), '200', 'ml vode', 2),
  ((SELECT id FROM recipes WHERE slug = 'tulumbe'), '100', 'g maslaca', 3),
  ((SELECT id FROM recipes WHERE slug = 'tulumbe'), '4', 'jaja', 4),
  ((SELECT id FROM recipes WHERE slug = 'tulumbe'), '400', 'g šećera', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'tulumbe'), 1, 'Skuvajte vodu, maslac i brašno u gusto testo.', 1),
  ((SELECT id FROM recipes WHERE slug = 'tulumbe'), 2, 'Dodajte jaja i oblikujte tulumbe. Pržite.', 2),
  ((SELECT id FROM recipes WHERE slug = 'tulumbe'), 3, 'Umočite u hladan šećerni sirup.', 3);

-- 29. Čevapi
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'cevapi',
  'Ćevapi',
  'Mali ćevapčići od mlevenog mesa - balkanska specijalnost.',
  ARRAY['Brzo se peku', 'Ukusni i sočni', 'Ide uz lepinju i kajmak'],
  25, 15, 4, 'Emir Kovač',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'cevapi' AND c.slug = 'glavna-jela' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'cevapi' AND c.slug = 'balkanska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'cevapi'), '600', 'g mlevenog mesa', 1),
  ((SELECT id FROM recipes WHERE slug = 'cevapi'), '1', 'mala glavica luka', 2),
  ((SELECT id FROM recipes WHERE slug = 'cevapi'), 'so, biber', 'po ukusu', 3),
  ((SELECT id FROM recipes WHERE slug = 'cevapi'), 'slatka paprika', 'kašika', 4),
  ((SELECT id FROM recipes WHERE slug = 'cevapi'), 'soda bikarbona', 'prstohvat', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'cevapi'), 1, 'Pomešajte meso sa lukom i začinima.', 1),
  ((SELECT id FROM recipes WHERE slug = 'cevapi'), 2, 'Oblikujte ćevape i pecite na roštilju.', 2);

-- 30. Salata od kupusa
INSERT INTO recipes (slug, title_sr, description_sr, why_youll_love, prep_time_minutes, cook_time_minutes, servings, author_name, image_url, status)
VALUES (
  'salata-kupus',
  'Salata od svežeg kupusa',
  'Svježa salata od belog kupusa sa sargarepom.',
  ARRAY['Brza i zdrava', 'Osvježavajuća', 'Idealna uz meso'],
  15, 0, 6, 'Zoran Milić',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'salata-kupus' AND c.slug = 'salate' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO recipe_categories (recipe_id, category_id) SELECT r.id, c.id FROM recipes r, categories c WHERE r.slug = 'salata-kupus' AND c.slug = 'srpska' ON CONFLICT (recipe_id, category_id) DO NOTHING;
INSERT INTO ingredients (recipe_id, amount, name_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'salata-kupus'), '1', 'mala glavica kupusa', 1),
  ((SELECT id FROM recipes WHERE slug = 'salata-kupus'), '2', 'šargarepe', 2),
  ((SELECT id FROM recipes WHERE slug = 'salata-kupus'), 'ulje, sirće', 'po ukusu', 3),
  ((SELECT id FROM recipes WHERE slug = 'salata-kupus'), 'so, šećer', 'po ukusu', 4),
  ((SELECT id FROM recipes WHERE slug = 'salata-kupus'), 'peršun', 'svež', 5);
INSERT INTO directions (recipe_id, step_number, instruction_sr, sort_order) VALUES
  ((SELECT id FROM recipes WHERE slug = 'salata-kupus'), 1, 'Naseckajte kupus i šargarepu.', 1),
  ((SELECT id FROM recipes WHERE slug = 'salata-kupus'), 2, 'Dodajte ulje, sirće i začine. Ostavite da odstoji.', 2);
