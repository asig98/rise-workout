/* API ② lives here — Open-Meteo.

   The point isn't to be a weather app. It's that the single best reason to
   skip a living-room workout is that it's genuinely nice outside, and Rise
   should say so and offer the swap rather than pretending the outdoors doesn't
   exist. When it's grim out, the card says that too — which is its own small
   encouragement to stay in and do the routine. */

import { Card, Button } from "../ui/Primitives";
import { useWeather } from "../../hooks/useWeather";

export function WeatherCard({ onSwapOutdoor, resting }) {
  const { weather, state } = useWeather();

  // No location permission, no signal, or a failed request: render nothing.
  // A workout app must not nag about a weather feature nobody asked for.
  if (state !== "ready" || !weather) return null;

  const { icon, temp, unitLabel, label, outdoorFriendly, wind } = weather;

  return (
    <Card className="weather-card rise" style={{ "--d": ".2s" }}>
      <span className="weather-icon" aria-hidden="true">{icon}</span>
      <div className="weather-text">
        <b>
          {temp}
          {unitLabel} · {label}
        </b>
        <p>
          {outdoorFriendly
            ? "Good conditions out there — the cardio block works just as well in a park."
            : `Not a day for it${wind >= 20 ? " (windy)" : ""}. Perfect excuse to train indoors.`}
        </p>
      </div>
      {outdoorFriendly && !resting && (
        <Button variant="quiet" className="weather-btn" onClick={onSwapOutdoor}>
          Take it outside
        </Button>
      )}
    </Card>
  );
}
