/* One tooltip shared by the heatmap and the bar chart.

   Hover for a mouse, tap-with-timeout for a touchscreen — the heatmap squares
   are 11px, so "tap a square for the numbers" is the only way to read them on
   a phone, and the card says so.

   Tip content is passed as JSX rather than an HTML string: the vanilla version
   built markup with template literals, which works fine here but is one
   innerHTML sink nobody needs. */

import { useCallback, useEffect, useRef, useState } from "react";

export function useChartTip() {
  const [tip, setTip] = useState(null);
  const hideTimer = useRef(null);

  const show = useCallback((el, node, offsetY = 0) => {
    const r = el.getBoundingClientRect();
    setTip({ x: r.left + r.width / 2, y: r.top + offsetY, node });
  }, []);

  const hide = useCallback(() => {
    clearTimeout(hideTimer.current);
    setTip(null);
  }, []);

  /** Tap: show, then fade on a timer — there's no mouseleave on a touchscreen. */
  const tap = useCallback(
    (el, node, offsetY = 0) => {
      show(el, node, offsetY);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setTip(null), 2200);
    },
    [show]
  );

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  /** Spread onto any element to make it tippable. */
  const bind = useCallback(
    (node, offsetY = 0) => ({
      onMouseEnter: (e) => show(e.currentTarget, node, offsetY),
      onMouseLeave: hide,
      onClick: (e) => tap(e.currentTarget, node, offsetY),
      style: { cursor: "pointer" },
    }),
    [show, hide, tap]
  );

  return { tip, bind, hide };
}

export function ChartTip({ tip }) {
  const ref = useRef(null);
  const [left, setLeft] = useState(0);

  // Clamp to the viewport once the tip has a measurable width.
  useEffect(() => {
    if (!tip || !ref.current) return;
    const half = ref.current.offsetWidth / 2;
    setLeft(Math.max(half + 8, Math.min(tip.x, window.innerWidth - half - 8)));
  }, [tip]);

  return (
    <div
      id="chartTip"
      ref={ref}
      className={tip ? "show" : ""}
      style={tip ? { left, top: tip.y } : undefined}
    >
      {tip ? tip.node : null}
    </div>
  );
}
