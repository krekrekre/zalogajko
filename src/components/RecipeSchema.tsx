interface RecipeSchemaProps {
  recipe: {
    title_sr: string;
    description_sr: string | null;
    image_url: string | null;
    prep_time_minutes: number;
    cook_time_minutes: number;
    servings: number;
    rating_avg?: number | null;
    rating_count?: number;
    ingredients?: Array<{ amount: string | null; unit_sr: string | null; name_sr: string }>;
    directions?: Array<{ instruction_sr: string }>;
    recipe_nutrition?: {
      calories: number | null;
      fat_g: number | null;
      carbs_g: number | null;
      protein_g: number | null;
    } | null;
  };
  baseUrl?: string;
}

function formatDuration(minutes: number) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `PT${h}H${m > 0 ? `${m}M` : ""}`;
  }
  return `PT${minutes}M`;
}

export function RecipeSchema({ recipe, baseUrl = "https://recepti.rs" }: RecipeSchemaProps) {
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const ingredients = (recipe.ingredients || [])
    .sort((a, b) => ((a as { sort_order?: number }).sort_order ?? 0) - ((b as { sort_order?: number }).sort_order ?? 0))
    .map((i) => {
      const parts = [i.amount, i.unit_sr, i.name_sr].filter(Boolean);
      return parts.join(" ");
    });
  const instructions = (recipe.directions || [])
    .sort((a, b) => ((a as { sort_order?: number }).sort_order ?? 0) - ((b as { sort_order?: number }).sort_order ?? 0))
    .map((d) => ({ "@type": "HowToStep", text: d.instruction_sr }));

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title_sr,
    description: recipe.description_sr || undefined,
    image: recipe.image_url ? (recipe.image_url.startsWith("http") ? recipe.image_url : `${baseUrl}${recipe.image_url}`) : undefined,
    prepTime: formatDuration(recipe.prep_time_minutes),
    cookTime: formatDuration(recipe.cook_time_minutes),
    totalTime: formatDuration(totalTime),
    recipeYield: recipe.servings,
    recipeIngredient: ingredients,
    recipeInstructions: instructions,
  };

  if (recipe.recipe_nutrition?.calories != null) {
    schema.nutrition = {
      "@type": "NutritionInformation",
      calories: `${recipe.recipe_nutrition.calories} calories`,
      fatContent: recipe.recipe_nutrition.fat_g != null ? `${recipe.recipe_nutrition.fat_g}g` : undefined,
      carbohydrateContent: recipe.recipe_nutrition.carbs_g != null ? `${recipe.recipe_nutrition.carbs_g}g` : undefined,
      proteinContent: recipe.recipe_nutrition.protein_g != null ? `${recipe.recipe_nutrition.protein_g}g` : undefined,
    };
  }

  if (recipe.rating_count != null && recipe.rating_count > 0 && recipe.rating_avg != null) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: recipe.rating_avg.toFixed(1),
      reviewCount: recipe.rating_count,
      bestRating: "5",
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
