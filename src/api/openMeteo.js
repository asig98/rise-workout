/* API ② — Open-Meteo.  https://open-meteo.com/en/docs
   No key, no signup, CORS open. Powers the "take it outside" card: Rise is a
   home workout app, and the one good reason to skip the living room is that
   it's 72° and clear out. */

import { fetchJson } from "./client";

const BASE = "https://api.open-meteo.com/v1/forecast";

/* WMO weather interpretation codes, grouped into what a person going outside
   to exercise actually cares about. */
const WMO = {
  0:  { label: "clear",           icon: "☀️", good: true },
  1:  { label: "mostly clear",    icon: "🌤️", good: true },
  2:  { label: "partly cloudy",   icon: "⛅", good: true },
  3:  { label: "overcast",        icon: "☁️", good: true },
  45: { label: "foggy",           icon: "🌫️", good: false },
  48: { label: "freezing fog",    icon: "🌫️", good: false },
  51: { label: "light drizzle",   icon: "🌦️", good: false },
  53: { label: "drizzle",         icon: "🌦️", good: false },
  55: { label: "heavy drizzle",   icon: "🌦️", good: false },
  61: { label: "light rain",      icon: "🌧️", good: false },
  63: { label: "rain",            icon: "🌧️", good: false },
  65: { label: "heavy rain",      icon: "🌧️", good: false },
  71: { label: "light snow",      icon: "🌨️", good: false },
  73: { label: "snow",            icon: "🌨️", good: false },
  75: { label: "heavy snow",      icon: "❄️", good: false },
  80: { label: "rain showers",    icon: "🌦️", good: false },
  81: { label: "rain showers",    icon: "🌧️", good: false },
  82: { label: "heavy showers",   icon: "⛈️", good: false },
  85: { label: "snow showers",    icon: "🌨️", good: false },
  86: { label: "snow showers",    icon: "❄️", good: false },
  95: { label: "thunderstorms",   icon: "⛈️", good: false },
  96: { label: "thunderstorms",   icon: "⛈️", good: false },
  99: { label: "thunderstorms",   icon: "⛈️", good: false },
};

function describe(code) {
  return WMO[code] || { label: "unsettled", icon: "🌡️", good: false };
}

/** Ask the browser where we are. Resolves to null rather than rejecting —
    a declined permission prompt is a normal outcome, not an error. */
export function getPosition() {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 7000, maximumAge: 30 * 60 * 1000 }
    );
  });
}

export async function fetchWeather({ lat, lon, unit = "fahrenheit" }) {
  const url =
    `${BASE}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,precipitation` +
    `&temperature_unit=${unit}&wind_speed_unit=mph`;

  const data = await fetchJson(url);
  const c = data.current;
  const sky = describe(c.weather_code);
  const temp = Math.round(c.temperature_2m);

  /* "Good for outdoors" is a judgement, so it's spelled out rather than
     buried: dry skies, not freezing, not baking, not a gale. */
  const outdoorFriendly =
    sky.good && temp >= 45 && temp <= 88 && c.wind_speed_10m < 20 && c.precipitation === 0;

  return {
    temp,
    unitLabel: unit === "fahrenheit" ? "°F" : "°C",
    code: c.weather_code,
    label: sky.label,
    icon: sky.icon,
    wind: Math.round(c.wind_speed_10m),
    precipitation: c.precipitation,
    outdoorFriendly,
  };
}
