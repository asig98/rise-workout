/* Calories for the Progress tab.

   Two numbers come out of this: what one run of the current routine costs, and
   what the user's finished workouts add up to. Body weight is a local input
   (nobody wants to type that into a server), remembered in localStorage. */

import { useEffect, useRef, useState } from "react";
import { estimateWorkoutCalories, hasKey } from "../api/apiNinjas";

const WEIGHT_KEY = "rise-weight-lb";
const DEFAULT_WEIGHT = 160;

export function readWeight() {
  try {
    const n = parseInt(localStorage.getItem(WEIGHT_KEY), 10);
    if (!isNaN(n) && n > 50 && n < 700) return n;
  } catch {
    /* ignore */
  }
  return DEFAULT_WEIGHT;
}

export function useCaloriesBurned(routine, level, totalWorkouts) {
  const [weight, setWeightState] = useState(readWeight);
  const [perWorkout, setPerWorkout] = useState(null);
  const [state, setState] = useState(hasKey ? "loading" : "nokey");
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    if (!hasKey || !routine.length) {
      setState(hasKey ? "empty" : "nokey");
      return;
    }
    setState("loading");
    estimateWorkoutCalories(routine, weight, level)
      .then((kcal) => {
        if (!alive.current) return;
        if (kcal == null) {
          setState("error");
          return;
        }
        setPerWorkout(kcal);
        setState("ready");
      })
      .catch(() => {
        if (alive.current) setState("error");
      });
    return () => {
      alive.current = false;
    };
    // routine.length + names are what matter; a re-order shouldn't refetch.
  }, [routine.map((e) => e.name).join("|"), routine.length, level, weight]);

  function setWeight(n) {
    setWeightState(n);
    try {
      localStorage.setItem(WEIGHT_KEY, String(n));
    } catch {
      /* ignore */
    }
  }

  return {
    state,
    perWorkout,
    lifetime: perWorkout != null ? perWorkout * totalWorkouts : null,
    weight,
    setWeight,
  };
}
