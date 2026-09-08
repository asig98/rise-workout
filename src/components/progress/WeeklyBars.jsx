/* Eight weeks of finished workouts, drawn as SVG.

   Hand-drawn rather than pulled from a chart library: the whole chart is one
   axis, eight bars and a label row, and a charting dependency would be larger
   than the app's entire bundle. The viewBox is in real pixels so a 10px label
   renders at 10px instead of being scaled by the aspect ratio.

   Each bar gets a full-height invisible hit rectangle — an 8px-wide bar is
   almost impossible to hover, and a zero-count week has no bar to aim at. */

import { useMemo } from "react";
import { Card } from "../ui/Primitives";
import { dateKey } from "../../lib/dates";
import { dayComplete } from "../../lib/stats";

const W = 340, H = 176, PAD_L = 24, PAD_R = 6, PAD_T = 18, PAD_B = 26;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const MAX = 7;

export function WeeklyBars({ history, bind }) {
  const weeks = useMemo(() => {
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

    const out = [];
    for (let w = 7; w >= 0; w--) {
      const s = new Date(monday);
      s.setDate(monday.getDate() - w * 7);
      let count = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(s);
        d.setDate(s.getDate() + i);
        if (dayComplete(history, dateKey(d))) count++;
      }
      out.push({
        label: s.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        short: `${s.getMonth() + 1}/${s.getDate()}`,
        count,
      });
    }
    return out;
  }, [history]);

  const band = PLOT_W / weeks.length;
  const barW = Math.min(band * 0.5, 24);
  const baseY = PAD_T + PLOT_H;

  return (
    <Card className="chart-card">
      <div className="chart-head">
        <h3>Workouts finished per week</h3>
        <p>A day counts only when every exercise was ticked off.</p>
      </div>

      <div id="barsWrap">
        <svg
          className="bars"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Bar chart of workouts finished each week for the last eight weeks"
        >
          {[0, 2, 4, 6].map((v) => {
            const y = PAD_T + PLOT_H * (1 - v / MAX);
            return (
              <g key={v}>
                <line className="grid-line" x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} />
                <text className="tick-text" x={PAD_L - 7} y={y + 3.5} textAnchor="end">
                  {v}
                </text>
              </g>
            );
          })}

          {weeks.map((wk, i) => {
            const cx = PAD_L + band * i + band / 2;
            const h = PLOT_H * (wk.count / MAX);
            const y = baseY - h;
            const r = Math.min(4, h / 2);
            const last = i === weeks.length - 1;

            return (
              <g key={wk.short}>
                {wk.count > 0 && (
                  <path
                    className="bar"
                    d={`M${cx - barW / 2} ${baseY}
                        L${cx - barW / 2} ${y + r} Q${cx - barW / 2} ${y} ${cx - barW / 2 + r} ${y}
                        L${cx + barW / 2 - r} ${y} Q${cx + barW / 2} ${y} ${cx + barW / 2} ${y + r}
                        L${cx + barW / 2} ${baseY} Z`}
                  />
                )}
                {last && wk.count > 0 && (
                  <text className="val-text" x={cx} y={y - 6} textAnchor="middle">
                    {wk.count}
                  </text>
                )}
                <text className="tick-text" x={cx} y={H - 8} textAnchor="middle">
                  {wk.short}
                </text>
                <rect
                  className="bar-hit"
                  x={cx - band / 2}
                  y={PAD_T}
                  width={band}
                  height={PLOT_H}
                  {...bind(
                    <>
                      Week of {wk.label} — <b>{wk.count}</b> of 7 days
                    </>,
                    14
                  )}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}
