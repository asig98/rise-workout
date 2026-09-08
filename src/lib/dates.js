/* Date helpers. Everything is keyed by local calendar day ("2026-09-08"),
   never by timestamp — a workout finished at 11pm belongs to that day, and
   toISOString() would push it into tomorrow for anyone west of UTC. */

export function pad(n) {
  return String(n).padStart(2, "0");
}

export function dateKey(d) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

export function todayKey() {
  return dateKey(new Date());
}

/** Parse a "2026-09-08" key back to a local midnight Date. */
export function keyToDate(key) {
  return new Date(key + "T00:00:00");
}

/** Monday of the week containing d. */
export function weekStart(d) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
  return s;
}

/** 45 -> "0:45", 300 -> "5:00", 90 -> "1:30" */
export function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? (s ? m + ":" + pad(s) : m + ":00") : "0:" + pad(s);
}

export function longDate(d = new Date()) {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
