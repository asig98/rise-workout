/* The end-of-workout screen. `gains` is the diff between the snapshot taken
   before the workout was finished and the one after, so this can say exactly
   what was earned rather than just "well done". */

import { useEffect } from "react";
import { Button } from "../ui/Primitives";
import { useWorkout } from "../../state/WorkoutContext";
import { WINS } from "../../lib/content";

export function Celebration({ gains, onClose }) {
  useEffect(() => {
    if (!gains) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [gains, onClose]);

  const { level, streak } = useWorkout();
  if (!gains) return null;

  const isRecord = gains.records.length > 0 || gains.badges.length > 0;

  const chips = [
    ...gains.badges.map((b) => ({ cls: "gain", text: `${b.icon} ${b.name}` })),
    ...gains.records.map((r) => ({ cls: "gain", text: r })),
    ...(gains.leveled ? [{ cls: "gain lvl", text: `⚡ Level ${level + 1}` }] : []),
  ];

  const message = gains.badges.length
    ? "That one's going in the trophy case."
    : gains.records.length
    ? "You've never done better than this. Keep it there."
    : gains.leveled
    ? `You're on level ${level + 1} now — your targets just went up a notch.`
    : streak > 1
    ? `That's ${streak} days in a row. You're building something real.`
    : "You finished every exercise today. That's a win.";

  return (
    <div id="celebration" className="show" role="dialog" aria-label="Workout complete">
      <div className="celebrate-box">
        <span className="emoji">{isRecord ? "🏆" : "🎉"}</span>
        <h2 className={isRecord ? "record-title" : ""}>
          {isRecord ? "NEW RECORD!" : gains.title}
        </h2>
        <div className="gains">
          {chips.map((c, i) => (
            <span key={c.text} className={c.cls} style={{ "--gd": `${0.25 + i * 0.13}s` }}>
              {c.text}
            </span>
          ))}
        </div>
        <p>{message}</p>
        <Button onClick={onClose}>Keep it going</Button>
      </div>
    </div>
  );
}

/** Picked once when the celebration opens, so a re-render can't reshuffle it. */
export function randomWin() {
  return WINS[Math.floor(Math.random() * WINS.length)];
}
