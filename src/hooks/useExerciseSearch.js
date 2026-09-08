/* Drives the library browser on the Routine tab.

   Debounces the search box, cancels a stale request when the filters change
   under it, and falls back to Rise's own bundled 60-exercise list when wger
   can't be reached — so the browser is never an empty box. */

import { useEffect, useRef, useState } from "react";
import { searchExercises } from "../api/wger";
import { LIBRARY } from "../lib/exercises";

const CAT_LABEL = {
  warmup: "Warm up",
  cardio: "Cardio",
  push: "Upper body",
  legs: "Legs",
  core: "Abs",
  cooldown: "Cool down",
};

/** Shape the bundled library like a wger result so the UI has one code path. */
function bundledFallback(term) {
  const q = term.trim().toLowerCase();
  return LIBRARY.filter((e) => !q || e.name.toLowerCase().includes(q)).map((e) => ({
    id: "local-" + e.id,
    name: e.name,
    description: e.note || "",
    category: CAT_LABEL[e.cat] || "",
    equipment: [],
    bodyweight: true,
    muscles: [],
    image: null,
    local: true,
  }));
}

export function useExerciseSearch({ term, category, equipment }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);

    const timer = setTimeout(() => {
      searchExercises({ term, category, equipment })
        .then((rows) => {
          if (id !== reqId.current) return; // a newer search has started
          setResults(rows);
          setOffline(false);
        })
        .catch(() => {
          if (id !== reqId.current) return;
          setResults(bundledFallback(term));
          setOffline(true);
        })
        .finally(() => {
          if (id === reqId.current) setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [term, category, equipment]);

  return { results, loading, offline };
}
