/* API ④ — API Ninjas, Calories Burned.
   https://api-ninjas.com/api/caloriesburned

   The only one of the four that needs a key. Put it in .env as
   VITE_API_NINJAS_KEY (see .env.example); without one the calories card simply
   doesn't render, and nothing else changes.

   What it gives Rise: the app knows what you did and for how long, so it can
   turn "14 finished workouts" into "roughly 1,240 kcal" — a number that means
   something to people in a way that a workout count doesn't. */

import { fetchJson, cached } from "./client";

const BASE = "https://api.api-ninjas.com/v1/caloriesburned";
const KEY = import.meta.env.VITE_API_NINJAS_KEY;

export const hasKey = Boolean(KEY);

/* The API matches on its own activity names, which don't line up with the
   names people give their exercises. This maps Rise's vocabulary onto the
   closest thing the endpoint knows about. */
const ACTIVITY_MAP = [
  [/burpee|jump squat|star jump|plank jack/i, "calisthenics"],
  [/push[- ]?up|press[- ]?up|dip|pike|diamond/i, "pushups"],
  [/sit[- ]?up|crunch|v-?up|toe touch/i, "situps"],
  [/plank|hollow|superman|bird dog|dead bug/i, "calisthenics"],
  [/squat|lunge|step[- ]?up|bridge|calf raise|wall sit/i, "calisthenics"],
  [/jumping jack|high knee|butt kick|fast feet|skater/i, "jumping rope"],
  [/mountain climber|climber/i, "calisthenics"],
  [/shadow ?box|box/i, "boxing"],
  [/stretch|pose|cat-?cow|cool ?down|neck roll|downward dog/i, "stretching"],
  [/run|jog|sprint/i, "running"],
  [/walk|march/i, "walking"],
];

export function activityFor(name) {
  for (const [re, activity] of ACTIVITY_MAP) {
    if (re.test(name)) return activity;
  }
  return "calisthenics";
}

/**
 * Calories for one activity.
 * @param {string} activity  an API Ninjas activity name
 * @param {number} minutes   duration
 * @param {number} weightLb  body weight in pounds (the API's own unit)
 * @returns {Promise<number|null>} kcal for the duration, or null if unknown
 */
export async function fetchCalories(activity, minutes, weightLb = 160) {
  if (!KEY) return null;

  const url =
    `${BASE}?activity=${encodeURIComponent(activity)}` +
    `&weight=${Math.round(weightLb)}&duration=${Math.max(1, Math.round(minutes))}`;

  // Cached for the session: the free tier is rate-limited, and the answer for
  // a given activity/duration/weight never changes.
  const key = `ninjas:${activity}:${Math.round(minutes)}:${Math.round(weightLb)}`;
  const rows = await cached(key, 60 * 60 * 1000, () =>
    fetchJson(url, { headers: { "X-Api-Key": KEY } })
  );

  if (!Array.isArray(rows) || !rows.length) return null;
  return rows[0].total_calories ?? null;
}

/**
 * Estimate the calories in one Rise workout.
 * Groups the routine's exercises by mapped activity so a 9-exercise workout
 * costs three requests, not nine.
 */
export async function estimateWorkoutCalories(routine, weightLb = 160, level = 0) {
  if (!KEY || !routine.length) return null;

  const byActivity = {};
  routine.forEach((ex) => {
    const sets = Math.max(1, ex.sets || 1);
    // Timed moves know their own duration; rep-based ones get ~3s per rep.
    const seconds = ex.seconds
      ? (ex.seconds + (ex.step || 0) * level) * sets
      : (ex.reps ? (ex.reps + (ex.step || 0) * level) * 3 * sets : 45 * sets);
    const a = activityFor(ex.name);
    byActivity[a] = (byActivity[a] || 0) + seconds;
  });

  const results = await Promise.all(
    Object.entries(byActivity).map(([activity, seconds]) =>
      fetchCalories(activity, seconds / 60, weightLb).catch(() => null)
    )
  );

  const total = results.reduce((sum, n) => sum + (n || 0), 0);
  return total > 0 ? Math.round(total) : null;
}
