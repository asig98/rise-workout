/* Tab 3. The only tab with real local state: which exercise is being edited,
   and what the library last handed to the form. */

import { useState } from "react";
import { Card, SectionTitle } from "../ui/Primitives";
import { EditableList } from "./EditableList";
import { ExerciseForm } from "./ExerciseForm";
import { LibraryBrowser } from "./LibraryBrowser";
import { useWorkout } from "../../state/WorkoutContext";
import { useToast } from "../ui/ToastContext";
import { DAY_FULL, DAY_NAMES } from "../../lib/content";

export function RoutineView() {
  const { routine, restDays, level, dispatch } = useWorkout();
  const toast = useToast();

  const [editing, setEditing] = useState(null);
  const [prefill, setPrefill] = useState(null);

  function handleSave(exercise) {
    if (editing) {
      dispatch({ type: "updateExercise", id: editing.id, exercise });
      toast("Saved.");
      setEditing(null);
    } else {
      dispatch({ type: "addExercise", exercise });
      toast("Added to your routine.");
    }
    setPrefill(null);
  }

  return (
    <section className="view active" id="view-routine">
      <header style={{ marginBottom: 20 }}>
        <div className="eyebrow">
          <span className="dot" />
          <span>Build your own</span>
        </div>
        <h1 style={{ fontSize: "clamp(30px,7vw,42px)" }}>Routine.</h1>
      </header>

      <Card className="rest-picker">
        <h3>Rest days</h3>
        <p>Tap a day to make it a rest day. Rest days never break your streak.</p>
        <div className="days">
          {DAY_NAMES.map((label, i) => {
            const rest = restDays.includes(i);
            const title = `${DAY_FULL[i]} — ${rest ? "rest day" : "training day"}`;
            return (
              <button
                key={i}
                className={`day-btn${rest ? " rest" : ""}`}
                title={title}
                aria-label={title}
                onClick={() => {
                  dispatch({ type: "toggleRestDay", day: i });
                  toast(
                    `${DAY_FULL[i]} is now a ${rest ? "training" : "rest"} day.`
                  );
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Card>

      <SectionTitle>Your exercises</SectionTitle>
      <EditableList
        routine={routine}
        level={level}
        onEdit={setEditing}
        onDelete={(id) => {
          dispatch({ type: "deleteExercise", id });
          if (editing?.id === id) setEditing(null);
          toast("Exercise removed.");
        }}
        onCommit={(next) => dispatch({ type: "setRoutine", routine: next })}
      />
      <p className="drag-hint">
        Hold the dotted handle on the left and drag to reorder.
        <br />
        Keyboard: tab to a handle, then use ↑ and ↓.
      </p>

      <LibraryBrowser
        onAdd={(exercise) => {
          setEditing(null);
          setPrefill({ ...exercise, _t: Date.now() });
          toast(`${exercise.name} loaded below — set your reps and add it.`);
        }}
      />

      <ExerciseForm
        editing={editing}
        prefill={prefill}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
        onError={toast}
      />

      <button
        className="reset"
        style={{ marginTop: 18 }}
        onClick={() => {
          dispatch({ type: "restoreDefault" });
          setEditing(null);
          toast("Starter routine restored.");
        }}
      >
        Restore the starter routine
      </button>

      <footer>Your routine is saved on this device.</footer>
    </section>
  );
}
