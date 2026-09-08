/* Everything on the Progress tab is DERIVED from `history` + `restDays`.
   Nothing here is stored, so there is no way for a stat to drift out of sync
   with the ticks that produced it.

   In the vanilla app these read a module-level `S`; here they take state as
   arguments so they stay pure and can be memoised. */

import { dateKey, fmtTime, keyToDate, todayKey, weekStart } from "./dates";
import { PER_LEVEL, MAX_LEVEL } from "./content";

/* ---------- level / progressive overload ---------- */

export function dayComplete(history, key) {
  const h = history[key];
  return !!(h && h.t > 0 && h.c >= h.t);
}

export function totalDone(history) {
  return Object.keys(history).filter((k) => dayComplete(history, k)).length;
}

export function levelNow(history) {
  return Math.min(MAX_LEVEL, Math.floor(totalDone(history) / PER_LEVEL));
}

export function exReps(ex, lvl) {
  return ex.reps ? ex.reps + (ex.step || 0) * lvl : null;
}

export function exSecs(ex, lvl) {
  return ex.seconds ? ex.seconds + (ex.step || 0) * lvl : null;
}

export function hasGrown(ex, lvl) {
  return (ex.step || 0) > 0 && lvl > 0 && !!(ex.reps || ex.seconds);
}

export function setsOf(ex) {
  return Math.max(1, ex.sets || 1);
}

/** "3 sets × 0:45 · each leg" — the one-line target shown under a name. */
export function exDetail(ex, lvl) {
  const secs = exSecs(ex, lvl);
  const reps = exReps(ex, lvl);
  const setPart = ex.sets && ex.sets > 1 ? ex.sets + " sets × " : "";
  let base = secs ? setPart + fmtTime(secs) : reps ? setPart + reps : "";
  if (ex.note) base = base ? base + " · " + ex.note : ex.note;
  return base || "—";
}

/* ---------- rest days ---------- */

export function isRestDay(restDays, d) {
  return restDays.includes(d.getDay());
}

/* ---------- records ---------- */

export function bestWeek(history) {
  const b = {};
  Object.keys(history)
    .filter((k) => dayComplete(history, k))
    .forEach((k) => {
      const w = dateKey(weekStart(keyToDate(k)));
      b[w] = (b[w] || 0) + 1;
    });
  const v = Object.values(b);
  return v.length ? Math.max(...v) : 0;
}

export function bestMonth(history) {
  const b = {};
  Object.keys(history)
    .filter((k) => dayComplete(history, k))
    .forEach((k) => {
      b[k.slice(0, 7)] = (b[k.slice(0, 7)] || 0) + 1;
    });
  const v = Object.values(b);
  return v.length ? Math.max(...v) : 0;
}

/** A finished week where every non-rest day was completed. The current week
    is skipped — it isn't over yet, so it can't be "perfect". */
export function hadPerfectWeek(history, restDays) {
  const thisWeek = dateKey(weekStart(new Date()));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weeks = new Set();
  Object.keys(history)
    .filter((k) => dayComplete(history, k))
    .forEach((k) => weeks.add(dateKey(weekStart(keyToDate(k)))));

  for (const w of weeks) {
    if (w === thisWeek) continue;
    const start = keyToDate(w);
    let train = 0;
    let done = 0;
    let finished = true;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d > today) {
        finished = false;
        break;
      }
      if (isRestDay(restDays, d)) continue;
      train++;
      if (dayComplete(history, dateKey(d))) done++;
    }
    if (finished && train > 0 && done === train) return true;
  }
  return false;
}

/* ---------- streaks ---------- */

/** Rest days don't break a streak — they're part of the programme. */
export function currentStreak(history, restDays) {
  let n = 0;
  let guard = 0;
  const d = new Date();
  if (!dayComplete(history, todayKey())) d.setDate(d.getDate() - 1);
  while (guard++ < 400) {
    if (dayComplete(history, dateKey(d))) {
      n++;
      d.setDate(d.getDate() - 1);
    } else if (isRestDay(restDays, d)) {
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return n;
}

export function bestStreak(history, restDays) {
  const keys = Object.keys(history).sort();
  if (!keys.length) return 0;
  let best = 0;
  let run = 0;
  let guard = 0;
  const d = keyToDate(keys[0]);
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  while (d <= end && guard++ < 4000) {
    if (dayComplete(history, dateKey(d))) {
      run++;
      best = Math.max(best, run);
    } else if (!isRestDay(restDays, d)) {
      run = 0;
    }
    d.setDate(d.getDate() + 1);
  }
  return best;
}

/* ---------- badges ---------- */

export const BADGES = [
  { id: "first",  icon: "🌱", name: "First Step",   desc: "Finish one workout",  test: (s) => s.total >= 1 },
  { id: "w10",    icon: "💪", name: "Perfect Ten",  desc: "10 workouts",         test: (s) => s.total >= 10 },
  { id: "w25",    icon: "🎯", name: "Twenty-Five",  desc: "25 workouts",         test: (s) => s.total >= 25 },
  { id: "w50",    icon: "🏋️", name: "Half Century", desc: "50 workouts",         test: (s) => s.total >= 50 },
  { id: "w100",   icon: "💯", name: "Century Club", desc: "100 workouts",        test: (s) => s.total >= 100 },
  { id: "s7",     icon: "🔥", name: "Week Warrior", desc: "7-day streak",        test: (s) => s.streak >= 7 },
  { id: "s30",    icon: "⚡", name: "Unstoppable",  desc: "30-day streak",       test: (s) => s.streak >= 30 },
  { id: "perfect",icon: "✨", name: "Perfect Week", desc: "Every training day",  test: (s) => s.perfect },
  { id: "lvl5",   icon: "📈", name: "Levelling Up", desc: "Reach level 5",       test: (s) => s.level >= 4 },
  { id: "lvlmax", icon: "👑", name: "Maxed Out",    desc: "Reach the top level", test: (s) => s.level >= MAX_LEVEL },
];

export function earnedBadges(snap) {
  return BADGES.filter((b) => b.test(snap));
}

/* ---------- the snapshot used to detect what a workout earned ---------- */

export function snapshot(history, restDays) {
  return {
    streak: bestStreak(history, restDays),
    week: bestWeek(history),
    month: bestMonth(history),
    total: totalDone(history),
    level: levelNow(history),
    perfect: hadPerfectWeek(history, restDays),
  };
}

/* Milestones, not "every time the streak grows" — someone training daily beats
   their longest streak daily, and a trophy that fires every day is not a
   trophy. 7 and 30 are left out; badges already fire there. */
export const STREAK_MILESTONES = [3, 5, 10, 14, 21, 50, 75, 100, 150, 200, 365];

export function diffGains(before, after) {
  const records = [];
  if (after.streak > before.streak && STREAK_MILESTONES.includes(after.streak))
    records.push("🔥 " + after.streak + "-day streak");
  if (after.week > before.week && after.week >= 3)
    records.push("📅 Best week: " + after.week);
  if (after.month > before.month && after.month >= 5)
    records.push("🗓️ Best month: " + after.month);
  const had = earnedBadges(before).map((b) => b.id);
  return {
    records,
    badges: earnedBadges(after).filter((b) => !had.includes(b.id)),
    leveled: after.level > before.level,
  };
}
