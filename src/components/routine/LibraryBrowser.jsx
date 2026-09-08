/* API ③ lives here — the wger exercise database.

   This is the feature that changes what Rise is. The old app shipped 60
   exercises and that was the ceiling; this searches ~880, filtered by muscle
   group and by equipment, and drops any of them into your routine.

   Defaults to bodyweight-only, because Rise is a home workout app and a list
   full of cable-machine work would be noise for most people. */

import { useEffect, useState } from "react";
import { Card, Button, SectionTitle, EmptyNote } from "../ui/Primitives";
import { useExerciseSearch } from "../../hooks/useExerciseSearch";
import {
  BODYWEIGHT_EQUIPMENT_ID,
  fetchCategories,
  fetchEquipment,
  toRiseExercise,
} from "../../api/wger";

export function LibraryBrowser({ onAdd }) {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState(null);
  const [equipment, setEquipment] = useState(BODYWEIGHT_EQUIPMENT_ID);
  const [categories, setCategories] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [open, setOpen] = useState(false);

  const { results, loading, offline } = useExerciseSearch({ term, category, equipment });

  // Filter options come from the API too — hardcoding ids would rot.
  useEffect(() => {
    if (!open) return;
    fetchCategories().then(setCategories).catch(() => setCategories([]));
    fetchEquipment().then(setEquipmentList).catch(() => setEquipmentList([]));
  }, [open]);

  if (!open) {
    return (
      <>
        <SectionTitle>Exercise library</SectionTitle>
        <Card className="library-card">
          <div className="library-intro">
            <b>Browse 880+ exercises</b>
            <p>
              Search the open wger database by muscle group and equipment, and
              add anything straight to your routine.
            </p>
          </div>
          <Button variant="quiet" onClick={() => setOpen(true)}>
            Open the library
          </Button>
        </Card>
      </>
    );
  }

  return (
    <>
      <SectionTitle>Exercise library</SectionTitle>
      <Card className="library-card open">
        <div className="library-controls">
          <input
            type="search"
            className="library-search"
            placeholder="Search exercises…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            aria-label="Search the exercise library"
          />
          <div className="library-filters">
            <select
              value={category ?? ""}
              onChange={(e) => setCategory(e.target.value ? Number(e.target.value) : null)}
              aria-label="Filter by muscle group"
            >
              <option value="">All muscles</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={equipment ?? ""}
              onChange={(e) => setEquipment(e.target.value ? Number(e.target.value) : null)}
              aria-label="Filter by equipment"
            >
              <option value="">Any equipment</option>
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.id === BODYWEIGHT_EQUIPMENT_ID ? "Bodyweight only" : eq.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {offline && (
          <p className="library-note">
            Couldn't reach wger — showing Rise's own {results.length} built-in exercises.
          </p>
        )}

        <div className="library-results">
          {loading && <p className="library-loading">Searching…</p>}

          {!loading && results.length === 0 && (
            <EmptyNote>Nothing matched. Try a different word or clear the filters.</EmptyNote>
          )}

          {!loading &&
            results.slice(0, 40).map((row) => (
              <div className="library-row" key={row.id}>
                <div className="library-info">
                  <b>{row.name}</b>
                  <span className="library-meta">
                    {[row.category, ...(row.bodyweight ? ["bodyweight"] : row.equipment)]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  {row.description && <p>{row.description}</p>}
                </div>
                <button className="library-add" onClick={() => onAdd(toRiseExercise(row))}>
                  + Add
                </button>
              </div>
            ))}

          {!loading && results.length > 40 && (
            <p className="library-note">
              Showing 40 of {results.length}. Narrow it down with the search box.
            </p>
          )}
        </div>

        <Button variant="quiet" onClick={() => setOpen(false)}>
          Close the library
        </Button>
      </Card>
    </>
  );
}
