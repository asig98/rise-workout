import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

/* Offline support. Rise is meant to be installed to a phone home screen and
   opened in a garage with no signal, so the service worker matters more here
   than it would for most apps. Registered only in production: in dev it would
   serve a stale cached bundle over Vite's hot reload.

   BASE_URL is "/" on Vercel and "/rise-workout/" on GitHub Pages, so the
   worker is registered — and scoped — correctly on both without a hardcoded
   path. */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((err) => console.log("Offline support not available here:", err.message));
  });
}
