/* Three blurred blobs drifting behind everything. Pure decoration — it sits
   at z-index -1 and takes no pointer events. */

export function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="blob one" />
      <div className="blob two" />
      <div className="blob three" />
    </div>
  );
}
