/* Full-screen guided mode: work, rest, work, rest, next exercise, all the way
   through the routine. Timed moves count themselves down; rep-based moves wait
   for a tap, because only the person doing them knows when twelve is twelve.

   All of the player's position lives here rather than in the store — it ticks
   every second and is meaningless the moment the player closes.

   One interval drives everything. Transitions happen inside that tick rather
   than in an effect watching `left === 0`, because an effect would re-fire on
   every unrelated re-render that happened to land on zero. */

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/Primitives";
import { Ring } from "../ui/Ring";

import { useWorkout } from "../../state/WorkoutContext";
import { useConfetti } from "./ConfettiProvider";
import { exReps, exSecs, setsOf } from "../../lib/stats";
import { fmtTime } from "../../lib/dates";
import { EX_REST, SET_REST } from "../../lib/content";
import { beep, buzz } from "../../lib/feedback";

const START = {
  exIdx: 0,
  setIdx: 0,
  phase: "work",
  left: 0,
  total: 0,
  running: false,
  next: "",
};

export function GuidedPlayer({ open, onExit, onFinish }) {
  const { active, today, dispatch, level } = useWorkout();
  const { burst } = useConfetti();

  const [p, setP] = useState(START);
  const pRef = useRef(START);
  const wake = useRef(null);

  const set = (patch) => {
    pRef.current = { ...pRef.current, ...patch };
    setP(pRef.current);
  };

  /* ---------- phases ---------- */

  function beginWork(exIdx, setIdx) {
    const ex = active[exIdx];
    if (!ex) return;
    const secs = exSecs(ex, level);
    set({
      exIdx,
      setIdx,
      phase: "work",
      next: "",
      total: secs || 0,
      left: secs || 0,
      running: !!secs, // timed moves start counting; rep moves wait for a tap
    });
  }

  function beginRest(seconds, nextText, exIdx, setIdx) {
    set({
      exIdx,
      setIdx,
      phase: "rest",
      total: seconds,
      left: seconds,
      running: true,
      next: nextText,
    });
  }

  /** A set just ended: rest between sets, move to the next exercise, or finish. */
  function completeSet(s = pRef.current) {
    beep();
    buzz([90, 50, 90]);

    const ex = active[s.exIdx];
    if (!ex) return;

    if (s.setIdx < setsOf(ex) - 1) {
      beginRest(SET_REST, `${ex.name} · set ${s.setIdx + 2}`, s.exIdx, s.setIdx + 1);
      return;
    }

    // Exercise done — tick it off quietly; the celebration waits for the end.
    dispatch({ type: "complete", id: ex.id });
    burst(window.innerWidth / 2, window.innerHeight * 0.42, 30);

    if (s.exIdx < active.length - 1) {
      beginRest(EX_REST, active[s.exIdx + 1].name, s.exIdx + 1, 0);
    } else {
      close();
      onFinish();
    }
  }

  function afterRest(s = pRef.current) {
    beep(true);
    beginWork(s.exIdx, s.setIdx);
  }

  /* ---------- lifecycle ---------- */

  useEffect(() => {
    if (!open) return;

    // Start at the first exercise that isn't already ticked off.
    let idx = active.findIndex((e) => !today.done.includes(e.id));
    if (idx < 0) idx = 0;
    beginWork(idx, 0);

    document.body.style.overflow = "hidden";

    // Keep the screen awake mid-workout where the browser allows it.
    (async () => {
      try {
        if ("wakeLock" in navigator) wake.current = await navigator.wakeLock.request("screen");
      } catch {
        /* not supported, or denied in the background — no matter */
      }
    })();

    return () => {
      document.body.style.overflow = "";
      try {
        wake.current?.release();
      } catch {
        /* ignore */
      }
      wake.current = null;
    };
  }, [open]);

  // The single clock.
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      const s = pRef.current;
      if (!s.running) return;
      const next = s.left - 1;
      set({ left: next });
      if (next <= 0) {
        const now = { ...pRef.current, running: false };
        pRef.current = now;
        setP(now);
        if (s.phase === "work") completeSet(now);
        else afterRest(now);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [open, active, level]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleExit();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    set({ running: false });
  }

  function handleExit() {
    close();
    onExit();
  }

  if (!open || !active.length) return null;

  const ex = active[p.exIdx];
  if (!ex) return null;

  const secs = exSecs(ex, level);
  const reps = exReps(ex, level);
  const resting = p.phase === "rest";
  const setsDone =
    active.slice(0, p.exIdx).reduce((n, e) => n + setsOf(e), 0) + p.setIdx;
  const totalSets = active.reduce((n, e) => n + setsOf(e), 0);

  return (
    <div id="player" className={`show${resting ? " resting" : ""}`} role="dialog" aria-label="Guided workout">
      <div className="player-top">
        <span className="player-step">
          Exercise {p.exIdx + 1} of {active.length}
        </span>
        <button className="player-exit" onClick={handleExit}>
          Exit
        </button>
      </div>
      <div className="player-bar">
        <div style={{ width: `${Math.round((setsDone / Math.max(1, totalSets)) * 100)}%` }} />
      </div>

      <div className="player-mid">
        <span className="player-label">{resting ? "Rest" : "Now"}</span>
        <div className="player-name">{resting ? "Breathe" : ex.name}</div>
        <div className="player-target">
          {resting ? "" : secs ? fmtTime(secs) : reps ? `${reps} reps` : "Go"}
        </div>
        <div className="player-sets">
          {resting ? "" : setsOf(ex) > 1 ? `Set ${p.setIdx + 1} of ${setsOf(ex)}` : ex.note || ""}
        </div>

        {resting || secs ? (
          <Ring
            value={Math.max(0, p.left)}
            max={p.total || 1}
            box={200}
            radius={92}
            className="player-ring"
          >
            <div className="player-count">{fmtTime(Math.max(0, p.left))}</div>
          </Ring>
        ) : (
          <div className="player-reps">{reps || "—"}</div>
        )}

        {resting && p.next && (
          <div className="player-next">
            Up next: <b>{p.next}</b>
          </div>
        )}
      </div>

      <div className="player-actions">
        <Button
          onClick={() => {
            const s = pRef.current;
            if (s.phase === "rest") {
              set({ running: false });
              afterRest({ ...s, running: false });
              return;
            }
            if (secs) {
              set({ running: !s.running }); // pause / resume a timed move
            } else {
              completeSet(s); // rep-based: the tap IS the finish
            }
          }}
        >
          {resting ? "Skip rest" : secs ? (p.running ? "Pause" : "Resume") : "Done"}
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            const s = pRef.current;
            if (s.phase === "rest") {
              handleExit();
              return;
            }
            set({ running: false });
            completeSet({ ...s, running: false });
          }}
        >
          {resting ? "Exit" : "Skip"}
        </Button>
      </div>
    </div>
  );
}
