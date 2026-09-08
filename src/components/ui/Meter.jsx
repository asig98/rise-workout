/* The thin progress bar: level progress on the Progress tab, and the
   set-by-set position indicator at the top of the guided player. */

export function Meter({ pct, id }) {
  return (
    <div className="meter">
      <div
        className="meter-fill"
        id={id}
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  );
}
