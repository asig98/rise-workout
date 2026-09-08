/* The ⏱ chip's countdown for a single exercise.

   The tick lives in local state on purpose: at 1Hz in the global store it
   would re-render the heatmap's 84 cells and the eight-week bar chart once a
   second, for a number only this overlay displays. */

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/Primitives";
import { Ring } from "../ui/Ring";
import { useWorkout } from "../../state/WorkoutContext";
import { useConfetti } from "./ConfettiProvider";
import { exDetail, exSecs } from "../../lib/stats";
import { fmtTime } from "../../lib/dates";
import { beep, buzz } from "../../lib/feedback";

export function TimerOverlay({ ex, onClose }) {
  const { dispatch, level, today } = useWorkout();
  const { burst } = useConfetti();

  const total = ex ? exSecs(ex, level) : 0;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const closeTimer = useRef(null);

  // Reset whenever a different exercise opens the overlay.
  useEffect(() => {
    setLeft(total);
    setRunning(false);
    setFinished(false);
  }, [ex?.id, total]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((n) => n - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (left > 0 || !running) return;
    setRunning(false);
    setFinished(true);
    beep();
    buzz([120, 60, 120]);

    if (ex && !today.done.includes(ex.id)) {
      dispatch({ type: "complete", id: ex.id });
      burst(window.innerWidth / 2, window.innerHeight / 2, 40);
    }
    closeTimer.current = setTimeout(onClose, 900);
  }, [left, running]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Escape closes, like every other overlay in the app.
  useEffect(() => {
    if (!ex) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ex, onClose]);

  if (!ex) return null;

  return (
    <div id="timerOverlay" className="show" role="dialog" aria-label={`Timer for ${ex.name}`}>
      <div className="timer-box">
        <div className="timer-name">{ex.name}</div>
        <div className="timer-detail">{exDetail(ex, level)}</div>

        <Ring
          value={Math.max(0, left)}
          max={total || 1}
          box={200}
          radius={92}
          className="timer-ring"
        >
          <div className="timer-count">{fmtTime(Math.max(0, left))}</div>
        </Ring>

        <div className="timer-actions">
          <Button
            onClick={() => {
              if (running) {
                setRunning(false);
              } else {
                if (left <= 0) setLeft(total);
                setFinished(false);
                setRunning(true);
              }
            }}
          >
            {running ? "Pause" : finished ? "Again" : left < total ? "Resume" : "Start"}
          </Button>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
