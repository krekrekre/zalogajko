"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, Plus, Trash2, X, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";
import {
  getSavedRecipeLists,
  getRecipeSavedListIds,
  createSavedRecipeList,
  saveRecipeToList,
  unsaveRecipe,
  unsaveRecipeFromList,
  type SavedRecipeList,
} from "@/lib/saved-recipes";

const PRESET_NAMES = ["Omiljeni", "Ideje za večeru", "Želim da probam"];

interface SaveRecipeDropdownProps {
  recipeId: string;
  isSaved: boolean;
  onSaved?: () => void;
  onUnsaved?: () => void;
  loginNextPath?: string;
  variant?: "button" | "heart-only";
  className?: string;
  heartClassName?: string;
  saveLabel?: string;
  savedLabel?: string;
  fullWidth?: boolean;
  recipeTitle?: string;
  recipeImageUrl?: string | null;
}

export function SaveRecipeDropdown({
  recipeId,
  isSaved,
  onSaved,
  onUnsaved,
  loginNextPath,
  variant = "button",
  className,
  heartClassName,
  saveLabel = "Sačuvaj",
  savedLabel = "Sačuvano",
  fullWidth = false,
  recipeTitle,
  recipeImageUrl,
}: SaveRecipeDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"collections" | "create">("collections");
  const [lists, setLists] = useState<SavedRecipeList[]>([]);
  const [checkedListIds, setCheckedListIds] = useState<Set<string>>(new Set());
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    Promise.all([getSavedRecipeLists(), getRecipeSavedListIds(recipeId)]).then(
      ([allLists, savedListIds]) => {
        setLists(allLists);
        setCheckedListIds(savedListIds);
      },
    );
  }, [open, recipeId]);

  useEffect(() => {
    if (view === "create") nameInputRef.current?.focus();
  }, [view]);

  const closeModal = useCallback(() => {
    setOpen(false);
    setView("collections");
    setNewListName("");
    setNewListDesc("");
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeModal, open]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  }

  async function handleTriggerClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) {
      router.push(
        "/login?next=" +
          encodeURIComponent(getSafeNextPath(loginNextPath ?? window.location.pathname)),
      );
      return;
    }
    setOpen(true);
  }

  async function ensureListExists(name: string): Promise<SavedRecipeList | null> {
    const existing = lists.find((l) => l.name === name);
    if (existing) return existing;
    const created = await createSavedRecipeList(name);
    if (created) setLists((prev) => [...prev, created]);
    return created;
  }

  async function handleToggleList(listOrName: SavedRecipeList | string) {
    let list: SavedRecipeList | null;
    if (typeof listOrName === "string") {
      const existingChecked = lists.find((l) => l.name === listOrName);
      if (existingChecked && checkedListIds.has(existingChecked.id)) {
        setCheckedListIds((prev) => {
          const next = new Set(prev);
          next.delete(existingChecked.id);
          return next;
        });
        await unsaveRecipeFromList(recipeId, existingChecked.id);
        return;
      }
      list = await ensureListExists(listOrName);
    } else {
      list = listOrName;
      if (checkedListIds.has(list.id)) {
        setCheckedListIds((prev) => {
          const next = new Set(prev);
          next.delete(list!.id);
          return next;
        });
        await unsaveRecipeFromList(recipeId, list.id);
        return;
      }
    }
    if (list) {
      setCheckedListIds((prev) => new Set(prev).add(list!.id));
      onSaved?.();
      await saveRecipeToList(recipeId, list.id);
    }
  }

  async function handleCreateList() {
    const name = newListName.trim();
    if (!name) return;
    setSaving(true);
    const list = await createSavedRecipeList(name);
    if (list) {
      const ok = await saveRecipeToList(recipeId, list.id);
      if (ok) {
        setLists((prev) => [...prev, list]);
        setCheckedListIds((prev) => new Set(prev).add(list.id));
        onSaved?.();
      }
    }
    setNewListName("");
    setNewListDesc("");
    setView("collections");
    setSaving(false);
  }

  async function handleRemove() {
    setSaving(true);
    const ok = await unsaveRecipe(recipeId);
    setSaving(false);
    if (ok) {
      setCheckedListIds(new Set());
      closeModal();
      onUnsaved?.();
    }
  }

  function isPresetChecked(name: string): boolean {
    const match = lists.find((l) => l.name === name);
    return match ? checkedListIds.has(match.id) : false;
  }

  const anySaved = checkedListIds.size > 0 || isSaved;
  const imgSrc = recipeImageUrl || PLACEHOLDER_IMAGES.default;

  const customLists = lists.filter((l) => !PRESET_NAMES.includes(l.name));
  const trigger =
    variant === "heart-only" ? (
      <button
        type="button"
        onClick={handleTriggerClick}
        disabled={saving}
        className="inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
        aria-label={isSaved ? "Sačuvano" : "Sačuvaj recept"}
      >
        <Heart
          className={heartClassName ?? "h-4 w-4"}
          fill={isSaved ? "var(--ar-primary)" : "none"}
          stroke="var(--ar-primary)"
          strokeWidth={isSaved ? 0 : 2}
        />
      </button>
    ) : (
      <button
        type="button"
        onClick={handleTriggerClick}
        disabled={saving}
        className={
          className ??
          `inline-flex w-1/2 cursor-pointer items-center justify-center gap-2 border-b border-r border-[var(--ar-gray-250)] px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:border-b-0 sm:border-r sm:px-5 sm:py-2.5 ${
            isSaved
              ? "bg-[var(--ar-primary)] text-white hover:bg-[var(--ar-primary-hover)]"
              : "bg-[var(--ar-primary)] text-white hover:bg-[var(--ar-primary-hover)]"
          }`
        }
      >
        {saving ? "..." : isSaved ? savedLabel : saveLabel}
        <Heart
          className={`size-4 ${isSaved ? "fill-current" : ""}`}
          strokeWidth={2}
        />
      </button>
    );

  const collectionsView = (
    <div className="flex basis-1/2 min-w-0 flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-bold text-gray-900">
          Dodaj u kolekcije
        </h2>
        <button
          type="button"
          onClick={closeModal}
          className="cursor-pointer p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          aria-label="Zatvori"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-1">
          {PRESET_NAMES.map((name) => (
            <label
              key={name}
              className="flex cursor-pointer items-center gap-3 px-2 py-2.5 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={isPresetChecked(name)}
                onChange={() => handleToggleList(name)}
                className="size-[18px] shrink-0 cursor-pointer border-2 border-gray-300 accent-[var(--ar-primary)]"
              />
              <span className="text-sm text-gray-800">
                {name}
              </span>
            </label>
          ))}
          {customLists.map((list) => (
            <label
              key={list.id}
              className="flex cursor-pointer items-center gap-3 px-2 py-2.5 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={checkedListIds.has(list.id)}
                onChange={() => handleToggleList(list)}
                className="size-[18px] shrink-0 cursor-pointer border-2 border-gray-300 accent-[var(--ar-primary)]"
              />
              <span className="text-sm text-gray-800">{list.name}</span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setView("create")}
          className="mt-4 flex w-full cursor-pointer items-center gap-2 border-t border-gray-200 px-2 pt-4 pb-1 text-sm font-semibold uppercase tracking-wide text-gray-700 hover:text-gray-900"
        >
          <Plus className="size-4" />
          Napravi kolekciju
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
        {anySaved ? (
          <button
            type="button"
            onClick={handleRemove}
            disabled={saving}
            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            Ukloni
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={closeModal}
          className="cursor-pointer bg-[var(--ar-primary)] px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-[var(--ar-primary-hover)] transition-colors"
        >
          Sačuvaj
        </button>
      </div>
    </div>
  );

  const createView = (
    <div className="flex basis-1/2 min-w-0 flex-col">
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
        <button
          type="button"
          onClick={() => {
            setView("collections");
            setNewListName("");
            setNewListDesc("");
          }}
          className="cursor-pointer p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Nazad"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="flex-1 text-base font-bold text-gray-900">
          Nova kolekcija
        </h2>
        <button
          type="button"
          onClick={closeModal}
          className="cursor-pointer p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          aria-label="Zatvori"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-900">
            Naziv kolekcije
          </label>
          <input
            ref={nameInputRef}
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateList();
            }}
            placeholder="Ručak, Večera, Desert..."
            className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-900">
            Opis <span className="font-normal text-gray-400">(opciono)</span>
          </label>
          <textarea
            value={newListDesc}
            onChange={(e) => {
              if (e.target.value.length <= 120) setNewListDesc(e.target.value);
            }}
            placeholder="Kako biste opisali ovu kolekciju?"
            rows={3}
            className="w-full resize-none border border-gray-300 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {newListDesc.length}/120 karaktera
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
        <button
          type="button"
          onClick={() => {
            setView("collections");
            setNewListName("");
            setNewListDesc("");
          }}
          className="cursor-pointer text-sm font-bold text-gray-700 hover:text-gray-900"
        >
          Otkaži
        </button>
        <button
          type="button"
          onClick={handleCreateList}
          disabled={saving || !newListName.trim()}
          className="cursor-pointer border border-gray-300 bg-white px-6 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Napravi
        </button>
      </div>
    </div>
  );

  const modal = open
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className="relative flex w-full max-w-[680px] min-h-[420px] overflow-hidden bg-white shadow-2xl"
          >
            {/* Left panel */}
            <div className="hidden basis-1/2 flex-col border-r border-gray-200 bg-white p-5 sm:flex">
              {view === "collections" ? (
                <>
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={imgSrc}
                      alt={recipeTitle || "Recept"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {recipeTitle && (
                    <p className="mt-2 text-base font-bold leading-snug text-gray-900">
                      {recipeTitle}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <Heart
                    className="size-28 drop-shadow-lg"
                    fill="var(--ar-primary)"
                    stroke="var(--ar-primary-hover)"
                    strokeWidth={0.5}
                  />
                </div>
              )}
            </div>

            {/* Right panel */}
            {view === "collections" ? collectionsView : createView}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={fullWidth ? "relative w-full" : "relative inline-block"}>
      {trigger}
      {modal}
    </div>
  );
}
