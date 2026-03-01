"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Heart, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getSavedRecipeLists,
  createSavedRecipeList,
  saveRecipeToList,
  unsaveRecipe,
  type SavedRecipeList,
} from "@/lib/saved-recipes";

interface SaveRecipeDropdownProps {
  recipeId: string;
  isSaved: boolean;
  onSaved?: () => void;
  onUnsaved?: () => void;
  /** Login path for redirect when not authenticated */
  loginNextPath?: string;
  /** Trigger: "button" (default, Sačuvaj + heart) or "heart-only" for card hearts */
  variant?: "button" | "heart-only";
  /** Optional class for the trigger when variant is button */
  className?: string;
  /** Optional class for heart when variant is heart-only */
  heartClassName?: string;
  /** Button label when not saved (default "Sačuvaj") */
  saveLabel?: string;
  /** Button label when saved (default "Sačuvano") */
  savedLabel?: string;
  /** When true, wrapper is full width so the trigger button can stretch (e.g. in cards) */
  fullWidth?: boolean;
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
}: SaveRecipeDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<SavedRecipeList[]>([]);
  const [addingNew, setAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [saving, setSaving] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    getSavedRecipeLists().then(setLists);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setDropdownPosition(null);
      return;
    }
    const updatePosition = () => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        setDropdownPosition({ left: rect.left, top: rect.bottom + 4 });
      }
    };
    updatePosition();
    document.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setAddingNew(false);
      setNewCategoryName("");
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSaveToList(listId: string) {
    setSaving(true);
    const ok = await saveRecipeToList(recipeId, listId);
    setSaving(false);
    if (ok) {
      setOpen(false);
      onSaved?.();
    }
  }

  async function handleAddNewCategory() {
    const name = newCategoryName.trim() || "Nova lista";
    setSaving(true);
    const list = await createSavedRecipeList(name);
    setSaving(false);
    if (list) {
      const ok = await saveRecipeToList(recipeId, list.id);
      if (ok) {
        setLists((prev) => [...prev, list]);
        setNewCategoryName("");
        setAddingNew(false);
        setOpen(false);
        onSaved?.();
      }
    }
  }

  async function handleUnsave() {
    setSaving(true);
    const ok = await unsaveRecipe(recipeId);
    setSaving(false);
    if (ok) {
      setOpen(false);
      onUnsaved?.();
    }
  }

  async function handleTriggerClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    const { data: { user } } = await createClient().auth.getUser();
    if (!user) {
      router.push("/login?next=" + encodeURIComponent(loginNextPath ?? window.location.pathname));
      return;
    }
    if (isSaved) {
      setOpen((o) => !o);
    } else {
      setOpen(true);
    }
  }

  const trigger =
    variant === "heart-only" ? (
      <button
        type="button"
        onClick={handleTriggerClick}
        disabled={saving}
        className="inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 rounded"
        aria-label={isSaved ? "Sačuvano" : "Sačuvaj recept"}
        aria-expanded={open}
        aria-haspopup="true"
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
        aria-expanded={open}
        aria-haspopup="true"
      >
        {saving ? "..." : isSaved ? savedLabel : saveLabel}
        <Heart className={`size-4 ${isSaved ? "fill-current" : ""}`} strokeWidth={2} />
      </button>
    );

  const menuContent = (
    <div
      ref={menuRef}
      className="min-w-[200px] cursor-pointer rounded-none border border-[var(--ar-gray-200)] bg-white py-1 shadow-lg"
      role="menu"
    >
      {isSaved && (
            <button
              type="button"
              onClick={handleUnsave}
              disabled={saving}
              className="w-full cursor-pointer px-3 py-2 text-left text-sm text-[var(--ar-gray-700)] hover:bg-[var(--color-accent)]/20 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              role="menuitem"
            >
              Ukloni iz sačuvanih
            </button>
          )}
          {isSaved && lists.length > 0 && <div className="my-1 border-t border-[var(--ar-gray-200)]" />}
          {lists.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--ar-gray-500)]">
                Sačuvaj u
              </div>
              {lists.map((list) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => handleSaveToList(list.id)}
                  disabled={saving}
                  className="w-full cursor-pointer px-3 py-2 text-left text-sm text-[var(--color-primary)] hover:bg-[var(--color-accent)]/20 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  role="menuitem"
                >
                  {list.name}
                </button>
              ))}
            </>
          )}
          {addingNew ? (
            <div className="border-t border-[var(--ar-gray-200)] px-2 py-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddNewCategory();
                  if (e.key === "Escape") setAddingNew(false);
                }}
                placeholder="Naziv liste"
                className="w-full rounded-none border border-[var(--ar-gray-300)] px-2 py-1.5 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                autoFocus
              />
              <div className="mt-1 flex gap-1">
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  disabled={saving || !newCategoryName.trim()}
                  className="cursor-pointer rounded-none border border-[var(--color-accent)] bg-white px-2 py-1 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Dodaj
                </button>
                <button
                  type="button"
                  onClick={() => setAddingNew(false)}
                  className="cursor-pointer rounded-none border border-[var(--ar-gray-300)] px-2 py-1 text-xs text-[var(--ar-gray-700)] hover:bg-red-100 hover:underline"
                >
                  Otkaži
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingNew(true)}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 hover:underline"
              role="menuitem"
            >
              <Plus className="size-4" />
              Nova kategorija
            </button>
          )}
    </div>
  );

  return (
    <div className={fullWidth ? "relative w-full" : "relative inline-block"} ref={dropdownRef}>
      {trigger}
      {open &&
        dropdownPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[9999]"
            style={{ left: dropdownPosition.left, top: dropdownPosition.top }}
          >
            {menuContent}
          </div>,
          document.body
        )}
    </div>
  );
}
