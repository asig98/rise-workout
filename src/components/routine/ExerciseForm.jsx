/* Add / edit one exercise. Doubles as the landing spot for anything added from
   the wger library, so a person still chooses their own sets and reps before
   it joins the routine.

   A controlled form with one state object rather than six useStates — the
   whole thing is filled and cleared as a unit. */

import { useEffect, useRef, useState } from "react";
import { Card, Button, Field } from "../ui/Primitives";

const BLANK = { name: "", sets: "", reps: "", seconds: "", step: "", note: "" };

function numOrNull(value, min, max) {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < min) return null;
  return Math.min(n, max);
}

export function ExerciseForm({ editing, prefill, onSave, onCancel, onError }) {
  const [form, setForm] = useState(BLANK);
  const nameRef = useRef(null);

  // Load an exercise into the form when the edit button is pressed…
  useEffect(() => {
    if (!editing) return;
    setForm({
      name: editing.name || "",
      sets: editing.sets || "",
      reps: editing.reps || "",
      seconds: editing.seconds || "",
      step: editing.step || "",
      note: editing.note || "",
    });
    nameRef.current?.focus();
    nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [editing]);

  // …or when one arrives from the library.
  useEffect(() => {
    if (!prefill) return;
    setForm({
      name: prefill.name || "",
      sets: prefill.sets || "",
      reps: prefill.reps || "",
      seconds: prefill.seconds || "",
      step: prefill.step || "",
      note: prefill.note || "",
    });
    nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [prefill]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSave() {
    const name = form.name.trim();
    if (!name) {
      onError("Give the exercise a name first.");
      nameRef.current?.focus();
      return;
    }
    const seconds = numOrNull(form.seconds, 1, 3600);
    const reps = seconds ? null : numOrNull(form.reps, 1, 500);
    const sets = numOrNull(form.sets, 1, 20) || 1;
    const step = numOrNull(form.step, 0, 50) || 0;
    const note = form.note.trim();

    if (!seconds && !reps && !note) {
      onError("Add reps, seconds, or a note so there's something to aim for.");
      return;
    }

    onSave({ name, sets, reps, seconds, step, note });
    setForm(BLANK);
  }

  return (
    <Card className="form-card">
      <h3>{editing ? "Edit exercise" : "Add an exercise"}</h3>

      <Field label="Exercise name" htmlFor="fName">
        <input
          id="fName"
          ref={nameRef}
          type="text"
          placeholder="e.g. Burpees"
          maxLength={40}
          value={form.name}
          onChange={set("name")}
        />
      </Field>

      <div className="field-row">
        <Field label="Sets" htmlFor="fSets">
          <input id="fSets" type="number" min="1" max="20" placeholder="3" value={form.sets} onChange={set("sets")} />
        </Field>
        <Field label="Reps" htmlFor="fReps">
          <input id="fReps" type="number" min="1" max="500" placeholder="12" value={form.reps} onChange={set("reps")} />
        </Field>
        <Field label="Seconds" htmlFor="fSeconds">
          <input id="fSeconds" type="number" min="5" max="3600" step="5" placeholder="45" value={form.seconds} onChange={set("seconds")} />
        </Field>
      </div>

      <p className="hint" style={{ margin: "-4px 0 14px" }}>
        Fill in <b>reps</b> or <b>seconds</b>, not both. Seconds also adds a ⏱ button.
      </p>

      <Field
        label="Add per level"
        htmlFor="fStep"
        hint="How much harder this gets each level — e.g. 1 adds one rep, 5 adds five seconds. Leave blank or 0 to keep it fixed."
      >
        <input id="fStep" type="number" min="0" max="50" placeholder="1" value={form.step} onChange={set("step")} />
      </Field>

      <Field label="Note (optional)" htmlFor="fNote">
        <input id="fNote" type="text" placeholder="e.g. each leg" maxLength={30} value={form.note} onChange={set("note")} />
      </Field>

      <div className="form-actions">
        <Button onClick={handleSave}>{editing ? "Save changes" : "Add exercise"}</Button>
        {editing && (
          <Button
            variant="quiet"
            onClick={() => {
              setForm(BLANK);
              onCancel();
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}
