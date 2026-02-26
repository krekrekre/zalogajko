// Recipe & category types for the app

export type CategoryType =
  | "meal_type"
  | "cuisine"
  | "diet"
  | "occasion"
  | "cooking_method";

export interface Category {
  id: string;
  slug: string;
  name_sr: string;
  name_en: string | null;
  type: CategoryType;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Recipe {
  id: string;
  slug: string;
  title_sr: string;
  description_sr: string | null;
  why_youll_love: string[] | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  author_id: string | null;
  author_name: string | null;
  image_url: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  categories?: Category[];
  ingredients?: Ingredient[];
  directions?: Direction[];
  rating_avg?: number;
  rating_count?: number;
  review_count?: number;
}

export interface Ingredient {
  id: string;
  recipe_id: string;
  amount: string | null;
  unit_sr: string | null;
  name_sr: string;
  sort_order: number;
}

export interface Direction {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction_sr: string;
  image_url: string | null;
  sort_order: number;
}

export interface RecipeNutrition {
  recipe_id: string;
  calories: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  protein_g: number | null;
}
