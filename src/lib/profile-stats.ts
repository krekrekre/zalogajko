import { createClient } from "@/lib/supabase/server";
import { getFollowerCount } from "@/lib/follows";

export type ProfileStats = {
  recipeCount: number;
  reviewCount: number;
  imageCount: number;
  followerCount: number;
};

/**
 * Get counts for a user's profile: recipes posted, reviews/comments, images, followers.
 */
export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const supabase = await createClient();

  const [recipesRes, reviewsRes, followerCount] = await Promise.all([
    supabase
      .from("recipes")
      .select("id, image_url", { count: "exact", head: false })
      .eq("author_id", userId)
      .eq("status", "published"),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "approved"),
    getFollowerCount(userId),
  ]);

  const recipes = (recipesRes.data ?? []) as { id: string; image_url: string | null }[];
  const recipeCount = recipes.length;
  const reviewCount = reviewsRes.count ?? 0;

  let imageCount = 0;
  if (recipes.length > 0) {
    const recipeIds = recipes.map((r) => r.id);
    imageCount += recipes.filter((r) => r.image_url).length;
    const { count: dirImgCount } = await supabase
      .from("directions")
      .select("id", { count: "exact", head: true })
      .in("recipe_id", recipeIds)
      .not("image_url", "is", null);
    imageCount += dirImgCount ?? 0;
  }

  return {
    recipeCount,
    reviewCount,
    imageCount,
    followerCount,
  };
}
