/* Twelve weeks of daily completion, one square per day.

   The grid starts on the Monday on or before "84 days ago", so the columns
   line up as whole weeks instead of drifting — that's what the `shift` is for.
   Future days in the current week render transparent so the block stays
   rectangular. */

import { useMemo } from "react";
import { Card } from "../ui/Primitives";
import { dateKey, todayKey } from "../../lib/dates";
import { isRestDay } from "../../lib/stats";

function heatLevel(history, key) {
  const h = history[key];
  if (!h || h.t === 0 || h.c === 0) return 0;
  const r = h.c / h.t;
  return r >= 1 ? 4 : r >= 0.66 ? 3 : r >= 0.33 ? 2 : 1;
}

export function Heatmap({ history, restDays, bind }) {
  const cells = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 83);
    const shift = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - shift);

    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const tk = todayKey();

    const out = [];
    for (let i = 0; i < 84 + shift; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = dateKey(d);
      const future = d > now;
      const h = history[key];
      out.push({
        key,
        future,
        rest: !h && isRestDay(restDays, d),
        level: heatLevel(history, key),
        today: key === tk,
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        entry: h,
        isRest: isRestDay(restDays, d),
      });
    }
    return out;
  }, [history, restDays]);

  return (
    <Card className="chart-card">
      <div className="chart-head">
        <h3>Daily completion</h3>
        <p>
          Each square is one day. Brighter means more of that day's workout
          finished. Tap a square for the numbers.
        </p>
      </div>

      <div className="heat-wrap">
        <div className="heat">
          {cells.map((c, i) =>
            c.future ? (
              <div key={i} className="heat-cell" style={{ background: "transparent" }} />
            ) : (
              <div
                key={i}
                className={`heat-cell${c.rest ? " rest" : ""}${c.today ? " today" : ""}`}
                style={c.rest ? undefined : { background: `var(--heat-${c.level})` }}
                {...bind(
                  c.entry && c.entry.t ? (
                    <>
                      {c.label} — <b>{c.entry.c}/{c.entry.t}</b> exercises
                    </>
                  ) : (
                    <>
                      {c.label} — {c.isRest ? "Rest day" : "Nothing logged"}
                    </>
                  ),
                  0
                )}
              />
            )
          )}
        </div>
      </div>

      <div className="heat-legend">
        <span className="rest-key" />
        <span>Rest day</span>
        <span className="sep" />
        <span>Less</span>
        <span className="swatch" style={{ background: "var(--heat-0)" }} />
        <span className="swatch" style={{ background: "var(--heat-1)" }} />
        <span className="swatch" style={{ background: "var(--heat-2)" }} />
        <span className="swatch" style={{ background: "var(--heat-3)" }} />
        <span className="swatch" style={{ background: "var(--heat-4)" }} />
        <span>More</span>
      </div>
    </Card>
  );
}
