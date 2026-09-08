/**
 * Popular searches are topics a cook thinks in -- "Piletina", "Povrće" -- but
 * `ingredients.name_sr` holds whatever the recipe author typed: "Pileći batak
 * i karabatak", "Plavi patlidžan", "Mleveno meso (svinjsko i juneće)".
 *
 * search_recipes() matches with sr_norm(name) LIKE '%' || sr_norm(term) || '%',
 * which ignores diacritics but knows nothing about Serbian morphology:
 * "piletina" is not a substring of "pileći", so every ingredient chip on the
 * homepage led to an empty results page. A topic therefore carries the stems
 * that actually occur in ingredient text, and a search runs them as an OR.
 *
 * Stems rather than whole words on purpose -- "pilec" covers pileći/pileća/
 * pileće. Keep each stem long enough that it cannot collide with an unrelated
 * ingredient (never "so", "ulje"), and keep the list per topic short: every
 * stem costs one indexed query.
 */

export type SearchTopic = {
  /** Human label -- the chip text and the heading on the results page. */
  label: string;
  /** Substrings matched against normalized ingredient names, OR-ed together. */
  terms: readonly string[];
  /** Other spellings a visitor may type or an older link may carry. */
  aliases?: readonly string[];
};

export const SEARCH_TOPICS: readonly SearchTopic[] = [
  {
    label: "Piletina",
    terms: ["pilec", "pilet"],
    aliases: ["pile", "pileca", "pilece meso"],
  },
  {
    label: "Govedina",
    terms: ["goved", "junec", "junet", "telec", "telet", "biftek"],
    aliases: ["junetina", "teletina", "govedje meso"],
  },
  {
    label: "Svinjetina",
    terms: ["svinj", "slanin", "suvo meso", "vratina", "rebra"],
    aliases: ["svinjsko", "svinjsko meso"],
  },
  {
    label: "Pasta",
    terms: ["pasta", "testenin", "rezanc", "spaget", "makaron", "njoki", "tortelin", "lazanj"],
    aliases: ["testenina", "testenine"],
  },
  {
    label: "Voće",
    terms: ["voc", "jabuk", "kajsij", "sljiv", "visnj", "jagod", "banan"],
  },
  {
    label: "Povrće",
    terms: [
      "povrc",
      "paradajz",
      "paprik",
      "krastavac",
      "sargarep",
      "patlidzan",
      "tikvic",
      "krompir",
      "kupus",
    ],
    aliases: ["zelenis"],
  },
];

/**
 * Mirror of the Postgres sr_norm(): lowercase and strip diacritics, so a stem
 * compared here matches exactly what the database would have matched. NFD
 * decomposition covers č ć š ž; đ is its own letter and needs a rule.
 */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d");
}

/** The topic a query names, by label or alias. Stems deliberately do not match. */
export function findSearchTopic(query: string): SearchTopic | null {
  const normalized = normalizeSearchText(query);
  if (!normalized) return null;
  return (
    SEARCH_TOPICS.find(
      (topic) =>
        normalizeSearchText(topic.label) === normalized ||
        topic.aliases?.some((alias) => normalizeSearchText(alias) === normalized),
    ) ?? null
  );
}

/** Ingredient stems to search for. Anything unrecognised searches for itself. */
export function resolveSearchTerms(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const topic = findSearchTopic(trimmed);
  return topic ? [...topic.terms] : [trimmed];
}

/** Display name for a query: a topic's own spelling, or what was typed. */
export function resolveSearchLabel(query: string): string {
  return findSearchTopic(query)?.label ?? query.trim();
}
