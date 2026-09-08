/* Tab 1. Owns no persistent state of its own — everything it shows comes from
   the store, everything it changes goes back through dispatch. The only local
   concern is which exercise the timer overlay is currently showing. */

import { Button, Card } from "../ui/Primitives";
import { Ring } from "../ui/Ring";
import { QuoteCard } from "./QuoteCard";
import { WeatherCard } from "./WeatherCard";
import { ExerciseList } from "./ExerciseList";
import { useWorkout } from "../../state/WorkoutContext";
import { useToast } from "../ui/ToastContext";
import { useConfetti } from "../overlays/ConfettiProvider";
import { longDate } from "../../lib/dates";
import { NUDGES } from "../../lib/content";
import { buzz } from "../../lib/feedback";

function progressTitle(total, done, pct) {
  if (total === 0) return "No exercises yet";
  if (done === 0) return "Let's get moving";
  if (pct < 50) return "Good start";
  if (pct < 100) return "Almost there";
  return "Workout complete!";
}

export function TodayView({ onStartGuided, onOpenTimer }) {
  const { active, today, dispatch, isShuffled, resting, level, streak } = useWorkout();
  const toast = useToast();
  const { burst } = useConfetti();

  const total = active.length;
  const done = today.done.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  function handleToggle(id, inputEl) {
    const wasChecked = today.done.includes(id);
    dispatch({ type: "toggle", id });

    // Celebration confetti is the completion watcher's job; this is just the
    // small per-tick reward. Side effects stay out of the reducer.
    if (!wasChecked) {
      const box = inputEl?.nextElementSibling;
      if (box) {
        const r = box.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 26);
      }
      toast(NUDGES[Math.floor(Math.random() * NUDGES.length)]);
      buzz(18);
    }
  }

  return (
    <section className="view active" id="view-today">
      <header className="rise" style={{ "--d": ".05s" }}>
        <div className="eyebrow">
          <span className="dot" />
          <span id="today">{longDate()}</span>
        </div>
        <div className="title-row">
          <div>
            <h1>Rise.</h1>
            <p className="subtitle">
              {resting
                ? "Today is a rest day. That's on purpose."
                : "Your workout, at home, today."}
            </p>
          </div>
          <div className="streak-pill">
            <span className="flame">🔥</span>
            <b>{streak}</b>
            <span>day streak</span>
          </div>
        </div>
      </header>

      <QuoteCard />

      <WeatherCard
        resting={resting}
        onSwapOutdoor={() => {
          dispatch({ type: "shuffleOutdoor" });
          toast("Outdoor workout ready 🌤️");
        }}
      />

      {resting ? (
        <Card className="rest-card rise" style={{ "--d": ".25s" }}>
          <span className="moon">🌙</span>
          <h2>Rest day</h2>
          <p>
            Muscle is built while you recover, not while you train. Taking today
            off is doing the programme, not skipping it.
          </p>
          <div className="safe">🔥 Your streak is safe</div>
          <div>
            <Button
              variant="quiet"
              onClick={() => {
                dispatch({ type: "overrideRest" });
                toast("Rest day overridden. Go get it.");
              }}
            >
              Work out anyway
            </Button>
          </div>
        </Card>
      ) : (
        <div id="trainingBlock">
          <Card className="progress-card rise" style={{ "--d": ".25s" }}>
            <Ring value={done} max={total} size={92} box={92} radius={38}>
              <div className="ring-label">
                <b>{pct}%</b>
                <span>done</span>
              </div>
            </Ring>
            <div className="progress-text">
              <h2>{progressTitle(total, done, pct)}</h2>
              <p>
                {done} of {total} exercise{total === 1 ? "" : "s"} complete
              </p>
            </div>
          </Card>

          {isShuffled && (
            <div className="shuffle-note">
              <span>🎲 Today's a shuffled workout — your saved routine is untouched.</span>
              <button
                onClick={() => {
                  dispatch({ type: "undoShuffle" });
                  toast("Back to your saved routine.");
                }}
              >
                Back to my routine
              </button>
            </div>
          )}

          <div className="action-row rise" style={{ "--d": ".3s" }}>
            <Button onClick={onStartGuided}>▶&nbsp;&nbsp;Start workout</Button>
            <Button
              variant="quiet"
              onClick={() => {
                dispatch({ type: "shuffle" });
                toast("New workout for today 🎲");
              }}
            >
              🎲&nbsp;&nbsp;Surprise me
            </Button>
          </div>

          <ExerciseList
            exercises={active}
            done={today.done}
            level={level}
            onToggle={handleToggle}
            onOpenTimer={onOpenTimer}
          />

          <button
            className="reset"
            onClick={() => {
              dispatch({ type: "resetToday" });
              toast("Reset — fresh start.");
            }}
          >
            Reset today's workout
          </button>
        </div>
      )}

      <footer>Move a little every day.</footer>
    </section>
  );
}
