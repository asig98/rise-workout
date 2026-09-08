/* Tab 2. Reads only — every number here is derived from `history` and
   `restDays`, so there is no way for a stat to disagree with the ticks that
   produced it. */

import { Card, SectionTitle } from "../ui/Primitives";
import { Meter } from "../ui/Meter";
import { Heatmap } from "./Heatmap";
import { WeeklyBars } from "./WeeklyBars";
import { CaloriesCard } from "./CaloriesCard";
import { ChartTip, useChartTip } from "./ChartTip";
import { useWorkout } from "../../state/WorkoutContext";
import { todayKey } from "../../lib/dates";
import { BADGES, dayComplete } from "../../lib/stats";
import { MAX_LEVEL, PER_LEVEL } from "../../lib/content";

export function ProgressView() {
  const { history, restDays, routine, level, streak, total, snap } = useWorkout();
  const { tip, bind } = useChartTip();

  const into = total - level * PER_LEVEL;
  const maxed = level >= MAX_LEVEL;
  const month = todayKey().slice(0, 7);
  const thisMonth = Object.keys(history).filter(
    (k) => dayComplete(history, k) && k.slice(0, 7) === month
  ).length;

  return (
    <section className="view active" id="view-progress">
      <header style={{ marginBottom: 20 }}>
        <div className="eyebrow">
          <span className="dot" />
          <span>Your progress</span>
        </div>
        <h1 style={{ fontSize: "clamp(30px,7vw,42px)" }}>Progress.</h1>
      </header>

      <Card className="hero-card">
        <div className="hero-num">{streak}</div>
        <div className="hero-label">
          {streak === 0
            ? "day streak — finish today to start one"
            : streak === 1
            ? "day streak — come back tomorrow to make it two"
            : "days in a row"}
        </div>
      </Card>

      <Card className="level-card">
        <div className="level-top">
          <b>Level {level + 1}</b>
          <span>{maxed ? "Maxed out" : `${into} / ${PER_LEVEL} workouts`}</span>
        </div>
        <p>
          {maxed
            ? "You've reached the top level. Your targets stay here — time to edit the routine and set harder ones yourself."
            : `Every ${PER_LEVEL} finished workouts your targets go up. ${PER_LEVEL - into} more to level ${level + 2}.`}
        </p>
        <Meter pct={maxed ? 100 : (into / PER_LEVEL) * 100} />
      </Card>

      <div className="stat-grid">
        <Card className="stat">
          <b>{total}</b>
          <span>WORKOUTS DONE</span>
        </Card>
        <Card className="stat">
          <b>{thisMonth}</b>
          <span>THIS MONTH</span>
        </Card>
      </div>

      <CaloriesCard routine={routine} level={level} totalWorkouts={total} />

      <SectionTitle>Personal records</SectionTitle>
      <div className="record-grid">
        <Card className="record">
          <span className="ico">🔥</span>
          <b>{snap.streak}</b>
          <span>LONGEST STREAK</span>
        </Card>
        <Card className="record">
          <span className="ico">📅</span>
          <b>{snap.week}</b>
          <span>BEST WEEK</span>
        </Card>
        <Card className="record">
          <span className="ico">🗓️</span>
          <b>{snap.month}</b>
          <span>BEST MONTH</span>
        </Card>
      </div>

      <SectionTitle>Last 12 weeks</SectionTitle>
      <Heatmap history={history} restDays={restDays} bind={bind} />

      <SectionTitle>Last 8 weeks</SectionTitle>
      <WeeklyBars history={history} bind={bind} />

      <SectionTitle>Achievements</SectionTitle>
      <Card>
        <div className="badges">
          {BADGES.map((b) => {
            const on = b.test(snap);
            return (
              <div
                key={b.id}
                className={`badge${on ? " on" : ""}`}
                title={on ? `${b.name} — unlocked` : `Locked: ${b.desc}`}
              >
                <span className="ico">{b.icon}</span>
                <b>{b.name}</b>
                <span className="desc">{b.desc}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <footer>Consistency beats intensity.</footer>
      <ChartTip tip={tip} />
    </section>
  );
}
