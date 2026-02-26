import { HeroSection } from "@/components/home/HeroSection";
import { LatestRecipes } from "@/components/home/LatestRecipes";
import { SaveRecipesBanner } from "@/components/home/SaveRecipesBanner";
import { FeaturedRecipeCards } from "@/components/home/FeaturedRecipeCards";
import { SearchSection } from "@/components/home/SearchSection";
import { MeatlessMealIdeas } from "@/components/home/MeatlessMealIdeas";
import { CommunitySection } from "@/components/home/CommunitySection";
import { TopicHubs } from "@/components/home/TopicHubs";
import { getPublishedRecipes, getFeaturedRecipesWithReviews, getSectionRecipes } from "@/lib/queries/recipes";

export default async function HomePage() {
  let recipes: Awaited<ReturnType<typeof getPublishedRecipes>> = [];
  let featuredRecipes: Awaited<ReturnType<typeof getFeaturedRecipesWithReviews>> = [];
  let sectionRecipes: Awaited<ReturnType<typeof getSectionRecipes>> = [];
  try {
    [recipes, featuredRecipes, sectionRecipes] = await Promise.all([
      getPublishedRecipes(12),
      getFeaturedRecipesWithReviews(6),
      getSectionRecipes(null, 6),
    ]);
  } catch {
    // Supabase not configured or schema not applied — show empty state
  }

  const featuredRecipe = recipes[0] || null;

  return (
    <>
      <HeroSection
        featuredRecipe={recipes[0] || null}
        latestRecipes={recipes.slice(1, 7)}
      />
      <FeaturedRecipeCards recipes={featuredRecipes} />
      <SearchSection />
      <MeatlessMealIdeas recipes={sectionRecipes} />
      <SaveRecipesBanner />
      <LatestRecipes recipes={recipes} />
      <CommunitySection />
      <TopicHubs />
    </>
  );
}
