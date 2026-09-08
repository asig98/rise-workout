/* The store. Three subtrees read and write this — Today ticks exercises,
   Routine edits the list, Progress reads the history — so it lives at the top
   rather than being drilled through three tab levels. */

import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { loadState, save } from "./storage";
import { workoutReducer } from "./workoutReducer";
import { todayKey } from "../lib/dates";
import {
  currentStreak,
  levelNow,
  snapshot,
  totalDone,
} from "../lib/stats";

const WorkoutContext = createContext(null);

export function WorkoutProvider({ children }) {
  const [state, dispatch] = useReducer(workoutReducer, null, loadState);

  // Persist on every change. Cheap: the object is a few KB at most.
  useEffect(() => {
    save(state);
  }, [state]);

  // Roll the day over if the app is left open past midnight (a PWA on a phone
  // home screen is often never actually closed).
  const dayRef = useRef(state.today.date);
  useEffect(() => {
    const id = setInterval(() => {
      const k = todayKey();
      if (k !== dayRef.current) {
        dayRef.current = k;
        dispatch({ type: "newDay" });
      }
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const value = useMemo(() => {
    const active = state.todayPlan || state.routine;
    return {
      ...state,
      dispatch,
      // Derived — recomputed only when the state that feeds them changes.
      active,
      isShuffled: !!state.todayPlan,
      resting:
        state.restDays.includes(new Date().getDay()) && !state.today.override,
      level: levelNow(state.history),
      streak: currentStreak(state.history, state.restDays),
      total: totalDone(state.history),
      snap: snapshot(state.history, state.restDays),
    };
  }, [state]);

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used inside <WorkoutProvider>");
  return ctx;
}
