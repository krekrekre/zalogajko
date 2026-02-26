import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

interface Recipe {
  slug: string;
  title_sr: string;
  description_sr?: string;
  image_url?: string | null;
  created_at: string;
  categories?: Array<{ slug: string; name_sr: string }>;
}

interface HeroSectionProps {
  featuredRecipe?: Recipe | null;
  latestRecipes?: Recipe[];
}

// Placeholder latest recipes with fixed dates (no Date.now() during render)
const PLACEHOLDER_LATEST: Recipe[] = [
  {
    slug: "low-effort-dinners",
    title_sr: "12 Low-Effort Dinners (That Include Meat)",
    image_url: PLACEHOLDER_IMAGES.default,
    created_at: "2025-02-24T11:00:00.000Z",
    categories: [{ slug: "kitchen", name_sr: "U Kuhinji" }],
  },
  {
    slug: "stew-meat-recipes",
    title_sr: "15 Easy Stew Meat Recipes (That Aren't Stew!)",
    image_url: PLACEHOLDER_IMAGES.default,
    created_at: "2025-02-24T09:00:00.000Z",
    categories: [{ slug: "beef", name_sr: "Govedina" }],
  },
  {
    slug: "pulled-pork",
    title_sr:
      "The Pulled Pork Readers Say Is the 'Best Slow Cooker Recipe Ever'",
    image_url: PLACEHOLDER_IMAGES.default,
    created_at: "2025-02-24T07:00:00.000Z",
    categories: [{ slug: "kitchen", name_sr: "U Kuhinji" }],
  },
  {
    slug: "sausage-skillet",
    title_sr: "Sausage and Cabbage Skillet",
    image_url: PLACEHOLDER_IMAGES.default,
    created_at: "2025-02-24T05:00:00.000Z",
    categories: [{ slug: "one-pot", name_sr: "Jedan Lonac" }],
  },
  {
    slug: "famous-amos",
    title_sr:
      "Famous Amos Just Added a Beloved Cookie to Its Permanent Lineup for the First Time Ever",
    image_url: PLACEHOLDER_IMAGES.dessert,
    created_at: "2025-02-24T00:00:00.000Z",
    categories: [{ slug: "grocery", name_sr: "Namirnice" }],
  },
];

const PLACEHOLDER_FEATURED: Recipe = {
  slug: "vintage-casseroles",
  title_sr: "12 Vintage Casseroles You Can Make In Your Slow Cooker",
  description_sr:
    "These recipes have all the comforting, delicious, and nostalgic taste of your favorite casseroles, but they're a lot less fuss to make.",
  image_url: PLACEHOLDER_IMAGES.default,
  created_at: "2025-02-24T12:00:00.000Z",
  categories: [{ slug: "recipes", name_sr: "Recepti" }],
};

// Format relative time (e.g., "1 HOUR AGO")
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "SADA";
  if (diffHours === 1) return "PRE 1 SAT";
  if (diffHours < 24) return `PRE ${diffHours} SATA`;
  if (diffDays === 1) return "JUČE";
  if (diffDays < 7) return `PRE ${diffDays} DANA`;
  return date.toLocaleDateString("sr-RS");
}

// Get primary category name
function getCategoryName(recipe: Recipe): string {
  if (recipe.categories && recipe.categories.length > 0) {
    return recipe.categories[0].name_sr.toUpperCase();
  }
  return "RECEPTI";
}

function LatestCard({
  recipe,
  showHeart = false,
}: {
  recipe: Recipe;
  showHeart?: boolean;
}) {
  const imageUrl = recipe.image_url || PLACEHOLDER_IMAGES.default;
  const categoryName = getCategoryName(recipe);
  const timeAgo = formatTimeAgo(recipe.created_at);

  return (
    <Link
      href={`/recepti/${recipe.slug}`}
      className="group flex gap-3 py-3 border-b border-gray-200 last:border-b-0"
    >
      {/* Thumbnail */}
      <div className="relative w-28 h-[4.5rem] flex-shrink-0 overflow-hidden">
        <Image
          src={imageUrl}
          alt={recipe.title_sr}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="112px"
        />
        {showHeart && (
          <div className="absolute top-1 right-1">
            <Heart className="w-4 h-4 text-white fill-white/80" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-[var(--ar-gray-700)] uppercase mb-1">
          <span className="text-[var(--ar-primary)]">{categoryName}</span>
          <span className="text-gray-400">|</span>
          <span>{timeAgo}</span>
        </div>
        <h4 className="text-[15px] font-medium text-[var(--color-primary)] leading-snug line-clamp-2 group-hover:text-[var(--ar-primary)] transition-colors">
          {recipe.title_sr}
        </h4>
      </div>
    </Link>
  );
}

export function HeroSection({
  featuredRecipe,
  latestRecipes = [],
}: HeroSectionProps) {
  // Use placeholder data if no featured recipe
  const featured = featuredRecipe || PLACEHOLDER_FEATURED;

  const featuredImage = featured.image_url || PLACEHOLDER_IMAGES.default;
  const featuredCategory = getCategoryName(featured);

  return (
    <section className="w-full bg-white py-6 pb-[10vh]">
      <div className="mx-auto max-w-[1284px] px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Featured Article */}
          <div className="flex-1 lg:w-[65%]">
            <Link href={`/recepti/${featured.slug}`} className="group block">
              <div className="mb-3 text-center text-6xl font-extrabold uppercase tracking-widest text-[var(--color-primary)] sm:text-7xl lg:text-8xl">
                TEST
              </div>
              {/* Featured Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={featuredImage}
                  alt={featured.title_sr}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 65vw"
                />
              </div>

              {/* Featured Content */}
              <div className="mt-4">
                <span className="text-[11px] font-bold tracking-widest text-[var(--color-primary)] uppercase">
                  {featuredCategory}
                </span>
                <span className="mt-2 block text-[30px] font-medium text-[var(--color-primary)] leading-tight tracking-tight group-hover:text-[var(--ar-primary)] transition-colors font-dynapuff">
                  {featured.title_sr}
                </span>
                {featured.description_sr && (
                  <p className="mt-3 text-[15px] text-[var(--color-primary)] leading-relaxed">
                    {featured.description_sr}
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* Right: The Latest */}
          <div className="lg:w-[35%] lg:max-w-[380px]">
            <div className="mb-4 border-b-4 border-[var(--ar-primary)]">
              <h2 className="font-dynapuff text-[36px] font-medium leading-tight tracking-tight text-[var(--color-primary)]">
                Najnovije
              </h2>
            </div>

            <div className="flex flex-col">
              {latestRecipes.length > 0 ? (
                latestRecipes.slice(0, 6).map((recipe, index) => (
                  <LatestCard
                    key={recipe.slug}
                    recipe={recipe}
                    showHeart={index === 4} // Show heart on 5th item
                  />
                ))
              ) : (
                // Placeholder cards when no data
                PLACEHOLDER_LATEST.map((recipe, index) => (
                  <LatestCard
                    key={recipe.slug}
                    recipe={recipe}
                    showHeart={index === 4}
                  />
                ))
              )}
            </div>

            {/* See More button */}
            <div className="mt-4">
              <Link
                href="/recepti"
                className="inline-block border-2 border-[var(--color-primary)] bg-white px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-[var(--color-primary)] transition-all duration-200 hover:scale-105 hover:bg-[var(--ar-primary)] hover:text-[var(--color-primary)] hover:border-[var(--ar-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ar-primary)] focus-visible:ring-offset-2"
              >
                Vidi više
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
