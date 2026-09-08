/* API ③ — wger.  https://wger.de/en/software/api
   Open-source fitness database, ~880 exercises, no key required.

   This is what turns Rise's fixed 60-exercise list into a real library: search
   by name, filter by muscle group and by equipment, and add anything found
   straight into your routine.

   Note on endpoints: wger's old /exercise/search/ route now 404s, so this uses
   /exerciseinfo/ — which returns the exercise, its category, its muscles, its
   equipment and its translations in one call — and filters names client-side.
   Fewer round trips anyway. */

import { cached, fetchJson } from "./client";

const BASE = "https://wger.de/api/v2";
const ENGLISH = 2; // wger's language id for English
export const BODYWEIGHT_EQUIPMENT_ID = 7; // "none (bodyweight exercise)"

const DAY = 24 * 60 * 60 * 1000;

/** The eight category rows, fetched once and cached for a day. */
export function fetchCategories() {
  return cached("wger-categories", DAY, async () => {
    const data = await fetchJson(`${BASE}/exercisecategory/?format=json&limit=50`);
    return data.results || [];
  });
}

/** The twelve equipment rows, same deal. */
export function fetchEquipment() {
  return cached("wger-equipment", DAY, async () => {
    const data = await fetchJson(`${BASE}/equipment/?format=json&limit=50`);
    return data.results || [];
  });
}

/** Strip wger's HTML descriptions down to a sentence we can put on a card. */
function plain(html, max = 190) {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

/** Flatten one /exerciseinfo/ record into the shape the UI wants. */
function normalise(row) {
  const t =
    (row.translations || []).find((x) => x.language === ENGLISH && x.name) ||
    (row.translations || [])[0];
  if (!t || !t.name) return null;

  const muscles = [...(row.muscles || []), ...(row.muscles_secondary || [])]
    .map((m) => m.name_en || m.name)
    .filter(Boolean);

  return {
    id: row.id,
    name: t.name,
    description: plain(t.description),
    category: row.category ? row.category.name : "",
    equipment: (row.equipment || []).map((e) => e.name),
    bodyweight:
      !row.equipment.length ||
      row.equipment.some((e) => e.id === BODYWEIGHT_EQUIPMENT_ID),
    muscles: [...new Set(muscles)],
    image: (row.images || []).find((i) => i.is_main)?.image || null,
  };
}

/**
 * Search the library.
 * @param {object}  opts
 * @param {string}  opts.term       free-text name filter (client-side)
 * @param {number?} opts.category   wger category id, or null for all
 * @param {number?} opts.equipment  wger equipment id, or null for all
 * @param {number}  opts.limit      how many rows to pull from the API
 */
export async function searchExercises({
  term = "",
  category = null,
  equipment = null,
  limit = 120,
} = {}) {
  const params = new URLSearchParams({
    format: "json",
    language: String(ENGLISH),
    limit: String(limit),
  });
  if (category) params.set("category", String(category));
  if (equipment) params.set("equipment", String(equipment));

  const key = `wger-info:${category || "all"}:${equipment || "all"}:${limit}`;
  const data = await cached(key, DAY, () =>
    fetchJson(`${BASE}/exerciseinfo/?${params}`)
  );

  const rows = (data.results || []).map(normalise).filter(Boolean);
  const q = term.trim().toLowerCase();
  const matched = q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows;

  // Stable, useful ordering: shortest names first reads as "most basic first".
  return matched.sort((a, b) => a.name.length - b.name.length);
}

/** Map a wger row onto Rise's own exercise shape, ready for the routine form. */
export function toRiseExercise(row) {
  return {
    name: row.name,
    sets: 3,
    reps: 12,
    seconds: null,
    step: 1,
    note: row.muscles.length ? row.muscles[0].toLowerCase() : "",
  };
}
