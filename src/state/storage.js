/* Persistence + migration.

   The storage key and the saved shape are UNCHANGED from the vanilla app, so
   anyone who has been using Rise keeps their whole history through the React
   rewrite. That's the reason the old migration routine is ported verbatim
   rather than cleaned up: it still has to understand the very first save
   format, which stored one free-text line like "3 sets × 45 seconds". */

import { DEFAULT_ROUTINE } from "../lib/exercises";
import { todayKey } from "../lib/dates";

export const KEY = "rise-v2";

/** Used when localStorage throws (Safari private mode, embedded webviews). */
let memoryFallback = null;

export function initialState() {
  return {
    routine: JSON.parse(JSON.stringify(DEFAULT_ROUTINE)),
    todayPlan: null,
    restDays: [0],
    today: { date: todayKey(), done: [], override: false },
    history: {},
  };
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* storage unavailable — fall through */
  }
  return memoryFallback;
}

export function save(state) {
  memoryFallback = state;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode — the in-memory copy still holds for this session */
  }
}

/** Fill in anything an older save is missing. */
function migrate(S) {
  if (!Array.isArray(S.restDays)) S.restDays = [0];
  if (!S.today) S.today = { date: todayKey(), done: [], override: false };
  if (!S.history) S.history = {};
  if (!Array.isArray(S.routine)) S.routine = JSON.parse(JSON.stringify(DEFAULT_ROUTINE));
  if (S.todayPlan === undefined) S.todayPlan = null;

  S.routine.forEach((e) => {
    if (e.sets === undefined) e.sets = 1;
    if (e.reps === undefined) e.reps = null;
    if (e.seconds === undefined) e.seconds = null;
    if (e.step === undefined) e.step = 0;

    // The oldest saves kept one free-text line like "3 sets × 45 seconds".
    // Pull real numbers out of it so levels have something to grow.
    if (e.note === undefined) {
      const old = e.detail || "";
      const setsM = old.match(/(\d+)\s*sets?/i);
      if (setsM) e.sets = Math.min(20, parseInt(setsM[1], 10));
      if (e.seconds == null) {
        const secM = old.match(/(\d+)\s*(?:seconds?|secs?)\b/i);
        const minM = old.match(/(\d+)\s*(?:minutes?|mins?)\b/i);
        if (secM) e.seconds = parseInt(secM[1], 10);
        else if (minM) e.seconds = parseInt(minM[1], 10) * 60;
      }
      if (e.seconds == null && e.reps == null) {
        const repM = old.match(/[×x]\s*(\d+)/i);
        if (repM) e.reps = parseInt(repM[1], 10);
      }
      // Strip the time phrase first, or "× 45 seconds" loses its number to the
      // "× N" rule and leaves a stray "seconds".
      e.note = old
        .replace(/\d+\s*(?:seconds?|secs?|minutes?|mins?)/gi, "")
        .replace(/\d+\s*sets?/gi, "")
        .replace(/[×x]\s*\d*/gi, "")
        .replace(/\s+/g, " ")
        .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "")
        .trim();
      if (e.step === 0) {
        if (e.seconds) e.step = 5;
        else if (e.reps) e.step = 1;
      }
    }
    delete e.detail;
  });
  return S;
}

/** Load, migrate, and roll over to a new day if the save is from yesterday. */
export function loadState() {
  const S = migrate(loadRaw() || initialState());

  // New day: clear the ticks and drop yesterday's shuffle.
  if (S.today.date !== todayKey()) {
    S.today = { date: todayKey(), done: [], override: false };
    S.todayPlan = null;
  }

  // Drop ticks for exercises that no longer exist in the active list.
  const active = S.todayPlan || S.routine;
  S.today.done = S.today.done.filter((id) => active.some((e) => e.id === id));

  return S;
}
