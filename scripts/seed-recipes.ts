/**
 * Seed script: deletes all recipes and inserts 30 mock recipes with real Serbian titles
 * and lorem ipsum for descriptions/instructions. Run from project root:
 *
 *   npm run seed
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   (required for inserts; get from Supabase Dashboard → Settings → API)
 */

import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env.local and .env from recepti folder
const projectRoot = path.resolve(__dirname, "..");
config({ path: path.join(projectRoot, ".env.local") });
config({ path: path.join(projectRoot, ".env") });

// Support common variable names (no spaces around = in .env)
const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL
)?.trim();
const SUPABASE_SERVICE_ROLE = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE
)?.trim();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error(
    "Missing Supabase URL or service role key. Expected in .env.local (in recepti folder):"
  );
  console.error("  NEXT_PUBLIC_SUPABASE_URL=your-project-url");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
  if (!SUPABASE_URL) console.error("  -> NEXT_PUBLIC_SUPABASE_URL is missing or empty.");
  if (!SUPABASE_SERVICE_ROLE) {
    console.error("  -> SUPABASE_SERVICE_ROLE_KEY is missing or empty.");
    console.error("     Check: no space around =, key name exactly SUPABASE_SERVICE_ROLE_KEY, line not commented with #.");
  }
  process.exit(1);
}

const SUPABASE_KEY = SUPABASE_SERVICE_ROLE;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/š/g, "s")
    .replace(/č|ć/g, "c")
    .replace(/đ/g, "d")
    .replace(/ž/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";
const LOREM_STEP =
  "Ut aliquet tristique nisl. Pellentesque habitant morbi tristique senectus. Donec vitae sapien ut libero venenatis faucibus.";

const REAL_TITLES = [
  "Sarma",
  "Punjene paprike",
  "Karadjordjeva šnicla",
  "Gibanica",
  "Čorba od sočiva",
  "Palačinke sa džemom",
  "Pasulj prebranac",
  "Mućkalica",
  "Karađorđeva šnicla",
  "Podvarak",
  "Proja",
  "Satarash",
  "Đuveč",
  "Čvarci",
  "Kiseli kupus",
  "Pileća supa",
  "Šnicle u sosu",
  "Tulumba",
  "Krofne",
  "Pita sa sirom",
  "Čorba od pilećih grudi",
  "Pljeskavica",
  "Ćevapi",
  "Baklava",
  "Pita sa jabukama",
  "Kuvana svinjetina",
  "Pečena šunka",
  "Štrudla sa višnjama",
  "Riblja čorba",
  "Teleća čorba",
];

const SAMPLE_INGREDIENTS = [
  { amount: "500", unit_sr: "g", name_sr: "Mleveno meso" },
  { amount: "1", unit_sr: "glavica", name_sr: "Crni luk" },
  { amount: "2", unit_sr: "češnja", name_sr: "Beli luk" },
  { amount: "200", unit_sr: "ml", name_sr: "Pavlaka" },
  { amount: "1", unit_sr: "kašika", name_sr: "Vegeta" },
  { amount: "so", unit_sr: null, name_sr: "So" },
  { amount: "biber", unit_sr: null, name_sr: "Mleveni biber" },
  { amount: "3", unit_sr: "kom", name_sr: "Jaja" },
  { amount: "400", unit_sr: "g", name_sr: "Brasno" },
  { amount: "100", unit_sr: "g", name_sr: "Sir" },
  { amount: "1", unit_sr: "kg", name_sr: "Krompir" },
  { amount: "500", unit_sr: "g", name_sr: "Kiseli kupus" },
  { amount: "2", unit_sr: "kašike", name_sr: "Ulje" },
  { amount: "1", unit_sr: "litra", name_sr: "Voda" },
  { amount: "200", unit_sr: "g", name_sr: "Šargarepa" },
];

const SKILL_LEVELS = ["lako", "srednje", "tesko"] as const;

// 10 recipe images (Unsplash, free to use) – reused across recipes
const RECIPE_IMAGES = [
  "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
];

async function main() {
  console.log("Fetching categories...");
  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id, slug, type")
    .in("type", ["meal_type", "cuisine"])
    .order("type")
    .order("sort_order");

  if (catErr || !categories?.length) {
    console.warn("No categories found; recipe_categories will be empty.", catErr?.message);
  }

  const mealCategories = (categories ?? []).filter((c: { type: string }) => c.type === "meal_type");
  const cuisineCategories = (categories ?? []).filter((c: { type: string }) => c.type === "cuisine");

  console.log("Fetching existing recipe IDs...");
  const { data: existingRecipes } = await supabase.from("recipes").select("id");
  const recipeIds = (existingRecipes ?? []).map((r: { id: string }) => r.id);

  if (recipeIds.length > 0) {
    console.log("Deleting child rows for", recipeIds.length, "recipes...");
    await supabase.from("recipe_nutrition").delete().in("recipe_id", recipeIds);
    await supabase.from("recipe_categories").delete().in("recipe_id", recipeIds);
    await supabase.from("directions").delete().in("recipe_id", recipeIds);
    await supabase.from("ingredients").delete().in("recipe_id", recipeIds);
    await supabase.from("reviews").delete().in("recipe_id", recipeIds);
    await supabase.from("ratings").delete().in("recipe_id", recipeIds);
    await supabase.from("saved_recipes").delete().in("recipe_id", recipeIds);
    await supabase.from("comments").delete().in("recipe_id", recipeIds);
    await supabase.from("recipes").delete().in("id", recipeIds);
    console.log("All recipes and related data deleted.");
  } else {
    console.log("No existing recipes to delete.");
  }

  for (let i = 0; i < REAL_TITLES.length; i++) {
    const title = REAL_TITLES[i];
    const slug = slugify(title) + "-" + (i + 1);
    const prep = 15 + (i % 5) * 5;
    const cook = 30 + (i % 6) * 10;
    const servings = 4 + (i % 4);
    const skillIndex = i % 3;
    const skill = SKILL_LEVELS[skillIndex];

    const { data: recipe, error: recipeErr } = await supabase
      .from("recipes")
      .insert({
        slug,
        title_sr: title,
        description_sr: LOREM,
        why_youll_love: [LOREM.slice(0, 40) + ".", LOREM.slice(40, 85) + "."],
        prep_time_minutes: prep,
        cook_time_minutes: cook,
        servings,
        author_name: "Domaći kuvar",
        image_url: RECIPE_IMAGES[i % RECIPE_IMAGES.length],
        status: "published",
        skill_level: skill,
      })
      .select("id")
      .single();

    if (recipeErr || !recipe) {
      console.error("Insert recipe failed:", title, recipeErr?.message);
      continue;
    }

    const recipeId = recipe.id;

    const numIngredients = 5 + (i % (SAMPLE_INGREDIENTS.length - 4));
    const ings = SAMPLE_INGREDIENTS.slice(0, numIngredients).map((ing, sort_order) => ({
      recipe_id: recipeId,
      amount: ing.amount,
      unit_sr: ing.unit_sr,
      name_sr: ing.name_sr,
      sort_order,
    }));
    await supabase.from("ingredients").insert(ings);

    const numSteps = 3 + (i % 4);
    const steps = Array.from({ length: numSteps }, (_, k) => ({
      recipe_id: recipeId,
      step_number: k + 1,
      instruction_sr: LOREM_STEP,
      sort_order: k,
      image_url: null,
    }));
    await supabase.from("directions").insert(steps);

    if (mealCategories.length > 0) {
      const mealCat = mealCategories[i % mealCategories.length];
      const links: { recipe_id: string; category_id: string }[] = [
        { recipe_id: recipeId, category_id: mealCat.id },
      ];
      if (cuisineCategories.length > 0) {
        const cuisineCat = cuisineCategories[i % cuisineCategories.length];
        links.push({ recipe_id: recipeId, category_id: cuisineCat.id });
      }
      await supabase.from("recipe_categories").insert(links);
    }

    if (i % 3 === 0) {
      await supabase.from("recipe_nutrition").insert({
        recipe_id: recipeId,
        calories: 250 + (i % 20) * 25,
        fat_g: 10 + (i % 8),
        carbs_g: 25 + (i % 15),
        protein_g: 15 + (i % 12),
      });
    }

    console.log(`Inserted: ${title} (${slug})`);
  }

  console.log("Done. 30 mock recipes created.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
