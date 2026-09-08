/* The single reducer behind every change to a user's workout data.

   One rule holds the whole thing together: every action ends by rewriting
   history[today] from the current ticks. In the vanilla app that was a
   `recordToday()` call you had to remember at eleven different call sites —
   here it's a wrapper the reducer applies to its own output, so it cannot be
   forgotten. That matters because every stat on the Progress tab is derived
   from history, so a missed write silently loses a day. */

import { todayKey } from "../lib/dates";
import {
  DEFAULT_ROUTINE,
  generateOutdoorWorkout,
  generateWorkout,
} from "../lib/exercises";
import { initialState } from "./storage";

const activeOf = (s) => s.todayPlan || s.routine;
const restsToday = (s) => s.restDays.includes(new Date().getDay()) && !s.today.override;

/** Rewrite today's history entry to match the current ticks. */
function record(s) {
  const k = todayKey();
  const history = { ...s.history };
  if (restsToday(s) && s.today.done.length === 0) delete history[k];
  else history[k] = { c: s.today.done.length, t: activeOf(s).length };
  return { ...s, history };
}

export function workoutReducer(state, action) {
  switch (action.type) {
    /* ---------- Today ---------- */

    case "toggle": {
      const done = state.today.done.includes(action.id)
        ? state.today.done.filter((x) => x !== action.id)
        : [...state.today.done, action.id];
      return record({ ...state, today: { ...state.today, done } });
    }

    case "complete": {
      // Used by the timer and the guided player: tick, never untick.
      if (state.today.done.includes(action.id)) return state;
      return record({
        ...state,
        today: { ...state.today, done: [...state.today.done, action.id] },
      });
    }

    case "resetToday":
      return record({ ...state, today: { ...state.today, done: [] } });

    case "shuffle":
      return record({
        ...state,
        todayPlan: generateWorkout(),
        today: { ...state.today, done: [] },
      });

    case "shuffleOutdoor":
      // Fired by the weather card when Open-Meteo says it's nice out.
      return record({
        ...state,
        todayPlan: generateOutdoorWorkout(),
        today: { ...state.today, done: [] },
      });

    case "undoShuffle":
      return record({
        ...state,
        todayPlan: null,
        today: { ...state.today, done: [] },
      });

    case "overrideRest":
      return record({ ...state, today: { ...state.today, override: true } });

    /* ---------- Routine ---------- */

    case "toggleRestDay": {
      const has = state.restDays.includes(action.day);
      const restDays = has
        ? state.restDays.filter((x) => x !== action.day)
        : [...state.restDays, action.day];
      // Turning today into a training day clears a stale "work out anyway".
      const today =
        action.day === new Date().getDay()
          ? { ...state.today, override: false }
          : state.today;
      return record({ ...state, restDays, today });
    }

    case "addExercise": {
      const ex = {
        ...action.exercise,
        id: "e" + Date.now() + Math.floor(Math.random() * 999),
      };
      return record({ ...state, routine: [...state.routine, ex] });
    }

    case "updateExercise":
      return record({
        ...state,
        routine: state.routine.map((e) =>
          e.id === action.id ? { ...e, ...action.exercise } : e
        ),
      });

    case "deleteExercise":
      return record({
        ...state,
        routine: state.routine.filter((e) => e.id !== action.id),
        today: {
          ...state.today,
          done: state.today.done.filter((x) => x !== action.id),
        },
      });

    case "reorder": {
      const routine = [...state.routine];
      const [item] = routine.splice(action.from, 1);
      routine.splice(action.to, 0, item);
      return record({ ...state, routine });
    }

    /* Committed once when a drag ends. The list has already been reordered
       locally for the duration of the drag, so this writes the final order
       rather than replaying every intermediate swap into the store. */
    case "setRoutine":
      return record({ ...state, routine: action.routine });

    case "restoreDefault":
      return record({
        ...state,
        routine: JSON.parse(JSON.stringify(DEFAULT_ROUTINE)),
        todayPlan: null,
        today: { ...state.today, done: [] },
      });

    /* ---------- lifecycle ---------- */

    case "newDay":
      // Fired when the tab is left open past midnight.
      return record({
        ...state,
        todayPlan: null,
        today: { date: todayKey(), done: [], override: false },
      });

    case "reset":
      return record(initialState());

    default:
      return state;
  }
}
