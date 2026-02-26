"use client";

import { useState } from "react";
import type { Ingredient } from "@/types";

interface ServingMultiplierProps {
  ingredients: Ingredient[];
  baseServings: number;
}

// Simple multiplier for amount strings - handles "2", "½", "1 ½", "2-3"
function multiplyAmount(amount: string | null, mult: number): string {
  if (!amount || mult === 1) return amount || "";
  if (mult === 0.5) {
    if (/^\d+$/.test(amount.trim())) {
      const n = parseFloat(amount);
      return n === 2 ? "1" : n === 1 ? "½" : `${(n * 0.5).toString().replace(".5", " ½")}`;
    }
    if (amount.includes("½")) return amount; // Already fractional
    const match = amount.match(/^(\d+)\s*(.*)$/);
    if (match) {
      const n = parseFloat(match[1]) * 0.5;
      const rest = match[2];
      return n === Math.floor(n) ? `${n} ${rest}`.trim() : `${Math.floor(n)} ½ ${rest}`.trim();
    }
  }
  if (mult === 2) {
    const match = amount.match(/^(\d*\.?\d*)\s*(.*)$/);
    if (match) {
      const n = parseFloat(match[1] || "1") * 2;
      const rest = match[2];
      return `${n} ${rest}`.trim();
    }
  }
  return amount;
}

export function ServingMultiplier({
  ingredients,
  baseServings,
}: ServingMultiplierProps) {
  const [mult, setMult] = useState<0.5 | 1 | 2>(1);

  const sorted = [...ingredients].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-[var(--ar-gray-700)] sm:text-[36px]">Sastojci</h2>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--ar-gray-500)]">Porcije:</span>
        <button
          type="button"
          onClick={() => setMult(0.5)}
          className={`rounded-none px-3 py-1.5 text-sm font-medium transition-colors ${
            mult === 0.5 ? "bg-[var(--ar-primary)] text-white" : "bg-[var(--ar-gray-100)] text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-200)]"
          }`}
        >
          ½x
        </button>
        <button
          type="button"
          onClick={() => setMult(1)}
          className={`rounded-none px-3 py-1.5 text-sm font-medium transition-colors ${
            mult === 1 ? "bg-[var(--ar-primary)] text-white" : "bg-[var(--ar-gray-100)] text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-200)]"
          }`}
        >
          1x
        </button>
        <button
          type="button"
          onClick={() => setMult(2)}
          className={`rounded-none px-3 py-1.5 text-sm font-medium transition-colors ${
            mult === 2 ? "bg-[var(--ar-primary)] text-white" : "bg-[var(--ar-gray-100)] text-[var(--ar-gray-700)] hover:bg-[var(--ar-gray-200)]"
          }`}
        >
          2x
        </button>
        <span className="w-full text-sm text-[var(--ar-gray-500)] sm:w-auto">
          ({baseServings * mult} porcija)
        </span>
      </div>
      <ul className="mt-4 space-y-2 text-base sm:text-[18px]">
        {sorted.map((ing) => (
          <li key={ing.id} className="flex flex-wrap gap-x-2 gap-y-0">
            {ing.amount && (
              <span className="text-base text-[var(--ar-gray-500)] sm:text-[18px]">
                {multiplyAmount(ing.amount, mult)}
              </span>
            )}
            {"unit_sr" in ing && (ing as { unit_sr?: string }).unit_sr && (
              <span className="text-base text-[var(--ar-gray-500)] sm:text-[18px]">
                {(ing as { unit_sr: string }).unit_sr}
              </span>
            )}
            <span className="text-base text-[var(--ar-gray-700)] sm:text-[18px]">{ing.name_sr}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
