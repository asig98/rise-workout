/* The checklist. Each row is a label wrapping a real checkbox, so tapping
   anywhere on the row toggles it and screen readers announce it correctly —
   the visible box is a styled <span>, the input itself is only visually
   hidden, never display:none. */

import { Card, EmptyNote } from "../ui/Primitives";
import { CheckIcon } from "../ui/Icons";
import { exDetail, exSecs, hasGrown } from "../../lib/stats";
import { fmtTime } from "../../lib/dates";

function ExerciseRow({ ex, level, checked, onToggle, onOpenTimer }) {
  const secs = exSecs(ex, level);

  return (
    <div className="exercise">
      <label className="tick">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(ex.id, e.target)}
        />
        <span className="box">
          <CheckIcon />
        </span>
        <span className="info">
          <span className="name">{ex.name}</span>
          <span className="detail">
            {exDetail(ex, level)}
            {hasGrown(ex, level) && (
              <span className="up" title="Increased since level 0">
                {"  ▲"}
              </span>
            )}
          </span>
        </span>
      </label>
      {secs ? (
        <button className="timer-chip" onClick={() => onOpenTimer(ex)}>
          ⏱ {fmtTime(secs)}
        </button>
      ) : null}
    </div>
  );
}

export function ExerciseList({ exercises, done, level, onToggle, onOpenTimer }) {
  return (
    <Card className="list-card rise" style={{ "--d": ".35s" }}>
      {exercises.length === 0 ? (
        <EmptyNote>
          No exercises yet.
          <br />
          Head to the Routine tab to add some.
        </EmptyNote>
      ) : (
        exercises.map((ex) => (
          <ExerciseRow
            key={ex.id}
            ex={ex}
            level={level}
            checked={done.includes(ex.id)}
            onToggle={onToggle}
            onOpenTimer={onOpenTimer}
          />
        ))
      )}
    </Card>
  );
}
