"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ImagePlus } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name_sr: string;
  type: string;
}

interface AddRecipeFormProps {
  userId: string;
  categories: Category[];
}

const SKILL_LEVELS = [
  { value: "lako", label: "Lako" },
  { value: "srednje", label: "Srednje" },
  { value: "tesko", label: "Teško" },
] as const;

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

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-none border-2 border-gray-200 bg-white p-6 shadow-sm ${className}`}
    >
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FormField({
  label,
  required,
  children,
  id,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[var(--color-primary)]"
      >
        {label}
        {required && <span className="text-[var(--color-orange)]"> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-none border-2 border-gray-300 bg-[#f1f1e6] px-4 py-3 text-[15px] text-[var(--color-primary)] placeholder:text-gray-500 outline-none transition-all focus:bg-[#f1f1e6] focus-visible:border-[var(--color-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]/25";
const inputClassSmall =
  "rounded-none border-2 border-gray-300 bg-[#f1f1e6] px-3 py-2 text-sm text-[var(--color-primary)] placeholder:text-gray-500 outline-none transition-all focus:bg-[#f1f1e6] focus-visible:border-[var(--color-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]/25";

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  id,
  label,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  id: string;
  label: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("click", onOutside);
    return () => document.removeEventListener("click", onOutside);
  }, [open]);

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[var(--color-primary)]"
      >
        {label}
        {required && <span className="text-[var(--color-orange)]"> *</span>}
      </label>
      <div ref={ref} className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`${inputClass} w-full cursor-pointer text-left flex items-center justify-between gap-2`}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span
            className={
              selected ? "text-[var(--color-primary)]" : "text-gray-500"
            }
          >
            {selected ? selected.label : placeholder}
          </span>
          <svg
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          role="listbox"
          className={`absolute left-0 right-0 top-full z-50 mt-1 overflow-visible rounded-none border-2 border-gray-200 bg-white py-1 shadow-lg origin-top transition-all duration-200 ease-out ${
            open
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0"
          }`}
        >
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`w-full cursor-pointer px-4 py-2.5 text-left text-sm hover:bg-[#f1f1e6] ${!value ? "bg-[#f1f1e6] font-medium" : "text-[var(--color-primary)]"}`}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full cursor-pointer px-4 py-2.5 text-left text-sm hover:bg-[#f1f1e6] ${value === opt.value ? "bg-[#f1f1e6] font-medium" : "text-[var(--color-primary)]"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AddRecipeForm({ userId, categories }: AddRecipeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [whyYoullLove, setWhyYoullLove] = useState<string[]>([""]);
  const [prepTime, setPrepTime] = useState<number | "">("");
  const [cookTime, setCookTime] = useState<number | "">("");
  const [servings, setServings] = useState<number | "">("");
  const [skillLevel, setSkillLevel] = useState<string>("");
  const [status] = useState<"published">("published");
  const [categoryId, setCategoryId] = useState<string>("");
  const [cuisineId, setCuisineId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const prevPreviewUrlRef = useRef<string | null>(null);
  const ingredientRefs = useRef<(HTMLInputElement | null)[][]>([]);
  const directionRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const whyYoullLoveRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setImageFileWithPreview = useCallback((file: File | null) => {
    if (prevPreviewUrlRef.current)
      URL.revokeObjectURL(prevPreviewUrlRef.current);
    prevPreviewUrlRef.current = null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      prevPreviewUrlRef.current = url;
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, []);

  const [calories, setCalories] = useState<number | "">("");
  const [fatG, setFatG] = useState<number | "">("");
  const [carbsG, setCarbsG] = useState<number | "">("");
  const [proteinG, setProteinG] = useState<number | "">("");

  const mealCategories = categories.filter((c) => c.type === "meal_type");
  const cuisineCategories = categories.filter((c) => c.type === "cuisine");

  const [ingredients, setIngredients] = useState<
    Array<{ amount: string; unit: string; name: string }>
  >([{ amount: "", unit: "", name: "" }]);
  const [directions, setDirections] = useState<
    Array<{ text: string; imageFile: File | null; imagePreviewUrl?: string }>
  >([{ text: "", imageFile: null }]);

  const addIngredient = useCallback(() => {
    setIngredients((prev) => [...prev, { amount: "", unit: "", name: "" }]);
  }, []);
  const focusIngredient = useCallback((rowIdx: number, fieldIdx: number) => {
    setTimeout(() => {
      const row = ingredientRefs.current[rowIdx];
      if (row?.[fieldIdx]) row[fieldIdx]?.focus();
    }, 50);
  }, []);
  const handleIngredientKeyDown = useCallback(
    (rowIdx: number, fieldIdx: number, e: React.KeyboardEvent) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (fieldIdx < 2) {
        focusIngredient(rowIdx, fieldIdx + 1);
      } else if (rowIdx < ingredients.length - 1) {
        focusIngredient(rowIdx + 1, 0);
      } else {
        const nextRow = ingredients[rowIdx + 1];
        const nextRowEmpty =
          nextRow &&
          !nextRow.amount.trim() &&
          !nextRow.unit.trim() &&
          !nextRow.name.trim();
        if (nextRowEmpty) {
          focusIngredient(rowIdx + 1, 0);
        } else {
          addIngredient();
          focusIngredient(ingredients.length, 0);
        }
      }
    },
    [ingredients, addIngredient, focusIngredient],
  );
  const removeIngredient = (i: number) =>
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  const updateIngredient = (
    i: number,
    field: "amount" | "unit" | "name",
    value: string,
  ) => {
    setIngredients((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    );
  };

  const addDirection = useCallback(() => {
    setDirections((prev) => [...prev, { text: "", imageFile: null }]);
  }, []);
  const focusDirection = useCallback((idx: number) => {
    setTimeout(() => directionRefs.current[idx]?.focus(), 50);
  }, []);
  const handleDirectionKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const nextStep = directions[idx + 1];
        if (nextStep && !nextStep.text.trim()) {
          focusDirection(idx + 1);
        } else {
          addDirection();
          focusDirection(directions.length);
        }
      }
    },
    [directions, addDirection, focusDirection],
  );
  const removeDirection = (i: number) =>
    setDirections((prev) => prev.filter((_, idx) => idx !== i));
  const updateDirection = (i: number, value: string) =>
    setDirections((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, text: value } : item)),
    );
  const focusWhyYoullLove = useCallback((idx: number) => {
    setTimeout(() => whyYoullLoveRefs.current[idx]?.focus(), 50);
  }, []);
  const handleWhyYoullLoveKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (idx < whyYoullLove.length - 1) {
        focusWhyYoullLove(idx + 1);
      } else if (whyYoullLove.length < 3) {
        setWhyYoullLove((prev) => {
          const next = [...prev, ""];
          setTimeout(
            () => whyYoullLoveRefs.current[next.length - 1]?.focus(),
            50,
          );
          return next;
        });
      }
    },
    [whyYoullLove.length, focusWhyYoullLove],
  );
  const setDirectionImage = (i: number, file: File | null) =>
    setDirections((prev) => {
      const next = prev.map((item, idx) => {
        if (idx !== i) return item;
        if (item.imagePreviewUrl) URL.revokeObjectURL(item.imagePreviewUrl);
        return {
          ...item,
          imageFile: file,
          imagePreviewUrl: file ? URL.createObjectURL(file) : undefined,
        };
      });
      return next;
    });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!skillLevel.trim()) {
      setError("Izaberite težinu pripreme.");
      setLoading(false);
      return;
    }
    if (!imageFile) {
      setError("Dodajte sliku recepta.");
      setLoading(false);
      return;
    }
    if (!description.trim()) {
      setError("Unesite opis recepta.");
      setLoading(false);
      return;
    }
    if (!categoryId) {
      setError("Izaberite kategoriju.");
      setLoading(false);
      return;
    }
    const prep =
      typeof prepTime === "number" ? prepTime : parseInt(String(prepTime)) || 0;
    const cook =
      typeof cookTime === "number" ? cookTime : parseInt(String(cookTime)) || 0;
    const serv =
      typeof servings === "number" ? servings : parseInt(String(servings)) || 1;
    if (prep <= 0) {
      setError("Unesite vreme pripreme (min).");
      setLoading(false);
      return;
    }
    if (serv < 1) {
      setError("Unesite broj porcija (najmanje 1).");
      setLoading(false);
      return;
    }
    const hasIngredient = ingredients.some((i) => i.name.trim());
    if (!hasIngredient) {
      setError("Dodajte najmanje jedan sastojak sa nazivom.");
      setLoading(false);
      return;
    }
    const hasStep = directions.some((d) => d.text.trim());
    if (!hasStep) {
      setError("Dodajte najmanje jedan korak pripreme.");
      setLoading(false);
      return;
    }

    const slug = slugify(title) + "-" + Date.now().toString(36);
    const whyArr = whyYoullLove.filter((s) => s.trim()).map((s) => s.trim());

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const authorName =
        (user?.user_metadata?.display_name as string)?.trim() || null;

      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
          ? ext
          : "jpg";
        const path = `${userId}/${slug}-${Date.now()}.${safeExt}`;
        const { error: uploadError } = await supabase.storage
          .from("recipe-images")
          .upload(path, imageFile, {
            upsert: true,
            cacheControl: "3600",
          });
        if (uploadError) {
          setError(`Slika nije učitana: ${uploadError.message}`);
          setLoading(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("recipe-images")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          slug,
          title_sr: title,
          description_sr: description || null,
          why_youll_love: whyArr.length > 0 ? whyArr : null,
          prep_time_minutes: prep,
          cook_time_minutes: cook,
          servings: serv,
          author_id: userId,
          author_name: authorName,
          image_url: imageUrl,
          status,
          skill_level: skillLevel || null,
        })
        .select("id")
        .single();

      if (recipeError) throw recipeError;
      if (!recipe) throw new Error("Failed to create recipe");

      const ingredientRows = ingredients
        .filter((i) => i.name.trim())
        .map((ing, sort_order) => ({
          recipe_id: recipe.id,
          amount: ing.amount || null,
          unit_sr: ing.unit || null,
          name_sr: ing.name,
          sort_order,
        }));
      if (ingredientRows.length > 0) {
        const { error: ingredientError } = await supabase
          .from("ingredients")
          .insert(ingredientRows);
        if (ingredientError) throw ingredientError;
      }

      const filteredDirections = directions.filter((d) => d.text.trim());
      const directionRowsWithImages: Array<{
        recipe_id: string;
        step_number: number;
        instruction_sr: string;
        sort_order: number;
        image_url: string | null;
      }> = [];
      for (let i = 0; i < filteredDirections.length; i++) {
        const stepData = filteredDirections[i];
        let imageUrl: string | null = null;
        if (stepData.imageFile) {
          const ext =
            stepData.imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
          const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
            ? ext
            : "jpg";
          const path = `${userId}/${recipe.id}/step-${i}.${safeExt}`;
          const { error: upErr } = await supabase.storage
            .from("recipe-images")
            .upload(path, stepData.imageFile, {
              upsert: true,
              cacheControl: "3600",
            });
          if (!upErr) {
            const { data: urlData } = supabase.storage
              .from("recipe-images")
              .getPublicUrl(path);
            imageUrl = urlData.publicUrl;
          }
        }
        directionRowsWithImages.push({
          recipe_id: recipe.id,
          step_number: i + 1,
          instruction_sr: stepData.text,
          sort_order: i,
          image_url: imageUrl,
        });
      }
      if (directionRowsWithImages.length > 0) {
        const { error: directionsError } = await supabase
          .from("directions")
          .insert(directionRowsWithImages);
        if (directionsError) throw directionsError;
      }

      const categoryIds = [categoryId, cuisineId].filter(Boolean);
      if (categoryIds.length > 0) {
        await supabase.from("recipe_categories").insert(
          categoryIds.map((category_id) => ({
            recipe_id: recipe.id,
            category_id,
          })),
        );
      }

      const hasNutrition =
        calories !== "" || fatG !== "" || carbsG !== "" || proteinG !== "";
      if (hasNutrition) {
        try {
          await supabase.from("recipe_nutrition").upsert({
            recipe_id: recipe.id,
            calories: calories !== "" ? Number(calories) : null,
            fat_g: fatG !== "" ? Number(fatG) : null,
            carbs_g: carbsG !== "" ? Number(carbsG) : null,
            protein_g: proteinG !== "" ? Number(proteinG) : null,
          });
        } catch {
          // RLS may not allow INSERT
        }
      }

      router.push(`/recepti/${slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nešto je pošlo po zlu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-8 w-full max-w-[1220px] space-y-8"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const t = e.target as HTMLElement;
          if (t.tagName === "TEXTAREA") return;
          e.preventDefault();
        }
      }}
    >
      {error && (
        <div className="rounded-none border-2 border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <Section title="Osnovne informacije">
            <div className="space-y-4">
              <FormField label="Naziv recepta" required id="title">
                <Input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="npr. Palaćinke sa džemom"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Težina pripreme" required id="skill_level">
                <div className="flex flex-wrap gap-2">
                  {SKILL_LEVELS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() =>
                        setSkillLevel(skillLevel === s.value ? "" : s.value)
                      }
                      className={`cursor-pointer rounded-none border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                        skillLevel === s.value
                          ? "border-[var(--color-orange)] bg-[var(--color-orange)] text-white"
                          : "border-gray-300 bg-[#f1f1e6] text-[var(--color-primary)] hover:border-[var(--color-orange)]/50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
          </Section>

          <Section title="Slika recepta">
            <FormField label="Fotografija" required id="image-upload">
              <label
                htmlFor="image-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-none border-2 border-dashed border-gray-300 bg-[#f1f1e6] py-10 px-4 transition-colors hover:border-[var(--color-orange)] hover:bg-[var(--color-orange)]/5 focus-within:ring-2 focus-within:ring-[var(--color-orange)]/25"
              >
                <input
                  ref={imageInputRef}
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) =>
                    setImageFileWithPreview(e.target.files?.[0] ?? null)
                  }
                  className="sr-only"
                />
                {imageFile && imagePreviewUrl ? (
                  <>
                    <Image
                      src={imagePreviewUrl}
                      alt="Pregled"
                      width={320}
                      height={128}
                      className="mb-2 max-h-32 rounded-none object-cover"
                      unoptimized
                    />
                    <span className="text-sm font-medium text-[var(--color-primary)] truncate max-w-full px-2">
                      {imageFile.name}
                    </span>
                    <span className="mt-1 text-xs text-gray-600">
                      Klikni za promenu
                    </span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="mb-2 h-10 w-10 text-gray-500" />
                    <span className="text-sm font-medium text-[var(--color-primary)]">
                      Klikni da dodaš sliku
                    </span>
                    <span className="mt-1 text-xs text-gray-600">
                      JPG, PNG ili WebP
                    </span>
                  </>
                )}
              </label>
            </FormField>
          </Section>

          <Section title="Opis">
            <FormField label="Opis recepta" required id="description">
              <textarea
                id="description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onInput={(e) => {
                  const ta = e.target as HTMLTextAreaElement;
                  ta.style.height = "auto";
                  ta.style.height = `${Math.max(100, ta.scrollHeight)}px`;
                }}
                placeholder="Kratak opis jela..."
                className={
                  inputClass + " resize-none overflow-y-auto min-h-[100px]"
                }
              />
            </FormField>
          </Section>

          <Section title="Zašto ćete voleti (opciono)">
            <p className="mb-2 text-sm text-gray-600">Do 3 tačke.</p>
            <div className="space-y-2">
              {whyYoullLove.map((val, i) => (
                <div key={i} className="flex gap-2 items-center flex-wrap">
                  <input
                    ref={(el) => {
                      whyYoullLoveRefs.current[i] = el;
                    }}
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const v = [...whyYoullLove];
                      v[i] = e.target.value;
                      setWhyYoullLove(v);
                    }}
                    onKeyDown={(e) => handleWhyYoullLoveKeyDown(i, e)}
                    placeholder={`Tačka ${i + 1}`}
                    className={inputClass + " flex-1 min-w-[200px]"}
                  />
                  {whyYoullLove.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setWhyYoullLove((prev) =>
                          prev.filter((_, j) => j !== i),
                        )
                      }
                      className="shrink-0 cursor-pointer rounded-none p-1.5 text-red-600 hover:bg-red-50"
                      aria-label="Ukloni"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {i === whyYoullLove.length - 1 && whyYoullLove.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setWhyYoullLove((prev) => [...prev, ""])}
                      className="shrink-0 cursor-pointer rounded-none border-[var(--color-orange)] text-[var(--color-orange)] hover:bg-[var(--color-orange)]/10"
                      aria-label="Dodaj tačku"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Nutritivne vrednosti (opciono)">
            <p className="mb-4 text-sm text-gray-500">Po porciji.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Kalorije (kcal)">
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={calories === "" ? "" : calories}
                  onChange={(e) =>
                    setCalories(
                      e.target.value === ""
                        ? ""
                        : parseInt(e.target.value) || 0,
                    )
                  }
                  className={inputClass}
                />
              </FormField>
              <FormField label="Masti (g)">
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="0"
                  value={fatG === "" ? "" : fatG}
                  onChange={(e) =>
                    setFatG(
                      e.target.value === ""
                        ? ""
                        : parseFloat(e.target.value) || 0,
                    )
                  }
                  className={inputClass}
                />
              </FormField>
              <FormField label="Ugljeni hidrati (g)">
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="0"
                  value={carbsG === "" ? "" : carbsG}
                  onChange={(e) =>
                    setCarbsG(
                      e.target.value === ""
                        ? ""
                        : parseFloat(e.target.value) || 0,
                    )
                  }
                  className={inputClass}
                />
              </FormField>
              <FormField label="Proteini (g)">
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="0"
                  value={proteinG === "" ? "" : proteinG}
                  onChange={(e) =>
                    setProteinG(
                      e.target.value === ""
                        ? ""
                        : parseFloat(e.target.value) || 0,
                    )
                  }
                  className={inputClass}
                />
              </FormField>
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Section title="Kategorija i kuhinja">
            <div className="space-y-4">
              <CustomSelect
                id="category"
                label="Kategorija (max jedna)"
                required
                value={categoryId}
                onChange={setCategoryId}
                options={mealCategories.map((c) => ({
                  value: c.id,
                  label: c.name_sr,
                }))}
                placeholder="Izaberite kategoriju"
              />
              <CustomSelect
                id="cuisine"
                label="Kuhinja (max jedna)"
                value={cuisineId}
                onChange={setCuisineId}
                options={cuisineCategories.map((c) => ({
                  value: c.id,
                  label: c.name_sr,
                }))}
                placeholder="Izaberite kuhinju"
              />
            </div>
          </Section>

          <Section title="Vreme i porcije">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Priprema (min)" required>
                <Input
                  type="number"
                  min={0}
                  placeholder="npr. 20"
                  value={prepTime === "" ? "" : prepTime}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPrepTime(v === "" ? "" : parseInt(v, 10) || 0);
                  }}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Kuvanje (min)">
                <Input
                  type="number"
                  min={0}
                  placeholder="npr. 60"
                  value={cookTime === "" ? "" : cookTime}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCookTime(v === "" ? "" : parseInt(v, 10) || 0);
                  }}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Porcije" required>
                <Input
                  type="number"
                  min={1}
                  placeholder="npr. 4"
                  value={servings === "" ? "" : servings}
                  onChange={(e) => {
                    const v = e.target.value;
                    setServings(
                      v === "" ? "" : Math.max(1, parseInt(v, 10) || 1),
                    );
                  }}
                  className={inputClass}
                />
              </FormField>
            </div>
          </Section>

          <Section title="Sastojci">
            <p className="mb-3 text-sm text-gray-600">
              Količina, jedinica i naziv. Najmanje jedan sastojak. Enter dodaje
              novi red i prelazi na njega.
            </p>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <input
                    ref={(el) => {
                      if (!ingredientRefs.current[i])
                        ingredientRefs.current[i] = [];
                      ingredientRefs.current[i][0] = el;
                    }}
                    type="text"
                    placeholder="Količina"
                    value={ing.amount}
                    onChange={(e) =>
                      updateIngredient(i, "amount", e.target.value)
                    }
                    onKeyDown={(e) => handleIngredientKeyDown(i, 0, e)}
                    className={`${inputClassSmall} w-24 flex-shrink-0`}
                  />
                  <input
                    ref={(el) => {
                      if (!ingredientRefs.current[i])
                        ingredientRefs.current[i] = [];
                      ingredientRefs.current[i][1] = el;
                    }}
                    type="text"
                    placeholder="Jed."
                    value={ing.unit}
                    onChange={(e) =>
                      updateIngredient(i, "unit", e.target.value)
                    }
                    onKeyDown={(e) => handleIngredientKeyDown(i, 1, e)}
                    className={`${inputClassSmall} w-20 flex-shrink-0`}
                  />
                  <input
                    ref={(el) => {
                      if (!ingredientRefs.current[i])
                        ingredientRefs.current[i] = [];
                      ingredientRefs.current[i][2] = el;
                    }}
                    type="text"
                    placeholder="Naziv sastojka"
                    value={ing.name}
                    onChange={(e) =>
                      updateIngredient(i, "name", e.target.value)
                    }
                    onKeyDown={(e) => handleIngredientKeyDown(i, 2, e)}
                    className={`${inputClassSmall} flex-1 min-w-[120px]`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(i)}
                    className="shrink-0 cursor-pointer rounded-none text-red-600 hover:bg-red-50 hover:text-red-700"
                    aria-label="Ukloni sastojak"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {i === ingredients.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addIngredient}
                      className="shrink-0 cursor-pointer rounded-none border-[var(--color-orange)] text-[var(--color-orange)] hover:bg-[var(--color-orange)]/10"
                      aria-label="Dodaj sastojak"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Koraci pripreme">
            <p className="mb-3 text-sm text-gray-600">
              Najmanje jedan korak. Enter dodaje novi korak i prelazi na njega.
              Shift+Enter za novi red u koraku. Opciono dodajte sliku za svaki
              korak.
            </p>
            <div className="space-y-4">
              {directions.map((dir, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="mt-3 text-sm font-semibold text-[var(--color-orange)] w-6 shrink-0">
                    {i + 1}.
                  </span>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex gap-2 items-start flex-wrap">
                      <textarea
                        ref={(el) => {
                          directionRefs.current[i] = el;
                        }}
                        rows={2}
                        placeholder="Opis koraka"
                        value={dir.text}
                        onChange={(e) => updateDirection(i, e.target.value)}
                        onInput={(e) => {
                          const ta = e.target as HTMLTextAreaElement;
                          ta.style.height = "auto";
                          ta.style.height = `${Math.max(56, ta.scrollHeight)}px`;
                        }}
                        onKeyDown={(e) => handleDirectionKeyDown(i, e)}
                        className={`${inputClassSmall} flex-1 min-w-[200px] resize-none overflow-y-auto min-h-[56px]`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDirection(i)}
                        className="shrink-0 cursor-pointer rounded-none mt-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                        aria-label="Ukloni korak"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {i === directions.length - 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={addDirection}
                          className="shrink-0 cursor-pointer rounded-none mt-1 border-[var(--color-orange)] text-[var(--color-orange)] hover:bg-[var(--color-orange)]/10"
                          aria-label="Dodaj korak"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) =>
                          setDirectionImage(i, e.target.files?.[0] ?? null)
                        }
                        className="sr-only"
                      />
                      <span className="rounded-none border-2 border-dashed border-gray-300 bg-[#f1f1e6] px-3 py-2 text-xs font-medium text-[var(--color-primary)] hover:border-[var(--color-orange)] hover:bg-[var(--color-orange)]/5 transition-colors">
                        {dir.imageFile ? (
                          <span className="flex items-center gap-2">
                            <ImagePlus className="h-4 w-4 text-[var(--color-orange)]" />
                            {dir.imageFile.name}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setDirectionImage(i, null);
                              }}
                              className="cursor-pointer text-red-600 hover:underline"
                            >
                              Ukloni
                            </button>
                          </span>
                        ) : (
                          <>
                            <ImagePlus className="inline h-4 w-4 mr-1 text-gray-500" />
                            Dodaj sliku koraka
                          </>
                        )}
                      </span>
                    </label>
                    {dir.imagePreviewUrl && (
                      <Image
                        src={dir.imagePreviewUrl}
                        alt={`Korak ${i + 1}`}
                        width={320}
                        height={96}
                        className="mt-1 max-h-24 rounded-none object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Full width footer */}
      <div className="flex flex-col gap-4 rounded-none border-2 border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-center">
        <Button
          type="submit"
          disabled={loading}
          className="w-full min-w-[200px] cursor-pointer rounded-none border-2 border-[var(--color-primary)] bg-[var(--color-orange)] py-6 text-base font-semibold text-[var(--color-primary)] transition-transform duration-100 hover:scale-[1.02] hover:bg-[var(--color-orange)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Čuvanje..." : "Sačuvaj recept"}
        </Button>
      </div>
    </form>
  );
}
