/* The reorderable routine list.

   Pointer events, not HTML5 drag-and-drop — that API does nothing at all on a
   touchscreen, and this is a phone app first.

   The one unusual thing here is `flushSync`. During a drag the list has to
   reorder itself and then immediately measure where the dragged row landed, so
   the baseline can be shifted by exactly that much and the row keeps tracking
   the finger 1:1. React's normal batching would defer the DOM update past the
   measurement, and the row would lag a slot behind on every swap. React moves
   keyed nodes rather than recreating them, so the element holding the pointer
   capture survives the reorder.

   Only the final order is dispatched, on pointerup. */

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { EmptyNote, IconButton } from "../ui/Primitives";
import { GripIcon, PencilIcon, TrashIcon } from "../ui/Icons";
import { exDetail } from "../../lib/stats";
import { buzz } from "../../lib/feedback";

function move(arr, from, to) {
  const out = [...arr];
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

export function EditableList({ routine, level, onEdit, onDelete, onCommit }) {
  const [items, setItems] = useState(routine);
  const listRef = useRef(null);
  const drag = useRef(null);

  // Follow the store whenever we aren't mid-drag.
  useEffect(() => {
    if (!drag.current) setItems(routine);
  }, [routine]);

  function handlePointerDown(e, index) {
    if (e.button !== undefined && e.button > 0) return; // left button / touch only
    e.preventDefault();
    const handle = e.currentTarget;
    const row = handle.closest(".edit-row");
    if (!row) return;

    drag.current = { index, pointerId: e.pointerId, startY: e.clientY, row, handle };
    row.classList.add("dragging");
    listRef.current?.classList.add("drag-active");
    // Capture on the HANDLE, not the row: capturing on the row would retarget
    // every later pointer event to the row, and these React handlers — which
    // live on the handle, a descendant — would simply stop firing.
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    buzz(12);
  }

  function handlePointerMove(e) {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    e.preventDefault();

    const dy = e.clientY - d.startY;
    d.row.style.transform = `translateY(${dy}px)`;

    const rows = [...listRef.current.querySelectorAll(".edit-row")];
    const dr = d.row.getBoundingClientRect();

    /* Swap when the LEADING edge of the dragged row crosses a neighbour's
       midpoint — its bottom edge going down, its top edge going up. Using the
       dragged row's centre instead means dropping it exactly on a row's centre
       sits right on the boundary and lands a slot short. */
    let target = d.index;
    rows.forEach((r, i) => {
      if (r === d.row) return;
      const rr = r.getBoundingClientRect();
      const mid = rr.top + rr.height / 2;
      if (i > d.index && dr.bottom > mid) target = Math.max(target, i);
      if (i < d.index && dr.top < mid) target = Math.min(target, i);
    });

    if (target !== d.index) {
      const natBefore = d.row.offsetTop; // position ignoring the transform
      const from = d.index;
      flushSync(() => setItems((arr) => move(arr, from, target)));
      d.startY += d.row.offsetTop - natBefore;
      d.index = target;
      d.row.style.transform = `translateY(${e.clientY - d.startY}px)`;
    }
  }

  function handlePointerUp() {
    const d = drag.current;
    if (!d) return;
    try {
      d.handle.releasePointerCapture(d.pointerId);
    } catch {
      /* ignore */
    }
    d.row.classList.remove("dragging");
    d.row.style.transform = "";
    listRef.current?.classList.remove("drag-active");
    drag.current = null;
    onCommit(items);
  }

  /* Keyboard equivalent — drag alone locks out anyone not using a pointer. */
  function handleKeyDown(e, index) {
    const dir = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
    if (!dir) return;
    e.preventDefault();
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = move(items, index, j);
    setItems(next);
    onCommit(next);
    requestAnimationFrame(() => {
      const handles = listRef.current?.querySelectorAll(".drag-handle");
      handles?.[j]?.focus();
    });
  }

  if (!routine.length) {
    return (
      <section className="card list-card" id="editList">
        <EmptyNote>
          Your routine is empty.
          <br />
          Add your first exercise below.
        </EmptyNote>
      </section>
    );
  }

  return (
    <section className="card list-card" id="editList" ref={listRef}>
      {items.map((ex, i) => (
        <div className="edit-row" key={ex.id} data-id={ex.id}>
          <button
            className="drag-handle"
            aria-label={`Reorder ${ex.name}. Use arrow up and arrow down keys to move it.`}
            title="Drag to reorder"
            onPointerDown={(e) => handlePointerDown(e, i)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            <GripIcon />
          </button>

          <span className="info">
            <span className="name">{ex.name}</span>
            <span className="detail">
              {exDetail(ex, level)}
              {(ex.step || 0) > 0 ? `   +${ex.step}/level` : ""}
            </span>
          </span>

          <span className="row-actions">
            <IconButton className="edit" aria-label={`Edit ${ex.name}`} title="Edit" onClick={() => onEdit(ex)}>
              <PencilIcon />
            </IconButton>
            <IconButton className="del" aria-label={`Delete ${ex.name}`} title="Delete" onClick={() => onDelete(ex.id)}>
              <TrashIcon />
            </IconButton>
          </span>
        </div>
      ))}
    </section>
  );
}
