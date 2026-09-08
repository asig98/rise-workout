/* Weather for the "take it outside" card.

   Deliberately undemanding: it asks for location once, and if the person says
   no — or the browser has no geolocation, or the request fails — the hook
   returns nothing and the card doesn't render. A home workout app must not
   hold its main screen hostage to a permission prompt. */

import { useEffect, useRef, useState } from "react";
import { cached } from "../api/client";
import { fetchWeather, getPosition } from "../api/openMeteo";

const TEN_MINUTES = 10 * 60 * 1000;

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [state, setState] = useState("idle"); // idle | loading | ready | denied | error
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    setState("loading");

    (async () => {
      const pos = await getPosition();
      if (!alive.current) return;
      if (!pos) {
        setState("denied");
        return;
      }
      try {
        // Round the coordinates before they touch the cache key or the URL:
        // ~1km is plenty for "is it nice out", and there's no reason to send
        // or store a precise home address.
        const lat = pos.lat.toFixed(2);
        const lon = pos.lon.toFixed(2);
        const data = await cached(`weather:${lat},${lon}`, TEN_MINUTES, () =>
          fetchWeather({ lat, lon })
        );
        if (!alive.current) return;
        setWeather(data);
        setState("ready");
      } catch {
        if (alive.current) setState("error");
      }
    })();

    return () => {
      alive.current = false;
    };
  }, []);

  return { weather, state };
}
