/* The progress ring, used in three places: the 92px one on the Today card, and
   the big one inside both the timer and the guided player.

   Everything cosmetic — size, stroke width, which gradient — stays in CSS,
   because the two big rings are responsive (`width:min(260px,72vw)`) and the
   player swaps to the blue gradient while resting via
   `#player.resting .player-ring .fill`. Inline styles would fight both.

   So this component contributes exactly one thing: the dash geometry.
   strokeDasharray is the full circumference and strokeDashoffset is what's
   left to go, which lets the CSS transition on offset animate the sweep. */

export function Ring({
  value,
  max,
  box = 92,      // viewBox units — the coordinate space the circles are drawn in
  radius = 38,
  size,          // optional fixed pixel size; omit to let CSS size it
  className = "ring",
  children,
}) {
  const circ = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const c = box / 2;

  return (
    <div
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg
        {...(size ? { width: size, height: size } : {})}
        viewBox={`0 0 ${box} ${box}`}
      >
        <circle className="track" cx={c} cy={c} r={radius} />
        <circle
          className="fill"
          cx={c}
          cy={c}
          r={radius}
          style={{ strokeDasharray: circ, strokeDashoffset: circ * (1 - pct) }}
        />
      </svg>
      {children}
    </div>
  );
}
