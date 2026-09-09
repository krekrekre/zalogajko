"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidateRecipeCaches } from "@/app/recepti/actions";
import { Check, ImagePlus, Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name_sr: string;
  type: string;
}

interface AddRecipeFormProps {
  categories: Category[];
}

const SKILL_LEVELS = [
  { value: "lako", label: "Lako" },
  { value: "srednje", label: "Srednje" },
  { value: "tesko", label: "Teško" },
] as const;

const MINUTES_DIGITS = 3;
const SERVINGS_DIGITS = 2;
const MAX_MINUTES = 999;
const MAX_SERVINGS = 99;

/** Keeps only digits and caps their count, so the field cannot exceed its digit limit. */
function clampDigits(value: string, maxDigits: number) {
  return value.replace(/\D/g, "").slice(0, maxDigits);
}

/** A unit is a word -- "g", "kašika", "prstohvat". The amount field holds the
 *  number, so digits typed here are dropped rather than silently accepted. */
function stripDigits(value: string) {
  return value.replace(/\d/g, "");
}

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

/* The form borrows the recipe page's vocabulary: white ground, hairline rules,
   a teal underline under each heading, and the same boxes the finished recipe
   is rendered in -- so writing a recipe looks like the recipe it becomes. */

const inputClass =
  "w-full break-words rounded-none border border-[var(--ar-gray-300)] bg-white px-4 py-2.5 text-[15px] leading-6 text-[var(--color-primary)] placeholder:text-[var(--ar-gray-500)] outline-none transition-colors focus-visible:border-[var(--color-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]/25";

const inputClassSmall =
  "w-full break-words rounded-none border border-[var(--ar-gray-300)] bg-white px-3 py-2 text-sm leading-5 text-[var(--color-primary)] placeholder:text-[var(--ar-gray-500)] outline-none transition-colors focus-visible:border-[var(--color-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]/25";

const outlineButtonClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-none border-2 border-[var(--color-primary)] bg-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-[var(--color-primary)] transition-colors hover:border-[var(--ar-primary)] hover:bg-[var(--ar-primary)]";

const removeButtonClass =
  "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-none text-[var(--ar-gray-500)] transition-colors hover:bg-[var(--ar-cream)] hover:text-red-700";

const labelClass = "block text-sm font-bold text-[var(--ar-gray-900)]";

const microLabelClass =
  "block text-xs font-medium uppercase tracking-wide text-[var(--ar-gray-500)]";

/** The recipe page's stat box: hairline frame under a thick, pale teal rule. */
const statBoxClass =
  "border border-[color:color-mix(in_srgb,black_20%,transparent)] border-t-12 border-t-[color:color-mix(in_srgb,#46deb6_20%,transparent)] bg-white p-4 sm:p-6";

function Section({
  title,
  hint,
  children,
  className = "mt-12",
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="inline-block border-b-4 border-[var(--ar-primary)]">
        <h2 className="font-display text-[26px] font-bold leading-tight tracking-tight text-[var(--color-primary)] sm:text-[30px]">
          {title}
        </h2>
      </div>
      {hint && (
        <p className="mt-3 text-sm leading-relaxed text-[var(--ar-gray-600)]">
          {hint}
        </p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FormField({
  label,
  required,
  children,
  id,
  micro,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  id?: string;
  micro?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={micro ? microLabelClass : labelClass}>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
    </div>
  );
}

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
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <div ref={ref} className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`${inputClass} flex cursor-pointer items-center justify-between gap-2 text-left ${
            open ? "border-[var(--color-orange)]" : ""
          }`}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span
            className={
              selected
                ? "truncate text-[var(--color-primary)]"
                : "truncate text-[var(--ar-gray-500)]"
            }
          >
            {selected ? selected.label : placeholder}
          </span>
          <svg
            className={`h-4 w-4 shrink-0 text-[var(--ar-gray-500)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
          className={`absolute left-0 right-0 top-full z-50 mt-1 max-h-64 origin-top overflow-y-auto rounded-none border border-[var(--ar-gray-300)] bg-white py-1 shadow-[var(--ar-card-shadow-hover)] transition-all duration-200 ease-out ${
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
            className={`w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--ar-cream)] ${!value ? "font-semibold text-[var(--color-primary)]" : "text-[var(--ar-gray-600)]"}`}
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
              className={`w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--ar-cream)] ${value === opt.value ? "bg-[var(--ar-cream)] font-semibold text-[var(--color-primary)]" : "text-[var(--color-primary)]"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AddRecipeForm({ categories }: AddRecipeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chefTip, setChefTip] = useState("");
  const [whyYoullLove, setWhyYoullLove] = useState<string[]>([""]);
  const [prepTime, setPrepTime] = useState<number | "">("");
  const [cookTime, setCookTime] = useState<number | "">("");
  const [servings, setServings] = useState<number | "">("");
  const [skillLevel, setSkillLevel] = useState<string>("");
  const [submittedForReview, setSubmittedForReview] = useState(false);
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Morate biti prijavljeni da biste dodali recept.");
        setLoading(false);
        return;
      }

      let authorName: string | null = null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("author_name")
        .eq("id", user.id)
        .single();
      authorName =
        (
          profile as { author_name?: string | null } | null
        )?.author_name?.trim() || null;

      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
          ? ext
          : "jpg";
        const path = `${user.id}/${slug}-${Date.now()}.${safeExt}`;
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
          chef_tip_sr: chefTip.trim() || null,
          why_youll_love: whyArr.length > 0 ? whyArr : null,
          prep_time_minutes: prep,
          cook_time_minutes: cook,
          servings: serv,
          author_id: user.id,
          author_name: authorName,
          image_url: imageUrl,
          // No status: the database decides. An admin's recipe takes the
          // column default and goes live; anyone else's is forced to
          // 'pending' by the recipes_enforce_moderation trigger.
          skill_level: skillLevel || null,
        })
        .select("id, status")
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
          const path = `${user.id}/${recipe.id}/step-${i}.${safeExt}`;
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

      if (recipe.status === "published") {
        await revalidateRecipeCaches();
        router.push(`/recepti/${slug}`);
        router.refresh();
      } else {
        setSubmittedForReview(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nešto je pošlo po zlu.");
    } finally {
      setLoading(false);
    }
  }

  if (submittedForReview) {
    return (
      <div className="mt-8 border-l-4 border-[var(--ar-primary)] bg-[var(--ar-cream)] p-5 sm:p-8">
        <h2 className="flex items-center gap-2.5 text-lg font-semibold uppercase tracking-wide text-[var(--color-primary)] sm:text-xl">
          <Check
            className="h-5 w-5 shrink-0 text-[var(--ar-primary-ink)]"
            strokeWidth={3}
            aria-hidden
          />
          Recept je poslat na odobrenje
        </h2>
        <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-[var(--color-primary)] sm:text-[18px]">
          Administrator će ga pregledati pre objavljivanja. Do tada nije vidljiv
          na sajtu — status možete pratiti na svom profilu.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/profil"
            className="inline-block rounded-none border-2 border-[var(--ar-primary)] bg-[var(--ar-primary)] px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-[var(--color-primary)] transition-colors hover:border-[var(--ar-primary-hover)] hover:bg-[var(--ar-primary-hover)]"
          >
            Moj profil
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={outlineButtonClass}
          >
            Dodaj još jedan recept
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const t = e.target as HTMLElement;
          if (t.tagName === "TEXTAREA") return;
          e.preventDefault();
        }
      }}
    >
      <Section
        title="Osnovno"
        hint="Naziv i opis stoje na vrhu objavljenog recepta."
        className="mt-10"
      >
        <div className="space-y-6">
          <FormField label="Naziv recepta" required id="title">
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="npr. Palaćinke sa džemom"
              className={`${inputClass} text-[17px]`}
            />
          </FormField>

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
              className={`${inputClass} min-h-[100px] resize-none overflow-y-auto`}
            />
          </FormField>

          <div className="grid gap-6 sm:grid-cols-2">
            <CustomSelect
              id="category"
              label="Kategorija"
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
              label="Kuhinja"
              value={cuisineId}
              onChange={setCuisineId}
              options={cuisineCategories.map((c) => ({
                value: c.id,
                label: c.name_sr,
              }))}
              placeholder="Izaberite kuhinju"
            />
          </div>
        </div>
      </Section>

      <Section title="Fotografija" hint="Glavna slika jela, u formatu 4:3.">
        <label
          htmlFor="image-upload"
          className="group block w-full max-w-[480px] cursor-pointer"
        >
          <input
            ref={imageInputRef}
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setImageFileWithPreview(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
          {imageFile && imagePreviewUrl ? (
            <>
              <div className="relative aspect-[4/3] w-full overflow-hidden shadow-[var(--ar-card-shadow)]">
                <Image
                  src={imagePreviewUrl}
                  alt="Pregled"
                  fill
                  sizes="480px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <p className="mt-2 truncate text-sm text-[var(--ar-gray-600)]">
                {imageFile.name}{" "}
                <span className="font-medium text-[var(--ar-primary-ink)] underline decoration-[var(--color-accent)] group-hover:no-underline">
                  Klikni za promenu
                </span>
              </p>
            </>
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center border border-dashed border-[var(--ar-gray-300)] bg-white transition-colors group-hover:border-[var(--ar-primary)] group-focus-within:border-[var(--ar-primary)]">
              <ImagePlus
                className="h-8 w-8 text-[var(--ar-gray-500)]"
                aria-hidden
              />
              <span className="mt-3 text-base font-semibold text-[var(--color-primary)]">
                Klikni da dodaš sliku
              </span>
              <span className="mt-1 text-sm text-[var(--ar-gray-500)]">
                JPG, PNG ili WebP
              </span>
            </div>
          )}
        </label>
      </Section>

      <Section
        title="Vreme i porcije"
        hint="Ovi podaci se prikazuju u okviru na vrhu recepta."
      >
        <div className={statBoxClass}>
          <div className="grid gap-x-10 gap-y-5 sm:grid-cols-3">
            <FormField label="Aktivno vreme (min)" required id="prep-time" micro>
              <input
                id="prep-time"
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_MINUTES}
                placeholder="npr. 20"
                value={prepTime === "" ? "" : prepTime}
                onChange={(e) => {
                  const v = clampDigits(e.target.value, MINUTES_DIGITS);
                  setPrepTime(v === "" ? "" : parseInt(v, 10));
                }}
                className={inputClassSmall}
              />
            </FormField>
            <FormField label="Kuvanje (min)" id="cook-time" micro>
              <input
                id="cook-time"
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_MINUTES}
                placeholder="npr. 60"
                value={cookTime === "" ? "" : cookTime}
                onChange={(e) => {
                  const v = clampDigits(e.target.value, MINUTES_DIGITS);
                  setCookTime(v === "" ? "" : parseInt(v, 10));
                }}
                className={inputClassSmall}
              />
            </FormField>
            <FormField label="Porcije" required id="servings" micro>
              <input
                id="servings"
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_SERVINGS}
                placeholder="npr. 4"
                value={servings === "" ? "" : servings}
                onChange={(e) => {
                  const v = clampDigits(e.target.value, SERVINGS_DIGITS);
                  setServings(v === "" ? "" : Math.max(1, parseInt(v, 10)));
                }}
                className={inputClassSmall}
              />
            </FormField>
          </div>

          <hr className="my-5 border-[color:color-mix(in_srgb,black_20%,transparent)]" />

          <div className="flex flex-wrap items-center gap-2">
            <span className={`${microLabelClass} mr-1`}>
              Težina<span className="text-red-600"> *</span>
            </span>
            {SKILL_LEVELS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() =>
                  setSkillLevel(skillLevel === s.value ? "" : s.value)
                }
                aria-pressed={skillLevel === s.value}
                className={`cursor-pointer rounded-none px-3 py-1.5 text-sm font-medium transition-colors ${
                  skillLevel === s.value
                    ? "bg-[var(--ar-primary)] text-[var(--color-primary)]"
                    : "border border-[var(--ar-gray-300)] bg-white text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-200)]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Sastojci"
        hint="Enter prelazi na sledeće polje i otvara novi red."
      >
        <div className="hidden gap-2 sm:flex">
          <div className="grid flex-1 grid-cols-[104px_88px_minmax(0,1fr)] gap-2">
            <span className={microLabelClass}>Količina</span>
            <span className={microLabelClass}>Jedinica</span>
            <span className={microLabelClass}>Naziv sastojka</span>
          </div>
          <span className="w-9 shrink-0" aria-hidden />
        </div>

        <div className="mt-2 divide-y divide-[var(--ar-gray-200)] border-y border-[var(--ar-gray-200)]">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex items-start gap-2 py-3">
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-[104px_88px_minmax(0,1fr)]">
                <input
                  ref={(el) => {
                    if (!ingredientRefs.current[i])
                      ingredientRefs.current[i] = [];
                    ingredientRefs.current[i][0] = el;
                  }}
                  type="text"
                  placeholder="300"
                  aria-label={`Količina, sastojak ${i + 1}`}
                  value={ing.amount}
                  onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                  onKeyDown={(e) => handleIngredientKeyDown(i, 0, e)}
                  className={inputClassSmall}
                />
                <input
                  ref={(el) => {
                    if (!ingredientRefs.current[i])
                      ingredientRefs.current[i] = [];
                    ingredientRefs.current[i][1] = el;
                  }}
                  type="text"
                  placeholder="g"
                  aria-label={`Jedinica, sastojak ${i + 1}`}
                  value={ing.unit}
                  onChange={(e) =>
                    updateIngredient(i, "unit", stripDigits(e.target.value))
                  }
                  onKeyDown={(e) => handleIngredientKeyDown(i, 1, e)}
                  className={inputClassSmall}
                />
                <input
                  ref={(el) => {
                    if (!ingredientRefs.current[i])
                      ingredientRefs.current[i] = [];
                    ingredientRefs.current[i][2] = el;
                  }}
                  type="text"
                  placeholder="brašno"
                  aria-label={`Naziv, sastojak ${i + 1}`}
                  autoCapitalize="none"
                  value={ing.name}
                  // Lower-cased as it is typed: /sastojci groups recipes by the
                  // raw name, so "Brašno" and "brašno" would list separately.
                  onChange={(e) =>
                    updateIngredient(i, "name", e.target.value.toLowerCase())
                  }
                  onKeyDown={(e) => handleIngredientKeyDown(i, 2, e)}
                  className={`${inputClassSmall} col-span-2 sm:col-span-1`}
                />
              </div>
              {ingredients.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className={removeButtonClass}
                  aria-label="Ukloni sastojak"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span className="w-9 shrink-0" aria-hidden />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addIngredient}
          className={`${outlineButtonClass} mt-4`}
        >
          <Plus className="h-4 w-4" />
          Dodaj sastojak
        </button>
      </Section>

      <Section
        title="Uputstvo"
        hint="Enter otvara sledeći korak, Shift+Enter novi red u istom koraku."
      >
        <div className="space-y-7">
          {directions.map((dir, i) => (
            <div key={i}>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-block border-b-2 border-[var(--ar-primary)] pb-1 font-semibold text-[var(--ar-gray-900)]">
                  {i + 1}. korak
                </span>
                {directions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDirection(i)}
                    className={removeButtonClass}
                    aria-label="Ukloni korak"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <textarea
                ref={(el) => {
                  directionRefs.current[i] = el;
                }}
                rows={2}
                placeholder="Opis koraka"
                aria-label={`Korak ${i + 1}`}
                value={dir.text}
                onChange={(e) => updateDirection(i, e.target.value)}
                onInput={(e) => {
                  const ta = e.target as HTMLTextAreaElement;
                  ta.style.height = "auto";
                  ta.style.height = `${Math.max(64, ta.scrollHeight)}px`;
                }}
                onKeyDown={(e) => handleDirectionKeyDown(i, e)}
                className={`${inputClass} mt-3 min-h-[64px] resize-none overflow-hidden`}
              />

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[var(--ar-primary-ink)] underline decoration-[var(--color-accent)] hover:no-underline">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) =>
                      setDirectionImage(i, e.target.files?.[0] ?? null)
                    }
                    className="sr-only"
                  />
                  <ImagePlus className="h-4 w-4" aria-hidden />
                  {dir.imageFile ? "Promeni sliku koraka" : "Dodaj sliku koraka"}
                </label>
                {dir.imageFile && (
                  <>
                    <span className="max-w-[220px] truncate text-sm text-[var(--ar-gray-600)]">
                      {dir.imageFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDirectionImage(i, null)}
                      className="cursor-pointer text-sm font-medium text-red-700 underline-offset-2 hover:underline"
                    >
                      Ukloni
                    </button>
                  </>
                )}
              </div>

              {dir.imagePreviewUrl && (
                <div className="relative mt-3 aspect-[4/3] w-full max-w-[320px] overflow-hidden border border-[var(--ar-gray-200)] bg-[var(--ar-gray-100)]">
                  <Image
                    src={dir.imagePreviewUrl}
                    alt={`Korak ${i + 1}`}
                    fill
                    sizes="320px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addDirection}
          className={`${outlineButtonClass} mt-6`}
        >
          <Plus className="h-4 w-4" />
          Dodaj korak
        </button>
      </Section>

      <Section
        title="Savet kuvara"
        hint="Opciono. Jedan trik iz iskustva koji čini razliku."
      >
        <textarea
          id="chef-tip"
          rows={3}
          value={chefTip}
          onChange={(e) => setChefTip(e.target.value)}
          onInput={(e) => {
            const ta = e.target as HTMLTextAreaElement;
            ta.style.height = "auto";
            ta.style.height = `${Math.max(84, ta.scrollHeight)}px`;
          }}
          placeholder="npr. Testo ostavite da odstoji 30 minuta — palačinke će biti znatno mekše."
          aria-label="Savet kuvara"
          className={`${inputClass} min-h-[84px] resize-none overflow-y-auto`}
        />
      </Section>

      {/* The framed box the finished recipe renders these points in, with the
          heading set into a gap in its own top border. */}
      <section className="relative mt-12 border border-[var(--ar-primary-ink)] px-5 pb-6 pt-9 sm:px-8 sm:pb-8">
        <h2 className="absolute left-1/2 top-0 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-center text-[13px] font-bold uppercase leading-tight tracking-[0.12em] text-[var(--ar-primary-ink)]">
          Zašto ćete voleti ovaj recept
        </h2>
        <p className="text-sm text-[var(--ar-gray-600)]">
          Opciono. Do tri kratke tačke.
        </p>
        <div className="mt-5 space-y-3">
          {whyYoullLove.map((val, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ar-primary)]"
                aria-hidden
              />
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
                aria-label={`Tačka ${i + 1}`}
                className={`${inputClassSmall} min-w-0 flex-1`}
              />
              {whyYoullLove.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setWhyYoullLove((prev) => prev.filter((_, j) => j !== i))
                  }
                  className={removeButtonClass}
                  aria-label="Ukloni"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span className="w-9 shrink-0" aria-hidden />
              )}
            </div>
          ))}
        </div>
        {whyYoullLove.length < 3 && (
          <button
            type="button"
            onClick={() => setWhyYoullLove((prev) => [...prev, ""])}
            className={`${outlineButtonClass} mt-5`}
          >
            <Plus className="h-4 w-4" />
            Dodaj tačku
          </button>
        )}
      </section>

      <Section title="Nutritivne vrednosti" hint="Opciono, po porciji.">
        <div className="grid gap-5 sm:grid-cols-4">
          <FormField label="Kalorije (kcal)" id="calories" micro>
            <input
              id="calories"
              type="number"
              min={0}
              placeholder="0"
              value={calories === "" ? "" : calories}
              onChange={(e) =>
                setCalories(
                  e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                )
              }
              className={inputClassSmall}
            />
          </FormField>
          <FormField label="Masti (g)" id="fat" micro>
            <input
              id="fat"
              type="number"
              min={0}
              step={0.1}
              placeholder="0"
              value={fatG === "" ? "" : fatG}
              onChange={(e) =>
                setFatG(
                  e.target.value === "" ? "" : parseFloat(e.target.value) || 0,
                )
              }
              className={inputClassSmall}
            />
          </FormField>
          <FormField label="Ugljeni hidrati (g)" id="carbs" micro>
            <input
              id="carbs"
              type="number"
              min={0}
              step={0.1}
              placeholder="0"
              value={carbsG === "" ? "" : carbsG}
              onChange={(e) =>
                setCarbsG(
                  e.target.value === "" ? "" : parseFloat(e.target.value) || 0,
                )
              }
              className={inputClassSmall}
            />
          </FormField>
          <FormField label="Proteini (g)" id="protein" micro>
            <input
              id="protein"
              type="number"
              min={0}
              step={0.1}
              placeholder="0"
              value={proteinG === "" ? "" : proteinG}
              onChange={(e) =>
                setProteinG(
                  e.target.value === "" ? "" : parseFloat(e.target.value) || 0,
                )
              }
              className={inputClassSmall}
            />
          </FormField>
        </div>
      </Section>

      <div className="mt-12 border-t border-[var(--ar-gray-200)] pt-6">
        {error && (
          <p
            role="alert"
            className="mb-5 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-block cursor-pointer rounded-none border-2 border-[var(--ar-primary)] bg-[var(--ar-primary)] px-10 py-4 text-[13px] font-bold uppercase tracking-wider text-[var(--color-primary)] transition-colors hover:border-[var(--ar-primary-hover)] hover:bg-[var(--ar-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Čuvanje..." : "Sačuvaj recept"}
          </button>
          <p className="text-sm text-[var(--ar-gray-600)]">
            Polja označena{" "}
            <span className="font-semibold text-red-600">*</span>{" "}
            su obavezna.
          </p>
        </div>
      </div>
    </form>
  );
}
