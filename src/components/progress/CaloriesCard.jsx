/* API ④ lives here — API Ninjas' calories-burned endpoint.

   "14 workouts finished" is a number about the app. "About 1,240 kcal" is a
   number about your body, which is the one people actually came for. Body
   weight changes the answer a lot, so it's an input — kept in localStorage and
   never sent anywhere except as a bare number in the query.

   Without a key configured the card renders a short setup note instead, so a
   fresh clone explains itself rather than looking broken. */

import { Card } from "../ui/Primitives";
import { useCaloriesBurned } from "../../hooks/useCaloriesBurned";

export function CaloriesCard({ routine, level, totalWorkouts }) {
  const { state, perWorkout, lifetime, weight, setWeight } = useCaloriesBurned(
    routine,
    level,
    totalWorkouts
  );

  if (state === "nokey") {
    return (
      <Card className="calories-card muted">
        <div className="cal-main">
          <b>Calorie estimates are off</b>
          <p>
            Add a free API Ninjas key as <code>VITE_API_NINJAS_KEY</code> in{" "}
            <code>.env</code> to see roughly what each workout burns.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="calories-card">
      <span className="cal-icon" aria-hidden="true">🔥</span>
      <div className="cal-main">
        {state === "loading" && <b className="cal-loading">Estimating…</b>}
        {state === "error" && <b>Couldn't reach the calorie service</b>}
        {state === "empty" && <b>Add exercises to see an estimate</b>}
        {state === "ready" && (
          <>
            <b>
              ~{perWorkout} kcal <span>per workout</span>
            </b>
            <p>
              {totalWorkouts > 0
                ? `About ${lifetime.toLocaleString()} kcal across ${totalWorkouts} finished workout${totalWorkouts === 1 ? "" : "s"}.`
                : "Finish today's workout to start the running total."}
            </p>
          </>
        )}
      </div>

      <label className="cal-weight">
        <span>Your weight</span>
        <input
          type="number"
          min="60"
          max="600"
          value={weight}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (!isNaN(n) && n >= 60 && n <= 600) setWeight(n);
          }}
        />
        <span>lb</span>
      </label>
    </Card>
  );
}
