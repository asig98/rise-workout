/* The shell: tab switching, the overlays, and the one piece of cross-cutting
   logic — noticing that a workout has just been finished.

   That watcher lives here rather than in the Today tab because two different
   things can finish a workout: ticking the last box, and the guided player
   running to the end. Both go through the store, so watching the store is the
   one place that catches both. */

import { useEffect, useRef, useState } from "react";
import { WorkoutProvider, useWorkout } from "./state/WorkoutContext";
import { ToastProvider } from "./components/ui/ToastContext";
import { ConfettiProvider, useConfetti } from "./components/overlays/ConfettiProvider";
import { Aurora } from "./components/ui/Aurora";
import { SvgGradients } from "./components/ui/SvgGradients";
import { TodayIcon, ChartIcon, ListIcon } from "./components/ui/Icons";
import { TodayView } from "./components/today/TodayView";
import { ProgressView } from "./components/progress/ProgressView";
import { RoutineView } from "./components/routine/RoutineView";
import { GuidedPlayer } from "./components/overlays/GuidedPlayer";
import { TimerOverlay } from "./components/overlays/TimerOverlay";
import { Celebration, randomWin } from "./components/overlays/Celebration";
import { useToast } from "./components/ui/ToastContext";
import { diffGains, dayComplete } from "./lib/stats";
import { todayKey } from "./lib/dates";

const TABS = [
  { id: "today", label: "Today", Icon: TodayIcon },
  { id: "progress", label: "Progress", Icon: ChartIcon },
  { id: "routine", label: "Routine", Icon: ListIcon },
];

function Shell() {
  const { active, today, history, snap } = useWorkout();
  const { bigConfetti } = useConfetti();
  const toast = useToast();

  const [tab, setTab] = useState("today");
  const [timerEx, setTimerEx] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [gains, setGains] = useState(null);

  /* --- the completion watcher ---
     `prevSnap` holds the snapshot as it was BEFORE the change that just
     landed, which is exactly what diffGains needs to say "this is a new
     record" rather than "you have a record". */
  const prevSnap = useRef(snap);
  const alreadyDone = useRef(dayComplete(history, todayKey()));
  const complete = active.length > 0 && today.done.length === active.length;

  useEffect(() => {
    if (complete && !alreadyDone.current) {
      alreadyDone.current = true;
      const g = diffGains(prevSnap.current, snap);
      const t = setTimeout(() => setGains({ ...g, title: randomWin() }), 320);
      return () => clearTimeout(t);
    }
    if (!complete) alreadyDone.current = false;
    prevSnap.current = snap;
  }, [complete, snap]);

  // Fire the confetti once the celebration is actually on screen.
  useEffect(() => {
    if (!gains) return;
    bigConfetti(gains.records.length > 0 || gains.badges.length > 0);
  }, [gains]);

  function switchTab(id) {
    setTab(id);
    window.scrollTo(0, 0);
  }

  return (
    <>
      <Aurora />
      <SvgGradients />

      <main className="app">
        {tab === "today" && (
          <TodayView
            onStartGuided={() => {
              if (!active.length) {
                toast("Add some exercises first.");
                return;
              }
              setPlaying(true);
            }}
            onOpenTimer={setTimerEx}
          />
        )}
        {tab === "progress" && <ProgressView />}
        {tab === "routine" && <RoutineView />}
      </main>

      <GuidedPlayer
        open={playing}
        onExit={() => {
          setPlaying(false);
          toast("Workout paused — your ticks are saved.");
        }}
        onFinish={() => setPlaying(false)}
      />

      <TimerOverlay ex={timerEx} onClose={() => setTimerEx(null)} />

      <Celebration gains={gains} onClose={() => setGains(null)} />

      <nav className="tabbar">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => switchTab(id)}
            aria-current={tab === id ? "page" : undefined}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}

export default function App() {
  return (
    <WorkoutProvider>
      <ToastProvider>
        <ConfettiProvider>
          <Shell />
        </ConfettiProvider>
      </ToastProvider>
    </WorkoutProvider>
  );
}
